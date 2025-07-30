"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
  MapPin,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react"

interface Book {
  id: string
  title: string
  genre: string
  language: string
  description: string
  cover: string
  rating: string
  reviews: number
  likes: number
  publishDate?: string
}

interface Author {
  id: string
  name: string
  avatar_url?: string
  location?: string
  created_at: string
  bio?: string
  stats: {
    totalBooks: number
    totalLikes: number
    totalReviews: number
    avgRating: string
  }
}

export default function DashboardPage() {
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [drafts, setDrafts] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");


  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push("/")
        return
      }

      const { data: authorData, error: authorError } = await supabase
        .from("authors")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (authorError || !authorData) {
        console.error("Author not found or error:", authorError)
        setLoading(false)
        return
      }

      // Fetch published books
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select(`
          id,
          title,
          genre,
          language,
          description,
          cover_url,
          created_at
        `)
        .eq("author_id", authorData.id)

      // Fetch saved drafts
      const { data: draftsData, error: draftsError } = await supabase
        .from("drafts")
        .select(`
             id,
             title,
             genre,
             language,
             description,
             updated_at,
             status,
             author_id,
             cover_url
            `)
        .eq("author_id", authorData.id)

      // Handle drafts
      if (!draftsError && draftsData) {


        const mappedDrafts: Book[] = draftsData.map((draft) => ({
          id: draft.id,
          title: draft.title,
          genre: draft.genre,
          language: draft.language,
          description: draft.description,
          cover: draft.cover_url || "/placeholder.svg",
          rating: "–",
          reviews: 0,
          likes: 0,
          publishDate: draft.updated_at?.slice(0, 10),
        }))
        setDrafts(mappedDrafts)
      }
      if (booksError) {
        console.error("Error fetching books:", booksError)
        setBooks([])
        setAuthor({
          ...authorData,
          stats: {
            totalBooks: 0,
            totalLikes: 0,
            totalReviews: 0,
            avgRating: "0",
          },
        })
        setLoading(false)
        return
      }

      const bookStats = await Promise.all(
        (booksData || []).map(async (book) => {
          const [{ data: likes = [] }, { data: reviews = [] }] = await Promise.all([
            supabase.from("likes").select("id").eq("book_id", book.id),
            supabase.from("reviews").select("rating").eq("book_id", book.id),
          ])

          return {
            id: book.id,
            likesCount: likes.length,
            reviewsCount: reviews.length,
            avgRating:
              reviews.length > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : "0",
          }
        })
      )

      let totalLikes = 0,
        totalReviews = 0,
        totalRatingSum = 0,
        totalRatingCount = 0

      const mappedBooks: Book[] = (booksData || []).map((book) => {
        const stats = bookStats.find((s) => s.id === book.id) || {
          likesCount: 0,
          reviewsCount: 0,
          avgRating: "0",
        }

        totalLikes += stats.likesCount
        totalReviews += stats.reviewsCount
        totalRatingSum += parseFloat(stats.avgRating) * stats.reviewsCount
        totalRatingCount += stats.reviewsCount

        return {
          id: book.id,
          title: book.title,
          genre: book.genre,
          language: book.language,
          description: book.description,
          cover: book.cover_url ? `${book.cover_url}` : "/placeholder.svg",
          rating: stats.avgRating,
          reviews: stats.reviewsCount,
          likes: stats.likesCount,
          publishDate: book.created_at?.slice(0, 10),
        }
      })

      const avgRating =
        totalRatingCount > 0 ? (totalRatingSum / totalRatingCount).toFixed(1) : "0"

      setAuthor({
        ...authorData,
        stats: {
          totalBooks: mappedBooks.length,
          totalLikes,
          totalReviews,
          avgRating,
        },
      })

      setBooks(mappedBooks)
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleDelete = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return

    const { error } = await supabase.from("books").delete().eq("id", bookId)
    if (error) {
      console.error("Failed to delete:", error)
      alert("Failed to delete book. Please try again.")
    } else {
      setBooks((prev) => prev.filter((b) => b.id !== bookId))
    }
  }

  const handlePublishDraft = async (draftId: string) => {
    const { data: draft, error: fetchError } = await supabase
      .from("drafts")
      .select("*")
      .eq("id", draftId)
      .single()

    if (fetchError || !draft) {
      console.error("Error fetching draft:", fetchError)
      alert("Failed to fetch draft.")
      return
    }

    const { error: insertError } = await supabase.from("books").insert({
      title: draft.title,
      genre: draft.genre,
      language: draft.language,
      description: draft.description,
      cover_url: draft.cover_url,
      author_id: draft.author_id,
    })

    if (insertError) {
      console.error("Error publishing draft:", insertError)
      alert("Failed to publish draft.")
      return
    }

    const { error: deleteError } = await supabase.from("drafts").delete().eq("id", draftId)
    if (deleteError) {
      console.error("Error deleting draft:", deleteError)
    }

    setDrafts((prev) => prev.filter((d) => d.id !== draftId))

    window.location.reload()
    // Optional: refetch or update books list
  }



  if (loading) {
    return
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Save Changes👌</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Back to Profile 🚀</h2>
      </div>
    </div>
  }

  if (!author) {
    return (
      <div className="flex justify-center items-center h-screen text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sorry Bro😶‍🌫️</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">You are not loged in 💀💀</h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Author Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-8 flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <Avatar className="w-32 h-32">

              {author.avatar_url ? (
                <AvatarImage src={author.avatar_url} alt={author.name} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {author.name[0] + (author.name.split(" ")[1]?.[0] || "") || "AU"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
                <Link
                  href="dashboard/edit-profile"
                  className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-black">Edit Profile</span>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{author.location || "Unknown"}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined{" "}
                    {new Date(author.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {author.bio || "This author hasn't added a bio yet."}
              </p>
              <div className="mt-4">

              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBlock label="Books Published" value={author.stats.totalBooks} />
                <StatBlock label="Total Likes" value={author.stats.totalLikes} />
                <StatBlock label="Total Reviews" value={author.stats.totalReviews} />
                <StatBlock label="Avg Rating" value={author.stats.avgRating} />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Drafts Section */}
        {drafts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Drafts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {drafts.map((draft) => (
                <Card
                  key={draft.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="aspect-[3/4] relative">
                    <Image src={draft.cover} alt={draft.title} fill className="object-cover" />
                  </div>
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <Badge variant="outline" className="mb-2">{draft.language || 'N/A'}</Badge>
                    <Badge variant="outline" className="mb-2">
                      {draft.genre}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{draft.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {draft.description}
                    </p>
                    <p className="text-sm text-gray-400 mb-3">Last updated: {draft.publishDate}</p>
                    <div className="flex gap-2 mt-auto">
                      <Link href={`/write/${draft.id}`}>
                        <Button className="w-full" variant="outline">
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Button>
                      </Link>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handlePublishDraft(draft.id)}
                      >
                        📚 Publish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Published Books Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Card
                key={book.id}
                className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="aspect-[3/4] relative">
                  <Image src={book.cover} alt={book.title} fill className="object-cover" />
                </div>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <Badge variant="secondary" className="mb-2">
                    {book.language}
                  </Badge>
                  <Badge variant="secondary" className="mb-2">
                    {book.genre}
                  </Badge>
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
                  <div className="flex gap-2 mt-auto">
                    <Link href={`/edit-book/${book.id}`}>
                      <Button className="w-full" variant="outline">
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    </Link>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleDelete(book.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-emerald-600">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}
