"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useAuthModal } from "@/context/AuthModalContext";
import { Card } from "@/components/ui/card"

const genres = ["fantasy", "sci-fi", "romance", "mystery", "thriller", "literary-fiction", "young-adult", "non-fiction", "other"]

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { openModal } = useAuthModal();


  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [authorId, setAuthorId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", genre: "", language: "", description: "" })
  const [coverPreview, setCoverPreview] = useState<string>("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [bookFile, setBookFile] = useState<File | null>(null)

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (!user || error) {
        return openModal()
      }

        setUserId(user.id)

        const { data: author } = await supabase
          .from("authors")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (author) {
          setAuthorId(author.id)
        } else {
          const { data: newAuthor, error: createErr } = await supabase
            .from("authors")
            .insert([
              {
                user_id: user.id,
                name: user.user_metadata.name || user.email,
                avatar_url: user.user_metadata.avatar_url || null,
              },
            ])
            .select()
            .single()

          if (createErr || !newAuthor) {
            toast({ title: "Failed to create author", variant: "destructive" })
            return
          }

          setAuthorId(newAuthor.id)
        }

        setLoading(false)
      }

      init()
    }, [])
  


  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    if (f) {
      setCoverFile(f)
      setCoverPreview(URL.createObjectURL(f))
    }
  }

  const handleBookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    if (f) {
      setBookFile(f)
    }
  }

  const handleUpload = async () => {
    if (!authorId || !bookFile) {
      return toast({
        title: "Missing required fields",
        description: "Make sure to select a book file and fill all inputs.",
        variant: "destructive",
      })
    }

    setLoading(true)
    let coverUrl = ""
    let bookUrl = ""

    if (coverFile) {
      const ext = coverFile.name.split(".").pop()
      const filename = `cover-${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from("covers")
        .upload(filename, coverFile)

      if (uploadErr) {
        setLoading(false)
        return toast({ title: "Cover upload failed", description: uploadErr.message, variant: "destructive" })
      }

      coverUrl = `https://zqneqwqlbippqjkaggxc.supabase.co/storage/v1/object/public/covers/${filename}`
    }

    const ext = bookFile.name.split(".").pop()
    const bookFilename = `book-${Date.now()}.${ext}`

    const { error: bookUploadErr } = await supabase.storage
      .from("books")
      .upload(bookFilename, bookFile)

    if (bookUploadErr) {
      setLoading(false)
      return toast({ title: "Book upload failed", description: bookUploadErr.message, variant: "destructive" })
    }

    bookUrl = `https://zqneqwqlbippqjkaggxc.supabase.co/storage/v1/object/public/books/${bookFilename}`

    const { error: bookInsertErr } = await supabase.from("books").insert([
      {
        title: form.title,
        genre: form.genre,
        language: form.language,
        description: form.description,
        cover_url: coverUrl,
        book_url: bookUrl,
        author_id: authorId,
      },
    ])

    setLoading(false)

    if (bookInsertErr) {
      return toast({ title: "Upload failed", description: bookInsertErr.message, variant: "destructive" })
    }

    toast({ title: "Book uploaded successfully" })
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <h2 className="text-center text-black">YOUR BOOKS IS UPLOADING, PLEASE WAIT!</h2>
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6 shadow-xl border border-emerald-300 rounded-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-emerald-700">📚 Upload Your Book</h1>
        <p className="text-gray-600 text-lg">Share your story with the world and get feedback from readers</p>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            placeholder="Enter book title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            value={form.language}
            onValueChange={(v) => setForm((prev) => ({ ...prev, language: v }))}
          >  <SelectTrigger>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="punjabi">Punjabi</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">Hindi</SelectItem>
              <SelectItem value="gujarati">Gujarati</SelectItem>
              <SelectItem value="bengali">Bengali</SelectItem>
              <SelectItem value="telugu">Telugu</SelectItem>
              <SelectItem value="tamil">Tamil</SelectItem>
              <SelectItem value="kannada">Kannada</SelectItem>
              <SelectItem value="malayalam">Malayalam</SelectItem>
              <SelectItem value="marathi">Marathi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Genre</Label>
          <Select value={form.genre} onValueChange={(v) => setForm((prev) => ({ ...prev, genre: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Write a brief description..."
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Cover Image</Label>
          {coverPreview && (
            <Image
              src={coverPreview}
              alt="Cover Preview"
              width={120}
              height={180}
              className="rounded border my-2"
            />
          )}
          <Input type="file" accept="image/*" onChange={handleCoverChange} />
        </div>

        <div className="space-y-2">
          <Label>Book File (.pdf/.epub)</Label>
          <Input type="file" accept=".pdf,.epub" onChange={handleBookChange} />
        </div>

        <Button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : "📤 Upload Book"}
        </Button>
      </Card>
    </div>
  )
}
