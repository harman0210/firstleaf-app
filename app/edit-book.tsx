"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function EditBookPage() {
  const { id } = useParams()
  const router = useRouter()
  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: "", genre: "", description: "" })

  useEffect(() => {
    const fetchBook = async () => {
      const { data, error } = await supabase
        .from("books")
        .select("title, genre, description")
        .eq("id", id)
        .single()

      if (data) {
        setForm(data)
        setBook(data)
      }
      setLoading(false)
    }
    if (id) fetchBook()
  }, [id])

  const handleChange = (e: any) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleUpdate = async () => {
    setLoading(true)
    const { error } = await supabase
      .from("books")
      .update({
        title: form.title,
        genre: form.genre,
        description: form.description,
      })
      .eq("id", id)

    setLoading(false)
    if (!error) router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Book</h1>
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input name="title" value={form.title} onChange={handleChange} />
        </div>
        <div>
          <Label>Genre</Label>
          <Input name="genre" value={form.genre} onChange={handleChange} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea name="description" value={form.description} onChange={handleChange} />
        </div>
        <Button onClick={handleUpdate} className="bg-emerald-600 hover:bg-emerald-700 w-full">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
