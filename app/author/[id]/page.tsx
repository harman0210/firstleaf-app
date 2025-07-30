"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BookOpen,
  Star,
  Heart,
  MessageSquare,
  ArrowLeft,
  MapPin,
  Calendar,
  Award,
} from "lucide-react"

export default function AuthorPage() {
  const params = useParams()
  const id = params?.id as string

  const [author, setAuthor] = useState<any>(null)
  const [authorBooks, setAuthorBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchAuthorProfile = async () => {
      setLoading(true)

      const { data: authorData, error: authorError } = await supabase
        .from("authors")
        .select("*")
        .eq("id", id)
        .single()

      if (!authorData || authorError) {
        console.error("Author not found. Possibly invalid ID:", id)
        setLoading(false)
        return
      }

      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select(`id, title, genre, description, cover_url, book_url, created_at`)
        .eq("author_id", id)

      if (booksError) {
        console.error("Error fetching books:", booksError)
        setLoading(false)
        return
      }

      const bookStats = await Promise.all(
        booksData.map(async (book) => {
          const [{ data: likes = [] }, { data: reviews = [] }] = await Promise.all([
            supabase.from("likes").select("id").eq("book_id", book.id),
            supabase.from("reviews").select("rating").eq("book_id", book.id),
          ])

          const ratingSum = reviews.reduce((acc, r) => acc + r.rating, 0)
          const avgRating = reviews.length > 0 ? (ratingSum / reviews.length).toFixed(1) : "0"

          return {
            ...book,
            likes: likes.length,
            reviews: reviews.length,
            rating: avgRating,
          }
        })
      )

      const totalLikes = bookStats.reduce((acc, book) => acc + book.likes, 0)
      const totalReviews = bookStats.reduce((acc, book) => acc + book.reviews, 0)
      const totalRating = bookStats.reduce((acc, book) => acc + parseFloat(book.rating) * book.reviews, 0)
      const totalRatingCount = bookStats.reduce((acc, book) => acc + book.reviews, 0)

      const avgRating = totalRatingCount > 0 ? (totalRating / totalRatingCount).toFixed(1) : "0"

      const avatarList = [
        "/avatars/avatar5.png",
        "/avatars/avatar2.png",
      ]

      const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)]

      setAuthor({
        id: authorData.id,
        name: authorData.name,
        avatar: authorData.avatar_url || randomAvatar,
        bio: authorData.bio || "This author hasn't added a bio yet.",
        location: authorData.location || "Unknown",
        joinDate: new Date(authorData.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
        }),
        badges: [],
        stats: {
          totalBooks: bookStats.length,
          totalLikes,
          totalReviews,
          avgRating,
        },
      })

      setAuthorBooks(bookStats)
      setLoading(false)
    }

    fetchAuthorProfile()
  }, [id])

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading author profile...</div>
  }

  if (!author) {
    return <div className="p-6 text-center text-gray-500">Author not found.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/library" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <BookOpen className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold text-gray-900">FirstLeaf</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="w-32 h-32">
                <AvatarImage src={author.avatar} />
                <AvatarFallback className="text-2xl">AU</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{author.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{author.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {author.joinDate}</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">{author.bio}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {author.badges.map((badge: any, index: number) => (
                    <Badge key={index} className={`${badge.color} flex items-center space-x-1`}>
                      <Award className="h-3 w-3" />
                      <span>{badge.name}</span>
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{author.stats.totalBooks}</div>
                    <div className="text-sm text-gray-600">Books Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{author.stats.totalLikes}</div>
                    <div className="text-sm text-gray-600">Total Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{author.stats.totalReviews}</div>
                    <div className="text-sm text-gray-600">Total Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{author.stats.avgRating}</div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Published Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {authorBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] relative">
                  <Image src={book.cover_url ? `${book.cover_url}` : "/placeholder.svg"} alt={book.title} fill className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <Badge variant="secondary" className="mb-2">{book.genre}</Badge>
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{book.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{book.rating}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{book.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{book.reviews}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/book/${book.id}`}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Read Book</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
