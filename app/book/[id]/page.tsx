"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Star, Heart, MessageSquare, ArrowLeft, User } from "lucide-react"

export default function BookDetailPage() {
  const params = useParams()
  const bookId = params?.id as string

  const [book, setBook] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newReview, setNewReview] = useState("")
  const [newRating, setNewRating] = useState(0)

  useEffect(() => {
    if (!bookId) return

    const fetchBook = async () => {
      const { data, error } = await supabase
        .from("books")
        .select(`id, title, genre, description, author_id, cover_url, book_url, created_at,
          authors ( name ),
          likes ( id ),
          reviews ( id, content, rating, created_at, user_id )`)
        .eq("id", bookId)
        .single()

      if (error) {
        console.error("Error fetching book:", error.message)
        return
      }

      setBook({
        ...data,
        author: data.authors?.name || "Unknown",
        author_id: data.author_id,
        likes: data.likes?.length || 0,
        reviews: data.reviews || [],
      })
      setLikeCount(data.likes?.length || 0)
    }

    fetchBook()
  }, [bookId])

  const handleLike = async () => {
    if (!bookId || isLiked) return
    const { error } = await supabase.from("likes").insert({ book_id: bookId })
    if (error) return alert("Error liking book")
    setLikeCount((prev) => prev + 1)
    setIsLiked(true)
  }

  const handleSubmitReview = async () => {
    if (!newReview.trim()) return
    const { error } = await supabase.from("reviews").insert({
      book_id: bookId,
      content: newReview,
      rating: newRating,
    })
    if (error) return alert("Error submitting review")
    setNewReview("")
    setNewRating(5)
    alert("✅ Review submitted!")
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
          onClick={() => interactive && onRate && onRate(star)}
        />
      ))}
    </div>
  )

  if (!book) return <div className="p-6 text-center text-gray-600">Loading...</div>

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
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="aspect-[3/4] relative mb-4">
                  <Image
                    src={book.cover_url || "/placeholder.svg"}
                    alt={book.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <Badge variant="secondary" className="mb-2">
                  {book.genre}
                </Badge>
                <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
                <Link href={`/author/${book.author_id}`} className="text-emerald-600 hover:underline block mb-4">
                  by {book.author}
                </Link>


                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(5)}
                    <span className="text-sm text-gray-600">({book.reviews.length} reviews)</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{book.description}</p>
                <div className="flex items-center space-x-2 mb-4">
                  <Button onClick={handleLike} className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    {likeCount} Likes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Book File</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`https://zqneqwqlbippqjkaggxc.supabase.co/storage/v1/object/public/books/${book.book_url}`}
                  className="text-emerald-600 underline"
                  target="_blank"
                >
                  View Full Book
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reviews ({book.reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="font-semibold mb-3">Write a Review</h3>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    {renderStars(newRating, true, setNewRating)}
                  </div>
                  <Textarea
                    placeholder="Your thoughts..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    className="mb-3"
                  />
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmitReview}>
                    Submit Review
                  </Button>
                </div>

                {book.reviews.map((review: any) => (
                  <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarImage src={"/placeholder.svg"} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">Anonymous</span>
                          <span className="text-sm text-gray-500">{review.created_at?.slice(0, 10)}</span>
                        </div>
                        <div className="mb-2">{renderStars(review.rating)}</div>
                        <p className="text-gray-700">{review.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
