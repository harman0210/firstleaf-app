'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const genreFromURL = searchParams.get("genre") || "all";
  const [books, setBooks] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("likes");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const languageFromURL = searchParams.get("language") || "all";
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  useEffect(() => {
    setSelectedGenre(genreFromURL);
  }, [genreFromURL]);

  useEffect(() => {
    setSelectedGenre(genreFromURL);
    setSelectedLanguage(languageFromURL);
  }, [genreFromURL, languageFromURL]);

  useEffect(() => {
    async function fetchBooks() {
      // Fetch books with author
      const { data: booksData, error } = await supabase
        .from("books")
        .select(`
          id, title, description, genre, cover_url, language, created_at, author_id,
          authors:author_id ( name )
        `);

      if (error) {
        console.error("Supabase fetch error:", error.message);
        return;
      }

      // Fetch likes and reviews separately
      const { data: likesData } = await supabase.from("likes").select("book_id");
      const { data: reviewsData } = await supabase.from("reviews").select("book_id");

      const likesCountMap = likesData?.reduce((acc, like) => {
        acc[like.book_id] = (acc[like.book_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const reviewsCountMap = reviewsData?.reduce((acc, review) => {
        acc[review.book_id] = (acc[review.book_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const formatted = booksData?.map((book) => ({
        ...book,
        author: book.authors?.name || "Unknown",
        likes: likesCountMap?.[book.id] || 0,
        reviews: reviewsCountMap?.[book.id] || 0,
      }));

      setBooks(formatted || []);
    }

    fetchBooks();
  }, []);

  const sortedBooks = [...books].sort((a, b) => {
    switch (sortBy) {
      case "likes":
        return b.likes - a.likes;
      case "reviews":
        return b.reviews - a.reviews;
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  const filteredBooks = sortedBooks.filter((book) => {
    const genreMatch =
      selectedGenre === "all" ||
      book.genre?.toLowerCase() === selectedGenre;

    const languageMatch =
      selectedLanguage === "all" ||
      book.language?.toLowerCase() === selectedLanguage;

    return genreMatch && languageMatch;
  });


  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-32 left-0 w-[140%] h-[140%] animate-pulse-slow rounded-full bg-gradient-to-r from-emerald-100 via-white to-emerald-50 opacity-40 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              Discover New Stories
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            Explore books from emerging authors around the world.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48 bg-white text-gray-900">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="likes">Most Liked</SelectItem>
              <SelectItem value="reviews">Most Reviewed</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full sm:w-48 bg-white text-gray-900">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="punjabi">Punjabi</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">Hindi</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
              <SelectItem value="telgu">Telgu</SelectItem>
              <SelectItem value="gujarati">Gujarati</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full sm:w-48 bg-white text-gray-900">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="fantasy">Fantasy</SelectItem>
              <SelectItem value="sci-Fi">Sci-Fi</SelectItem>
              <SelectItem value="romance">Romance</SelectItem>
              <SelectItem value="fiction">Fiction</SelectItem>
              <SelectItem value="mystery">Mystery</SelectItem>
              <SelectItem value="horror">Horror</SelectItem>
              <SelectItem value="poetry">Poetry</SelectItem>
              <SelectItem value="non-fiction">Non-Fiction</SelectItem>
              <SelectItem value="thriller">Thriller</SelectItem>
              <SelectItem value="drama">Drama</SelectItem>
              <SelectItem value="adult">Adult</SelectItem>
              <SelectItem value="folklore">Folklore</SelectItem>
              <SelectItem value="psychology">Psychology</SelectItem>
              <SelectItem value="memoir">Memoir</SelectItem>
              <SelectItem value="spiritual">Spiritual</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="nostalgia">Nostalgia</SelectItem>
              <SelectItem value="satire">Satire</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem>
              <SelectItem value="literature">Literature</SelectItem>
             <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredBooks.map((book) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden hover:shadow-xl hover:border-emerald-400 border transition-all transform hover:-translate-y-1 group">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={book.cover_url || "/placeholder.svg"}
                    alt={book.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-4">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full mb-2 inline-block">
                    {book.language}
                  </span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full mb-2 inline-block ml-4">
                    {book.genre}
                  </span>
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <Link
                    href={`/author/${book.author_id}`}
                    className="text-emerald-600 hover:underline block mb-4"
                  >
                    {book.author}
                  </Link>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{book.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{book.reviews}</span>
                    </div>
                  </div>
                  <Link href={`/book/${book.id}`}>
                    <Button className="w-full group-hover:border group-hover:border-emerald-500 hover:shadow-lg">
                      Read Book
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredBooks.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg">📚 No books found. Try a different filter!</p>
          </div>
        )}
      </div>
    </div>
  );
}
