'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Eye, Star, TrendingUp, Clock, Users } from 'lucide-react'
import { motion } from 'framer-motion'

interface Book {
  id: string
  title: string
  description: string
  cover_url: string
  genre: string
  author: {
    name: string
    id: string
  }
  likes: number
  views: number
  rating: number
  created_at: string
  tags: string[]
}

interface RecommendationProps {
  userId?: string
  currentBookId?: string
  genre?: string
  limit?: number
}

export function BookRecommendations({ userId, currentBookId, genre, limit = 6 }: RecommendationProps) {
  const [recommendations, setRecommendations] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [recommendationType, setRecommendationType] = useState<'personalized' | 'trending' | 'genre' | 'new'>('personalized')

  useEffect(() => {
    fetchRecommendations()
  }, [userId, currentBookId, genre, recommendationType])

  const fetchRecommendations = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('books')
        .select(`
          *,
          authors:author_id (id, name),
          likes (id),
          views (id),
          reviews (rating),
          book_tags (tags (name))
        `)

      // Exclude current book if provided
      if (currentBookId) {
        query = query.neq('id', currentBookId)
      }

      switch (recommendationType) {
        case 'personalized':
          if (userId) {
            // Get user's reading history and preferences
            const { data: userBooks } = await supabase
              .from('user_book_interactions')
              .select('book_id, interaction_type, books (genre)')
              .eq('user_id', userId)

            const preferredGenres = userBooks?.map((ub: any) => ub.books?.genre).filter(Boolean) || []
            
            if (preferredGenres.length > 0) {
              query = query.in('genre', preferredGenres)
            }
          }
          break

        case 'trending':
          // Books with high engagement in the last 7 days
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          query = query.gte('created_at', weekAgo)
          break

        case 'genre':
          if (genre) {
            query = query.eq('genre', genre)
          }
          break

        case 'new':
          query = query.order('created_at', { ascending: false })
          break
      }

      const { data, error } = await query.limit(limit)

      if (error) throw error

      const formattedBooks: Book[] = data?.map(book => ({
        ...book,
        author: book.authors,
        likes: book.likes?.length || 0,
        views: book.views?.length || 0,
        rating: book.reviews?.length > 0 
          ? book.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / book.reviews.length 
          : 0,
        tags: book.book_tags?.map((bt: any) => bt.tags.name) || []
      })) || []

      // Sort by engagement score for personalized and trending
      if (recommendationType === 'personalized' || recommendationType === 'trending') {
        formattedBooks.sort((a, b) => {
          const scoreA = (a.likes * 2) + (a.views * 0.5) + (a.rating * 10)
          const scoreB = (b.likes * 2) + (b.views * 0.5) + (b.rating * 10)
          return scoreB - scoreA
        })
      }

      setRecommendations(formattedBooks)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationTitle = () => {
    switch (recommendationType) {
      case 'personalized':
        return 'Recommended for You'
      case 'trending':
        return 'Trending This Week'
      case 'genre':
        return `More ${genre} Books`
      case 'new':
        return 'Latest Releases'
      default:
        return 'Discover Books'
    }
  }

  const getRecommendationIcon = () => {
    switch (recommendationType) {
      case 'trending':
        return <TrendingUp className="h-5 w-5" />
      case 'new':
        return <Clock className="h-5 w-5" />
      case 'genre':
        return <Star className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getRecommendationIcon()}
          <h2 className="text-2xl font-bold text-gray-900">{getRecommendationTitle()}</h2>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={recommendationType === 'personalized' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRecommendationType('personalized')}
          >
            For You
          </Button>
          <Button
            variant={recommendationType === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRecommendationType('trending')}
          >
            Trending
          </Button>
          <Button
            variant={recommendationType === 'new' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRecommendationType('new')}
          >
            New
          </Button>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {recommendations.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src={book.cover_url || '/placeholder.svg'}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center space-x-4 text-white text-sm">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{book.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{book.views}</span>
                    </div>
                    {book.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{book.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {book.genre}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {book.title}
                </h3>
                
                <Link
                  href={`/author/${book.author.id}`}
                  className="text-emerald-600 hover:underline block mb-3 text-sm"
                >
                  by {book.author.name}
                </Link>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {book.description}
                </p>

                {book.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {book.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Link href={`/book/${book.id}`}>
                  <Button className="w-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    Read Book
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {recommendations.length >= limit && (
        <div className="text-center">
          <Link href="/library">
            <Button variant="outline" size="lg">
              Explore More Books
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
