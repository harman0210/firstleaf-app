"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, ArrowLeft, Upload } from "lucide-react"
import { useUser } from "@/lib/useUser"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import dynamic from "next/dynamic"

// Adjust the path to your Editor component location:
const RichTextEditor = dynamic(() => import("@/components/ui/Editor"), { ssr: false })

export default function UploadPage() {
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    coverImage: null as File | null,
    bookFile: null as File | null,
    confirmOriginal: false,
    acceptTerms: false,
  })

  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
     immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML())
    },
  })

  const handleFileChange = (field: "coverImage" | "bookFile") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { title, genre, coverImage, bookFile, confirmOriginal, acceptTerms } = formData

    if (!title || !description || !genre || !coverImage || !bookFile || !confirmOriginal || !acceptTerms) {
      alert("Please complete all fields and agree to the terms.")
      return
    }

    const userId = user?.id
    if (!userId) {
      alert("User not authenticated")
      return
    }

    setLoading(true)

    const coverExt = coverImage.name.split(".").pop()
    const coverFileName = `cover-${Date.now()}.${coverExt}`

    const { data: coverData, error: coverError } = await supabase.storage
      .from("covers")
      .upload(coverFileName, coverImage)

    if (coverError) {
      alert("Error uploading cover image: " + coverError.message)
      setLoading(false)
      return
    }

    const bookFileName = `book-${Date.now()}`
    const { data: bookData, error: bookError } = await supabase.storage
      .from("books")
      .upload(bookFileName, bookFile)

    if (bookError) {
      alert("Error uploading book file: " + bookError.message)
      setLoading(false)
      return
    }

    let { data: existingAuthor } = await supabase
      .from("authors")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (!existingAuthor) {
      const { error: authorInsertError } = await supabase.from("authors").insert([{
        user_id: userId,
        name: user?.user_metadata?.username || "Anonymous",
        avatar_url: user?.user_metadata?.avatar_url || "",
        created_at: new Date().toISOString(),
      }])

      if (authorInsertError) {
        alert("Error creating author: " + authorInsertError.message)
        setLoading(false)
        return
      }

      const { data: newAuthor } = await supabase
        .from("authors")
        .select("id")
        .eq("user_id", userId)
        .single()

      existingAuthor = newAuthor
    }

    const authorId = existingAuthor?.id
    if (!authorId) {
      alert("Could not resolve author ID")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("books").insert([{
      title,
      description,
      genre,
      author_id: authorId,
      cover_url: `https://zqneqwqlbippqjkaggxc.supabase.co/storage/v1/object/public/covers/${coverFileName}`,
      book_url: bookData?.path ?? "",
      created_at: new Date().toISOString(),
      likes: 0,
      reviews: 0,
      rating: 0,
    }])

    setLoading(false)

    if (insertError) {
      alert("Error saving book details: " + insertError.message)
    } else {
      toast({
        title: "Book uploaded successfully!",
        description: "Your book is now available in the library.",
      })

      setFormData({
        title: "",
        genre: "",
        coverImage: null,
        bookFile: null,
        confirmOriginal: false,
        acceptTerms: false,
      })
      setDescription("")
      editor?.commands.setContent("")

      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            <BookOpen className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">FirstLeaf</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Publish Your Book</h1>
          <p className="text-gray-600 text-lg">Share your story with the world and get feedback from readers</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Book Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Book Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your book title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <div className="border rounded-md p-2 min-h-[150px] bg-white">
                  {editor ? <EditorContent editor={editor} /> : "Loading editor..."}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre *</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value: string) => setFormData({ ...formData, genre: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                    <SelectItem value="sci-fi">Science Fiction</SelectItem>
                    <SelectItem value="romance">Romance</SelectItem>
                    <SelectItem value="mystery">Mystery</SelectItem>
                    <SelectItem value="thriller">Thriller</SelectItem>
                    <SelectItem value="literary-fiction">Literary Fiction</SelectItem>
                    <SelectItem value="young-adult">Young Adult</SelectItem>
                    <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover-upload">Cover Image *</Label>
                <Input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange("coverImage")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="book-upload">Book File *</Label>
                <Input
                  id="book-upload"
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileChange("bookFile")}
                  required
                />
              </div>

              {uploadProgress > 0 && (
                <Progress value={uploadProgress} className="w-full mt-2" />
              )}

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="confirm-original"
                    checked={formData.confirmOriginal}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, confirmOriginal: !!checked })
                    }
                    required
                  />
                  <Label htmlFor="confirm-original" className="text-sm leading-relaxed">
                    I confirm this is my original work and is not AI-generated or plagiarized content
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="accept-terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, acceptTerms: !!checked })
                    }
                    required
                  />
                  <Label htmlFor="accept-terms" className="text-sm leading-relaxed">
                    I agree to the <Link href="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-3"
                disabled={loading || !formData.confirmOriginal || !formData.acceptTerms}
              >
                {loading ? "Publishing..." : "Publish Book"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
