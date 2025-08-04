"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Languages, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
//import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"
import { useMemo } from "react";


const genres = [
  "all",
  "fantasy",
  "sci-fi",
  "romance",
  "fiction",
  "mystery",
  "horror",
  "poetry",
  "non-fiction",
  "thriller",
  "drama",
  "adult",
  "folklore",
  "psychology",
  "memoir",
  "spiritual",
  "family",
  "nostalgia",
  "satire",
  "adventure",
  "literature",
  "other"
];


export default function EditBookPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: "", genre: "", language: "", description: "", content: "" })
  const [authorName, setAuthorName] = useState("")
  const [coverPreview, setCoverPreview] = useState("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [authorId, setAuthorId] = useState("")
  // const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/") // ✅ update path if needed
    }
  }, [user])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: book, error: bookErr } = await supabase
        .from("books")
        .select("title, genre, language, description, cover_url, author_id, content")
        .eq("id", id)
        .single()

      if (bookErr || !book) {
        toast({ title: "Error loading book", variant: "destructive" })
        setLoading(false)
        return
      }

      const { data: author, error: authorErr } = await supabase
        .from("authors")
        .select("id, name")
        .eq("id", book.author_id)
        .single()

      setForm({ title: book.title, genre: book.genre, language: book.language, description: book.description, content: book.content })
      setAuthorName(author?.name || "")
      setAuthorId(author?.id || "")
      setCoverPreview(book.cover_url || "")
      setLoading(false)
    }
    loadData()
  }, [id, toast])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    if (f) {
      setCoverFile(f)
      setCoverPreview(URL.createObjectURL(f))
    }
  }

  const handleUpdate = async () => {
    setLoading(true)
    let newCoverUrl = coverPreview

    if (coverFile) {
      const ext = coverFile.name.split(".").pop()
      const filename = `cover-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from("covers")
        .upload(filename, coverFile)

      if (uploadErr) {
        toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" })
        setLoading(false)
        return
      }

      newCoverUrl = `https://zqneqwqlbippqjkaggxc.supabase.co/storage/v1/object/public/covers/${filename}`
    }

    const { data: updatedBook, error: bookErr } = await supabase
      .from("books")
      .update({
        title: form.title,
        genre: form.genre,
        language: form.language,
        description: form.description,
        cover_url: newCoverUrl,
        content: form.content
      })
      .eq("id", id)
      .select()
      .single()

    const { data: updatedAuthor, error: authorErr } = await supabase
      .from("authors")
      .update({ name: authorName })
      .eq("id", authorId)
      .select()
      .single()

    setLoading(false)

    if (bookErr || authorErr) {
      toast({
        title: "Update failed",
        description: (bookErr || authorErr)?.message,
        variant: "destructive"
      })
      return
    }

    toast({ title: "Update successful!" })
    router.push("/dashboard") // ✅ Redirect after update
  }

  if (loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
  }

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 sm:px-6 sm:py-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-md space-y-6 text-black">
      <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">Edit Book</h1>
      <div className="space-y-2">
        <Label >Title</Label>
        <Input className="text-black dark:text-white"
          value={form.title}
          onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label>Genre</Label>
        <Select value={form.genre} onValueChange={v => setForm(prev => ({ ...prev, genre: v }))}>
          <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
          <SelectContent>
            {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>language</Label>
        <Select
          value={form.language}
          onValueChange={(v) => setForm((prev) => ({ ...prev, language: v }))}
        >
          <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
          <SelectContent>
            {[
                "punjabi",
                "english",
                "hindi",
                "gujarati",
                "bengali",
                "telugu",
                "tamil",
                "kannada",
                "malayalam",
                "marathi"

              ].map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          className="text-black dark:text-white"
          value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          rows={1}
        />
      </div>
      <div className="space-y-2">
        <Label>Author Name</Label>
        <Input
          className="text-black dark:text-white"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Cover</Label>
        {coverPreview && (
          <Image src={coverPreview} width={120} height={160} alt="Cover Preview"
            className="rounded-md border border-zinc-300 dark:border-zinc-700" />
        )}
        <Input type="file" accept="image/*" onChange={handleCoverChange} />
      </div>
      <div className="space-y-2">
        <Label>
          Rewrite the content(book)
        </Label>
        <Textarea
          className="text-black dark:text-white"
          value={form.content}
          onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
        />
      </div>
      <Button onClick={handleUpdate} disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg">
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}
