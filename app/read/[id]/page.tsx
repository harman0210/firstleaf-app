"use client"
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

//import  PdfViewer  from '@/components/PdfViewer'
import dynamic from 'next/dynamic'
//const PdfViewer = dynamic(() => import('@/components/PdfViewer'), { ssr: false })
import {
  BookOpen,
  Settings,
  Heart,
  MessageSquare,
  Share2,
  //  Bookmark,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Type,
  Palette,
  Volume2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Star,
  Eye,
  Clock,
  Users
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'

interface Book {
  id: string
  title: string
  description: string
  content: string
  cover_url: string
  genre: string
  author: {
    id: string
    name: string
    avatar_url: string
  }
  likes: number
  reviews: number
  // chapters: Chapter[]
  created_at: string
}


interface Comment {
  id: string
  content: string
  user: {
    name: string
    avatar_url: string
  }
  created_at: string
  likes: number
}

export default function ReadPage() {
  const router = useRouter()
  const { id } = useParams()

  const [book, setBook] = useState<Book | null>(null)
  // const [currentChapter, setCurrentChapter] = useState(0)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
  //  const [isBookmarked, setIsBookmarked] = useState(false)
  const [reviews, setreviews] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showreviews, setShowreviews] = useState(false)
  const [readingSession, setReadingSession] = useState<{ id: string; started_at: string } | null>(null);


  // Reading preferences
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('serif')
  const [theme, setTheme] = useState('light')
  const [lineHeight, setLineHeight] = useState(1.6)
  const [readingProgress, setReadingProgress] = useState(0)

  // Reading analytics
  const [readingTime, setReadingTime] = useState(0)
  const [wordsRead, setWordsRead] = useState(0)
  const readingStartTime = useRef<number>(Date.now())

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/library")
        return;
      }

      setUser(session.user);

      // ✅ Count only 1 view per user/book
      const sessionId = await startReadingSession(session.user.id, id as string);
      setReadingSession({ id: sessionId, started_at: new Date().toISOString() });

      await fetchBook();
    };

    checkAuth()
  }, [id, router])


  // Track reading time
  async function startReadingSession(userId: string, bookId: string) {
    const { data: existing, error } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (existing) {
      // session exists, don't insert a new view
      console.log('View already exists, skipping insert');
      return existing.id;
    } else {
      const { data, error: insertError } = await supabase
        .from('reading_sessions')
        .insert({
          user_id: userId,
          book_id: bookId,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) console.error('Insert error:', insertError);
      return data?.id;
    }
  }

  const endReadingSession = async () => {
    if (!readingSession?.id) return;
    const updatedSeconds = readingSeconds;

    const { error } = await supabase
      .from("reading_sessions")
      .update({
        duration: updatedSeconds,
        ended_at: new Date().toISOString(),
      })
      .eq("id", readingSession.id);

    if (error) {
      console.error("Failed to end reading session:", error);
    }
  };




  const params = useParams();
  const bookId = params?.id;

  const fetchReadingStats = async () => {
    if (!bookId) {
      console.error('bookId is missing');

      return;
    }
    const { count } = await supabase
      .from('reading_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId);

    const viewsCount = count || 0;

    const { data: durations, error: durationError } = await supabase
      .from('reading_sessions')
      .select('duration')
      .eq('book_id', bookId)
      .not('ended_at', 'is', null);

    if (durationError) {
      console.error('Error fetching durations:', durationError);
    }

    const totalReadingTime = durations?.reduce((sum, row) => sum + (row.duration || 0), 0) || 0;

    return {
      viewsCount: viewsCount || 0,
      totalReadingTime,
    };
  };


  const [viewsCount, setViewsCount] = useState(0)
  const [readingSeconds, setReadingSeconds] = useState(0)

  //live record in table(nva pr km eh v ni kr reha)
  const lastSavedSeconds = useRef(0)
  useEffect(() => {
    const interval = setInterval(async () => {
      const diff = readingSeconds - lastSavedSeconds.current
      if (diff >= 30) {
        lastSavedSeconds.current = readingSeconds

        const { data: sessionData, error } = await supabase
          .from('reading_sessions')
          .upsert([
            {
              user_id: id,
              book_id: bookId,
              duration: readingSeconds,
              started_at: new Date().toISOString(),
            },
          ])
          .select()

        if (error) {
          console.error('Failed to update reading time:', error.message)
        }
      }
    }, 10000) // check every 10s

    return () => clearInterval(interval)
  }, [readingSeconds])


  useEffect(() => {
    return () => {
      endReadingSession(); // ✅ clean and correct
    };
  }, [readingSession, readingSeconds]);



  //pta ni purna a eh 

  useEffect(() => {
    if (bookId) {
      fetchReadingStats()
        .then(stats => {
          if (stats) {
            setViewsCount(stats.viewsCount)
            setReadingSeconds(stats.totalReadingTime)
          }
        })
    }
  }, [bookId]);

  //LIVE timer 
  useEffect(() => {
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setReadingSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  function formatReadingTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`
  }

  //likes & review maybe 
  const fetchBook = async () => {
    try {
      const { data: bookData, error } = await supabase
        .from('books')
        .select(`
        *,
        authors:author_id (id, name, avatar_url)
      `)
        .eq('id', id)
        .single()

      if (error) throw error

      const [{ data: likesData }, { data: reviewsData }] = await Promise.all([
        supabase.from('likes').select('id').eq('book_id', id),
        supabase.from('reviews').select('id').eq('book_id', id).not('content', 'is', null)

      ])
      const formattedBook: Book = {
        ...bookData,
        author: bookData.authors,
        likes: likesData?.length || 0,
        reviews: reviewsData?.length || 0,
      }
      setBook(formattedBook)
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('book_id', id)
          .eq('user_id', user.id)
          .maybeSingle()

        setIsLiked(!!likeData)
      }
      await fetchreviews()
    } catch (err) {
      console.error('Error fetching book:', err)
    } finally {
      setLoading(false)
    }
  }
  //like system
  const handleLike = async () => {
    if (!user || !book) return;

    if (isLiked) {
      toast({
        title: "Already Liked",
        description: "You've already liked this book.",
        variant: "destructive",
      });
      return;
    }

    const liked = !isLiked
    setIsLiked(true);
    setBook(prev => prev && {
      ...prev,
      likes: liked ? prev.likes + 1 : prev.likes - 1
    })

    try {
      if (liked) {
        await supabase.from('likes').insert([{ book_id: id, user_id: user.id }])
      } else {
        await supabase.from('likes').delete().eq('book_id', id).eq('user_id', user.id)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  // settings theme
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-gray-100'
      case 'sepia':
        return 'bg-amber-50 text-amber-900'
      default:
        return 'bg-white text-gray-900'
    }
  }
  // settings fontfamily
  const getFontFamily = () => {
    switch (fontFamily) {
      case 'sans':
        return 'font-sans'
      case 'mono':
        return 'font-mono'
      default:
        return 'font-serif'
    }
  }

  //review system fuction 

  const fetchreviews = async () => {
    if (!book) return;

    const { data, error } = await supabase
      .from('reviews')
      .select(`
      id,
      content,
      rating,
      created_at,
      user:user_id (
        name,
        avatar_url
      )
    `)
      .eq('book_id', book.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return
    }

    setreviews(data || [])
  }
  const handleComment = async () => {
    if (!newComment.trim() || !user || !book) return;

    const { error } = await supabase.from('reviews').insert([
      {
        book_id: book.id,
        user_id: user.id,
        content: newComment,
      },
    ])

    if (error) {
      console.error('Error posting comment:', error)
      return
    }
    setNewComment('')
    await fetchreviews()  // Refresh the reviews list
  }
  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }
  if (!book) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Book not found</h1>
          <Button onClick={() => router.push('/library')}>Back to Library</Button>
        </div>
      </div>
    )
  }
  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeClasses()}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b  backdrop-blur-sm bg-opacity-90 ">
        <div className="container mx-auto px-4 py-3 max-w-screen-xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/library')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-semibold truncate max-w-xs">{book.title}</h1>
                <p className="text-sm opacity-70">by {book.author.name}</p>
              </div>
            </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Reading Stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm opacity-70">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <p className="text-sm text-muted-foreground">
                    ⏱ Time Spent: {formatReadingTime(readingSeconds)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <Clock className="h-4 w-4" />
                  <span>{Math.floor(readingTime / 60)}m</span>
                </div>
                 <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <Eye className="h-4 w-4" />
                  <span>{viewsCount}</span>
                </div>
              </div>

              {/* Actions */}
              <Button variant="ghost" size="sm" onClick={handleLike}>
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="ml-1">{book.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowreviews(!showreviews)}>
                <MessageSquare className="h-4 w-4" />
                <span className="ml-1">{book.reviews}</span>
              </Button>

              {/* Reading Settings */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className='text-black'>Reading Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 text-black">
                    {/* Font Size */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Size</label>
                      <Slider
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        min={12}
                        max={24}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">{fontSize}px</div>
                    </div>
                    {/* Font Family */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Family</label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="sans">Sans Serif</SelectItem>
                          <SelectItem value="mono">Monospace</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Theme */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Theme</label>
                      <div className="flex space-x-2">
                        <Button
                          variant={theme === 'light' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('light')}
                        >
                          <Sun className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={theme === 'dark' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('dark')}
                        >
                          <Moon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={theme === 'sepia' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('sepia')}
                        >
                          <Palette className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            {/* Book Info */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <img
                    src={book.cover_url || '/placeholder.svg'}
                    alt={book.title}
                    className="w-24 h-36 md:w-32 md:h-48 object-cover rounded-lg mx-auto mb-4"
                  />
                  <h3 className="font-bold text-lg">{book.title}</h3>
                  <p className="text-sm opacity-70 mb-2">by {book.author.name}</p>
                  <Badge variant="secondary">{book.genre}</Badge>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span> {viewsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Likes:</span>
                    <span>{book.likes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reviews:</span>
                    <span>{book.reviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reading time:</span>
                    <span> {(readingSeconds / 60).toFixed(1)} minutes</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Published:</span>
                    <span>{new Date(book.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* reviews Section */}
            <AnimatePresence>
              {showreviews && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-bold mb-4">reviews ({reviews.length})</h3>
                      {/* Add Comment */}
                      <div className="mb-4">
                        <Textarea
                          placeholder="Share your thoughts..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}

                          className="mb-2"
                        />

                        <Button onClick={handleComment}>Post Comment</Button> // ✅ RIGHT


                      </div>

                      {/* reviews List */}
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {reviews.map((comment) => (
                          <div key={comment.id} className="border-b pb-3 last:border-b-0">
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={comment.user.avatar_url} />
                                <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{comment.user.name}</span>
                                  <span className="text-xs opacity-60">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Button variant="ghost" size="sm">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {comment.likes}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>






          {/* Main Content */}
          <div className="lg:col-span-3">
            {book?.pdf_url ? (
              <PdfViewer
                url={book.pdf_url}
                fontSize={fontSize}
                lineHeight={lineHeight}
                theme={theme as 'light' | 'dark' | 'sepia'}
              />
            ) : book?.book_url ? (
              <div className="w-full overflow-x-auto">
                <iframe
                  src={book.book_url}
                  width="100%"
                  height="800"
                  className="rounded-lg shadow-lg border w-full"
                />
              </div>

            ) : book?.content ? (
              <div
                className={`prose max-w-none transition-all duration-300 ${getFontFamily()} prose-sm sm:prose-base`}
                style={{ fontSize: `${fontSize}px`, lineHeight }}
                dangerouslySetInnerHTML={{ __html: book.content }}
              />
            ) : (
              <p className="italic text-red-500">No readable content available for this book.</p>
            )}
          </div>


          {/* Sidebar */}

        </div>
      </div>
    </div >
  )
}

