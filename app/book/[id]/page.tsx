"use client";
//app/book/[id] (this is the particular book page)

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Star, Heart, User } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params?.id as string;

  const [book, setBook] = useState<any>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);

  const { openModal } = useAuthModal();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (!bookId) return;

    const fetchBook = async () => {
      const { data: bookData, error } = await supabase
        .from("books")
        .select("id, title, description, genre, language, cover_url, book_url, created_at, author_id, authors ( name )")
        .eq("id", bookId)
        .single();

      if (error) {
        console.error("Error fetching book:", error.message);
        return;
      }

      const [{ data: likesData }, { data: reviewsData }] = await Promise.all([
        supabase.from("likes").select("id").eq("book_id", bookId),
        supabase.from("reviews").select("id, content, rating, created_at, user_id").eq("book_id", bookId),
      ]);

      setBook({
        ...bookData,
        author: bookData.authors?.name || "Unknown",
        reviews: reviewsData || [],
      });

      setLikeCount(likesData?.length || 0);
    };

    fetchBook();
  }, [bookId]);

  const handleLike = async () => {
    if (!user) return openModal();
    if (isLiked) return;

    const { error } = await supabase.from("likes").insert({ book_id: bookId, user_id: user.id });

    if (!error) {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    } else {
      console.error("Error liking book:", error.message);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) return openModal();
    if (!newReview.trim()) return;

    const { error } = await supabase.from("reviews").insert({
      book_id: bookId,
      content: newReview,
      rating: newRating,
      user_id: user.id,
    });

    if (!error) {
      setBook((prev: any) => ({
        ...prev,
        reviews: [...prev.reviews, {
          id: Date.now(),
          content: newReview,
          rating: newRating,
          created_at: new Date().toISOString(),
          user_id: user.id,
        }],
      }));
      setNewReview("");
      setNewRating(5);
    } else {
      console.error("Error submitting review:", error.message);
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          onClick={() => interactive && onRate?.(star)}
          className={`h-5 w-5 transition-colors ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
        />
      ))}
    </div>
  );

  const handleViewFullBookClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      openModal();
    }
  };

  if (!book) {
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        📖 Loading book details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-md">
              <CardContent className="p-6">
                <div className="aspect-[3/4] relative mb-4">
                  <Image
                    src={book.cover_url || "/placeholder.svg"}
                    alt={book.title}
                    fill
                    className="object-cover rounded-xl shadow-sm"
                  />
                </div>
                <Badge variant="secondary" className="mb-2">
                  {book.language}
                </Badge>
                <Badge variant="secondary" className="mb-2">
                  {book.genre}
                </Badge>
                <h1 className="text-2xl font-bold mb-2 text-gray-800">{book.title}</h1>
                <Link
                  href={`/author/${book.author_id}`}
                  className="text-emerald-600 hover:underline block mb-4"
                >
                  by {book.author}
                </Link>

                <div className="flex items-center space-x-2 mb-4">
                  {renderStars(5)}
                  <span className="text-sm text-gray-500">({book.reviews.length} reviews)</span>
                </div>

                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {book.description}
                </p>

                <Button onClick={handleLike} className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  {likeCount} Likes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-10">
            {/* Book File */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  <span>Book File</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`/read/${book.id}`}
                  className="text-emerald-600 underline hover:text-emerald-700"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleViewFullBookClick}
                >
                  View Full Book
                </a>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Reviews ({book.reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Submit Review */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold mb-3 text-gray-800">Write a Review</h3>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    {renderStars(newRating, true, setNewRating)}
                  </div>
                  <Textarea
                    placeholder="Your thoughts..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    className="mb-3"
                  />
                  <Button onClick={handleSubmitReview} className="bg-emerald-600 hover:bg-emerald-700">
                    Submit Review
                  </Button>
                </div>

                {/* Display Reviews */}
                {book.reviews.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No reviews yet. Be the first to write one!</p>
                )}

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
                          <span className="font-medium text-sm">Anonymous</span>
                          <span className="text-xs text-gray-500">{review.created_at?.slice(0, 10)}</span>
                        </div>
                        <div className="mb-1">{renderStars(review.rating)}</div>
                        <p className="text-gray-700 text-sm leading-snug">{review.content}</p>
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
  );
}
