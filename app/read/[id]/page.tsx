'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  BookOpen,
  Settings,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
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
  views: number
  chapters: Chapter[]
  created_at: string
}

interface Chapter {
  id: string
  title: string
  content: string
  chapter_number: number
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
  const [currentChapter, setCurrentChapter] = useState(0)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  
  // Reading preferences
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('serif')
  const [theme, setTheme] = useState('light')
  const [lineHeight, setLineHeight] = useState(1.6)
  const [readingProgress, setReadingProgress] = useState(0)
  
  // Text-to-speech
  const [isPlaying, setIsPlaying] = useState(false)
  const [speechRate, setSpeechRate] = useState(1)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  
  // Reading analytics
  const [readingTime, setReadingTime] = useState(0)
  const [wordsRead, setWordsRead] = useState(0)
  const readingStartTime = useRef<number>(Date.now())

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      await fetchBook()
    }
    checkAuth()
  }, [id, router])

  useEffect(() => {
    // Track reading time
    const interval = setInterval(() => {
      setReadingTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const fetchBook = async () => {
    try {
      const { data: bookData, error } = await supabase
        .from('books')
        .select(`
          *,
          authors:author_id (id, name, avatar_url),
          chapters (id, title, content, chapter_number),
          likes (id),
          bookmarks (id),
          views (id)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      const formattedBook: Book = {
        ...bookData,
        author: bookData.authors,
        likes: bookData.likes?.length || 0,
        views: bookData.views?.length || 0,
        chapters: bookData.chapters?.sort((a: any, b: any) => a.chapter_number - b.chapter_number) || []
      }

      setBook(formattedBook)
      
      // Check if user has liked/bookmarked
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('book_id', id)
          .eq('user_id', user.id)
          .single()
        
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('book_id', id)
          .eq('user_id', user.id)
          .single()

        setIsLiked(!!likeData)
        setIsBookmarked(!!bookmarkData)
      }

      // Record view
      await supabase.from('views').insert([{ book_id: id, user_id: user?.id }])
      
      await fetchComments()
      setLoading(false)
    } catch (error) {
      console.error('Error fetching book:', error)
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users:user_id (name, avatar_url),
        comment_likes (id)
      `)
      .eq('book_id', id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const formattedComments = data.map(comment => ({
        ...comment,
        user: comment.users,
        likes: comment.comment_likes?.length || 0
      }))
      setComments(formattedComments)
    }
  }

  const handleLike = async () => {
    if (!user) return

    if (isLiked) {
      await supabase.from('likes').delete().eq('book_id', id).eq('user_id', user.id)
      setIsLiked(false)
    } else {
      await supabase.from('likes').insert([{ book_id: id, user_id: user.id }])
      setIsLiked(true)
    }
  }

  const handleBookmark = async () => {
    if (!user) return

    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('book_id', id).eq('user_id', user.id)
      setIsBookmarked(false)
    } else {
      await supabase.from('bookmarks').insert([{ book_id: id, user_id: user.id }])
      setIsBookmarked(true)
    }
  }

  const handleComment = async () => {
    if (!user || !newComment.trim()) return

    const { error } = await supabase.from('comments').insert([{
      book_id: id,
      user_id: user.id,
      content: newComment.trim()
    }])

    if (!error) {
      setNewComment('')
      await fetchComments()
    }
  }

  const startTextToSpeech = () => {
    if (!book?.chapters[currentChapter]) return

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(book.chapters[currentChapter].content)
      utterance.rate = speechRate
      utterance.onend = () => setIsPlaying(false)
      
      speechRef.current = utterance
      speechSynthesis.speak(utterance)
      setIsPlaying(true)
    }
  }

  const stopTextToSpeech = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
  }

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
      <header className="sticky top-0 z-50 border-b backdrop-blur-sm bg-opacity-90">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
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

            <div className="flex items-center space-x-2">
              {/* Reading Stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm opacity-70">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{Math.floor(readingTime / 60)}m</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{book.views}</span>
                </div>
              </div>

              {/* Actions */}
              <Button variant="ghost" size="sm" onClick={handleLike}>
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="ml-1">{book.likes}</span>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleBookmark}>
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>

              <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
                <MessageSquare className="h-4 w-4" />
                <span className="ml-1">{comments.length}</span>
              </Button>

              {/* Reading Settings */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reading Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
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

                    {/* Text-to-Speech */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Text-to-Speech</label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={isPlaying ? stopTextToSpeech : startTextToSpeech}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Slider
                          value={[speechRate]}
                          onValueChange={(value) => setSpeechRate(value[0])}
                          min={0.5}
                          max={2}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="text-xs">{speechRate}x</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Chapter Navigation */}
            {book.chapters.length > 1 && (
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
                  disabled={currentChapter === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <Select
                  value={currentChapter.toString()}
                  onValueChange={(value) => setCurrentChapter(parseInt(value))}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {book.chapters.map((chapter, index) => (
                      <SelectItem key={chapter.id} value={index.toString()}>
                        Chapter {chapter.chapter_number}: {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setCurrentChapter(Math.min(book.chapters.length - 1, currentChapter + 1))}
                  disabled={currentChapter === book.chapters.length - 1}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Reading Content */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div
                  className={`prose max-w-none ${getFontFamily()}`}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                  }}
                >
                  {book.chapters.length > 0 ? (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">
                        {book.chapters[currentChapter].title}
                      </h2>
                      <div className="whitespace-pre-wrap">
                        {book.chapters[currentChapter].content}
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{book.description}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Book Info */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <img
                    src={book.cover_url || '/placeholder.svg'}
                    alt={book.title}
                    className="w-32 h-48 object-cover rounded-lg mx-auto mb-4"
                  />
                  <h3 className="font-bold text-lg">{book.title}</h3>
                  <p className="text-sm opacity-70 mb-2">by {book.author.name}</p>
                  <Badge variant="secondary">{book.genre}</Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Chapters:</span>
                    <span>{book.chapters.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Likes:</span>
                    <span>{book.likes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span>{book.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Published:</span>
                    <span>{new Date(book.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-bold mb-4">Comments ({comments.length})</h3>
                      
                      {/* Add Comment */}
                      <div className="mb-4">
                        <Textarea
                          placeholder="Share your thoughts..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="mb-2"
                        />
                        <Button onClick={handleComment} size="sm" className="w-full">
                          Post Comment
                        </Button>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {comments.map((comment) => (
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
        </div>
      </div>
    </div>
  )
}

