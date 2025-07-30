"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface Book {
  id: string;
  title: string;
  description: string;
  genre: string;
  language: string;
  cover_url: string;
  author_id: string;
  authors: { name: string } | null;
  reviews: { rating: number }[];
}

export default function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState<string>("")
  const [minRating, setMinRating] = useState(0);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);

      let supaQuery = supabase
        .from("books")
        .select("*, authors(name), reviews(rating),language")
        .order("created_at", { ascending: false });

      if (query) {
        supaQuery = supaQuery.ilike("title", `%${query}%`);
      }

      if (genre) {
        supaQuery = supaQuery.eq("genre", genre);
      }
      if (language) {
        supaQuery = supaQuery.eq("language", language)
      }

      const { data, error } = await supaQuery;
      if (error) {
        console.error("Error fetching books:", error.message);
        setLoading(false);
        return;
      }

      const filtered = (data || []).filter((book) => {
        if (!book.reviews || book.reviews.length === 0) return minRating === 0;
        const avg =
          book.reviews.reduce((sum, r) => sum + r.rating, 0) /
          book.reviews.length;
        return avg >= minRating;
      });

      setBooks(filtered);
      setLoading(false);
    };

    fetchBooks();
  }, [query, genre, language, minRating, page]);

  const clearFilters = () => {
    setQuery("");
    setGenre("");
    setLanguage("");
    setMinRating(0);
    setPage(1);
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto space-y-6 text-black">
       <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">Search Books</h1>
      <div className="space-y-4 md:grid md:grid-cols-4 md:gap-6 md:space-y-0">
        {/* Filter Panel */}
        <div className="space-y-4 col-span-1">
          <Input
            placeholder="Search by title..."
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
          />

          <Input
            placeholder="Genre (e.g., Fiction)"
            value={genre}
            onChange={(e) => {
              setPage(1);
              setGenre(e.target.value);
            }}
          />
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Language</label>
            <select
              value={language}
              onChange={(e) => {
                setPage(1);
                setLanguage(e.target.value);
              }}
              className="w-full border rounded px-2 py-1 text-black"
            >
              <option value="">All Languages</option>
              <option value="punjabi">Punjabi</option>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="arabic">Arabic</option>
            </select>
          </div>
          <div>
            <p className="text-sm font-medium mb-1 text-black">Minimum Rating: {minRating}</p>
            <Slider
              defaultValue={[minRating]}
              min={0}
              max={5}
              step={1}
              onValueChange={([val]) => {
                setPage(1);
                setMinRating(val);
              }}
            />
          </div>

          <Button variant="secondary" onClick={clearFilters} className="w-full text-black">
            Clear Filters
          </Button>
        </div>

        {/* Book Grid */}
        <div className="col-span-3 space-y-4">
          {loading ? (
            <p className="text-center">Loading books...</p>
          ) : books.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No books found matching your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.slice((page - 1) * pageSize, page * pageSize).map((book) => (
                <Card key={book.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <Link href={`/book/${book.id}`}>
                      <Image
                        src={book.cover_url || "/placeholder.png"}
                        alt={book.title}
                        width={500}
                        height={300}
                        className="rounded-md w-full h-48 object-cover"
                      />
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {book.description}
                    </p>
                    <p className="text-xs mt-2 text-primary">
                      By {book.authors?.name || "Unknown Author"}
                    </p>
                    <p className="text-xs mt-1 text-foreground">
                      Genre: {book.genre || "-"}
                    </p>
                    <p className="text-xs mt-1 text-foreground">Language: {book.language || "-"}</p>

                  </CardContent>

                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {books.length > pageSize && (
            <div className="flex justify-center gap-4 pt-4 text-black">
              <Button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page * pageSize >= books.length}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
