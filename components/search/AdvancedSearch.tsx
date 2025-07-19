'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Star,
  Heart,
  Eye,
  Calendar,
  ChevronDown,
  X,
  Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { debounce } from 'lodash'

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
  word_count?: number
  status: 'completed' | 'ongoing' | 'hiatus'
}

interface SearchFilters {
  query: string
  genres: string[]
  tags: string[]
  minRating: number
  maxRating: number
  minWordCount: number
  maxWordCount: number
  status: string[]
  sortBy: 'relevance' | 'rating' | 'likes' | 'views' | 'created_at' | 'title'
  sortOrder: 'asc' | 'desc'
  dateRange: 'all' | 'week' | 'month' | 'year'
}

const GENRES = [
  'Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller',
  'Literary Fiction', 'Young Adult', 'Horror', 'Historical Fiction',
  'Contemporary', 'Adventure', 'Drama', 'Comedy', 'Non-Fiction'
]

const POPULAR_TAGS = [
  'enemies-to-lovers', 'slow-burn', 'found-family', 'magic-system',
  'dystopian', 'time-travel', 'vampire', 'werewolf', 'academy',
  'royal', 'pirates', 'dragons', 'space-opera', 'cyberpunk'
]

export function AdvancedSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    genres: [],
    tags: [],
    minRating: 0,
    maxRating: 5,
    minWordCount: 0,
    maxWordCount: 1000000,
    status: [],
    sortBy: 'relevance',
    sortOrder: 'desc',
    dateRange: 'all'
  })

  const resultsPerPage = 12

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchFilters: SearchFilters) => {
      performSearch(searchFilters)
    }, 300),
    []
  )

  useEffect(() => {
    fetchAvailableTags()
    if (filters.query || hasActiveFilters()) {
      debouncedSearch(filters)
    }
  }, [filters, currentPage])

  const fetchAvailableTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('name')
      .order('usage_count', { ascending: false })
      .limit(50)

    if (data) {
      setAvailableTags(data.map(tag => tag.name))
    }
  }

  const hasActiveFilters = () => {
    return filters.genres.length > 0 ||
           filters.tags.length > 0 ||
           filters.minRating > 0 ||
           filters.maxRating < 5 ||
           filters.status.length > 0 ||
           filters.dateRange !== 'all'
  }

  const performSearch = async (searchFilters: SearchFilters) => {
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
        `, { count: 'exact' })

      // Text search
      if (searchFilters.query) {
        query = query.or(`title.ilike.%${searchFilters.query}%,description.ilike.%${searchFilters.query}%`)
      }

      // Genre filter
      if (searchFilters.genres.length > 0) {
        query = query.in('genre', searchFilters.genres)
      }

      // Status filter
      if (searchFilters.status.length > 0) {
        query = query.in('status', searchFilters.status)
      }

      // Date range filter
      if (searchFilters.dateRange !== 'all') {
        const now = new Date()
        let dateThreshold: Date
        
        switch (searchFilters.dateRange) {
          case 'week':
            dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case 'year':
            dateThreshold = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            break
          default:
            dateThreshold = new Date(0)
        }
        
        query = query.gte('created_at', dateThreshold.toISOString())
      }

      // Sorting
      switch (searchFilters.sortBy) {
        case 'title':
          query = query.order('title', { ascending: searchFilters.sortOrder === 'asc' })
          break
        case 'created_at':
          query = query.order('created_at', { ascending: searchFilters.sortOrder === 'asc' })
          break
        default:
          // For rating, likes, views - we'll sort after fetching
          query = query.order('created_at', { ascending: false })
      }

      // Pagination
      const from = (currentPage - 1) * resultsPerPage
      const to = from + resultsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      let formattedBooks: Book[] = data?.map(book => ({
        ...book,
        author: book.authors,
        likes: book.likes?.length || 0,
        views: book.views?.length || 0,
        rating: book.reviews?.length > 0 
          ? book.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / book.reviews.length 
          : 0,
        tags: book.book_tags?.map((bt: any) => bt.tags.name) || [],
        status: book.status || 'completed'
      })) || []

      // Apply rating filter
      formattedBooks = formattedBooks.filter(book => 
        book.rating >= searchFilters.minRating && book.rating <= searchFilters.maxRating
      )

      // Apply tag filter
      if (searchFilters.tags.length > 0) {
        formattedBooks = formattedBooks.filter(book =>
          searchFilters.tags.some(tag => book.tags.includes(tag))
        )
      }

      // Sort by engagement metrics
      if (['rating', 'likes', 'views'].includes(searchFilters.sortBy)) {
        formattedBooks.sort((a, b) => {
          const aValue = a[searchFilters.sortBy as keyof Book] as number
          const bValue = b[searchFilters.sortBy as keyof Book] as number
          return searchFilters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
        })
      }

      setBooks(formattedBooks)
      setTotalResults(count || 0)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const toggleArrayFilter = (key: 'genres' | 'tags' | 'status', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      genres: [],
      tags: [],
      minRating: 0,
      maxRating: 5,
      minWordCount: 0,
      maxWordCount: 1000000,
      status: [],
      sortBy: 'relevance',
      sortOrder: 'desc',
      dateRange: 'all'
    })
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    debouncedSearch(filters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Books</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search books, authors, or keywords..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
              {filters.query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('query', '')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button type="submit" size="lg" disabled={loading}>
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </form>

          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {hasActiveFilters() && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.genres.length + filters.tags.length + filters.status.length}
                  </Badge>
                )}
              </Button>

              {hasActiveFilters() && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="likes">Most Liked</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                  <SelectItem value="created_at">Newest</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:col-span-1"
              >
                <Card className="sticky top-4">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Filters</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Genres */}
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <span className="font-medium">Genres</span>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {GENRES.map(genre => (
                          <div key={genre} className="flex items-center space-x-2">
                            <Checkbox
                              id={`genre-${genre}`}
                              checked={filters.genres.includes(genre)}
                              onCheckedChange={() => toggleArrayFilter('genres', genre)}
                            />
                            <label htmlFor={`genre-${genre}`} className="text-sm">
                              {genre}
                            </label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Rating */}
                    <div>
                      <label className="font-medium mb-2 block">Rating Range</label>
                      <div className="space-y-2">
                        <Slider
                          value={[filters.minRating, filters.maxRating]}
                          onValueChange={([min, max]) => {
                            updateFilter('minRating', min)
                            updateFilter('maxRating', max)
                          }}
                          min={0}
                          max={5}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{filters.minRating}★</span>
                          <span>{filters.maxRating}★</span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="font-medium mb-2 block">Status</label>
                      <div className="space-y-2">
                        {['completed', 'ongoing', 'hiatus'].map(status => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={filters.status.includes(status)}
                              onCheckedChange={() => toggleArrayFilter('status', status)}
                            />
                            <label htmlFor={`status-${status}`} className="text-sm capitalize">
                              {status}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="font-medium mb-2 block">Published</label>
                      <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Popular Tags */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <span className="font-medium">Popular Tags</span>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        <div className="flex flex-wrap gap-2">
                          {POPULAR_TAGS.map(tag => (
                            <Badge
                              key={tag}
                              variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => toggleArrayFilter('tags', tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {loading ? 'Searching...' : `${totalResults} books found`}
                </h2>
                {filters.query && (
                  <p className="text-gray-600">for "{filters.query}"</p>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : books.length > 0 ? (
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
                {books.map((book, index) => (
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
                        <div className="absolute top-2 right-2">
                          <Badge variant={book.status === 'completed' ? 'default' : 'secondary'}>
                            {book.status}
                          </Badge>
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

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-3">
                            {book.rating > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{book.rating.toFixed(1)}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4" />
                              <span>{book.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{book.views}</span>
                            </div>
                          </div>
                        </div>

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
                          <Button className="w-full">
                            Read Book
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}

            {/* Pagination */}
            {totalResults > resultsPerPage && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="px-4 py-2 text-sm">
                    Page {currentPage} of {Math.ceil(totalResults / resultsPerPage)}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(Math.ceil(totalResults / resultsPerPage), currentPage + 1))}
                    disabled={currentPage >= Math.ceil(totalResults / resultsPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
