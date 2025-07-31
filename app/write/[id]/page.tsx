"use client"

import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { RichTextEditor } from "@mantine/tiptap"
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Image,
  Loader,
  Group,
  Box,
  Paper,
  Title,
  Text,
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

export default function WritePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  // ⛔️ Redirect unauthenticated users
  useEffect(() => {
    if (!user) {
      router.push("/") // ✅ update path if needed
    }
  }, [user])

  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState("Uncategorized")
  const [description, setDescription] = useState("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState("")
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [bookUrl, setBookUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [authorId, setAuthorId] = useState<string | null>(null)
  const [language, setLanguage] = useState<string | null>("english");


  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start writing your book...</p>",
    editorProps: { attributes: { class: "min-h-[400px] p-3 bg-white rounded border" } },
    autofocus: false,
    editable: true,
    injectCSS: true,
    immediatelyRender: false,
  })

  useEffect(() => {
    async function loadDraft() {
      if (!id) return
      setLoading(true)
      const { data: draft, error } = await supabase
        .from("drafts")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !draft) {
        notifications.show({ title: "Error", message: "Failed to load draft.", color: "red" })
        setLoading(false)
        return
      }

      setTitle(draft.title || "")
      setDescription(draft.description || "")
      setGenre(draft.genre || "Uncategorized")
      setCoverUrl(draft.cover_url || "")
      setBookUrl(draft.book_url || "")
      setAuthorId(draft.author_id || null)

      if (editor && draft.content) {
        try {
          // Try setting JSON content if available
          if (typeof draft.content === "object") {
            editor.commands.setContent(draft.content)
          } else {
            editor.commands.setContent(draft.content)
          }
        } catch {
          editor.commands.setContent("<p>Start writing your book...</p>")
        }
      }
      setLoading(false)
    }

    if (editor) loadDraft()
  }, [editor, id])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0]
      setCoverFile(file)
      setCoverUrl(URL.createObjectURL(file))
    }
  }

  const handleBookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setBookFile(e.target.files[0])
    }
  }

  const uploadBookFile = async (): Promise<string> => {
    if (!bookFile) return bookUrl
    const fileExt = bookFile.name.split(".").pop()
    const filePath = `books/${id}_book.${fileExt}`

    const { error } = await supabase.storage.from("books").upload(filePath, bookFile, { upsert: true })
    if (error) throw error

    const { data } = supabase.storage.from("books").getPublicUrl(filePath)
    return data.publicUrl
  }

  const uploadCoverFile = async (): Promise<string> => {
    if (!coverFile) return coverUrl
    const fileExt = coverFile.name.split(".").pop()
    const fileName = `cover-${Date.now()}.${fileExt}`

    const { error } = await supabase.storage.from("covers").upload(fileName, coverFile, { upsert: true })
    if (error) throw error

    return `https://zqneqwqlbippqjkaggxc.supabase.co/storage/v1/object/public/covers/${fileName}`
  }

  const saveDraft = async () => {
    if (!editor || !id) return
    setLoading(true)
    const uploadedCoverUrl = await uploadCoverFile()

    try {
      const { error } = await supabase
        .from("drafts")
        .update({
          title,
          language,
          genre,
          description,
          content: editor.getText(),
          updated_at: new Date(),
          author_id: authorId,
          cover_url: uploadedCoverUrl,
        })
        .eq("id", String(id))

      if (error) throw error
      notifications.show({ title: "Draft Saved", message: "Your draft has been saved successfully.", color: "green" })
      router.push("/dashboard")
    } catch (err: any) {
      notifications.show({ title: "Save Error", message: err.message, color: "red" })
    }
    setLoading(false)
  }

  const handlePublish = async () => {
    if (!editor || !title || !genre || !authorId) {
      notifications.show({ title: "Missing Information", message: "Title, genre, and author must be provided.", color: "yellow" })
      return
    }

    const { data: authorRecord } = await supabase.from("authors").select("id").eq("user_id", user?.id).single()
    if (!authorRecord || authorRecord.id !== authorId) {
      notifications.show({ title: "Unauthorized", message: "You are not authorized to publish this draft.", color: "red" })
      return
    }

    setLoading(true)
    try {
      const uploadedCoverUrl = await uploadCoverFile()
      const uploadedBookUrl = await uploadBookFile()

      const { data: draft } = await supabase.from("drafts").select("*").eq("id", id).single()

      const { data: book, error } = await supabase
        .from("books")
        .insert([{
          title,
          content: editor.getText(),
          description,
          genre,
          language,
          cover_url: uploadedCoverUrl,
          book_url: uploadedBookUrl,
          author_id: authorId,
          publish_date: new Date(),
          rating: 0,
          reviews: 0,
          likes: 0,
          created_at: new Date(),
        }])
        .select()
        .single()

      if (error) throw error

      await supabase.from("drafts").delete().eq("id", id)

      notifications.show({ title: "Book Published", message: "Your book is now live!", color: "green" })
      router.push(`/book/${book.id}`)
    } catch (err: any) {
      notifications.show({ title: "Publish Error", message: err.message, color: "red" })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !editor) return <Loader size="lg" className="mt-10" />

  return (

    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 h-full w-full">
        <Image src="/moon.svg" alt="background" className="object-cover opacity-20" />
      </div>
      <div className="max-w-4xl mx-auto p-4 text-black">
        <Title order={2} mb="md" className="text-white">Write Your Book</Title>
        <Paper shadow="xs" p="md" mb="lg" withBorder>
          <Title order={4} mb="sm">Book Information</Title>
          <TextInput label="Title" placeholder="Book title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} mb="sm" disabled={loading} />
          <Textarea label="Description" placeholder="Short description" value={description} onChange={(e) => setDescription(e.currentTarget.value)} minRows={3} mb="sm" disabled={loading} />
          <Select
            label="Language"
            placeholder="Select language"
            searchable
            clearable
            data={[
              { value: "punjabi", label: "Punjabi" },
              { value: "english", label: "English" },
              { value: "hindi", label: "Hindi" },
              { value: "spanish", label: "Spanish" },
              { value: "telgu", label: "Telgu" },
              { value: "arabic", label: "Arabic" },
              { value: "gujarati", label: "Gujarati" },
            ]}
            value={language}
            onChange={(val) => setLanguage(val)}
            mb="sm"
            styles={{
              dropdown: {
                backgroundColor: "black", // dropdown background
              },
              input: {
                color: "black", // selected value text color
              },
            }}
          />
          <Select
            label="Genre"
            data={[
              "Uncategorized",
              "Fantasy",
              "Sci-Fi",
              "Romance",
              "Fiction",
              "Mystery",
              "Horror",
              "Poetry",
              "Non-Fiction",
              "Thriller",
              "Drama",
              "Adult",
              "Folklore",
              "Psychology",
              "Memoir",
              "Spiritual",
              "Family",
              "Nostalgia",
              "Satire",
              "Adventure",
              "Literature",
              "Other"
            ]}
            value={genre}
            onChange={(value) => setGenre(value || "Uncategorized")}
            mb="sm"
            disabled={loading}
            placeholder="Choose a genre"
            styles={{
              dropdown: {
                backgroundColor: "black", // dropdown background
              },
              input: {
                color: "black", // selected value text color
              },
            }}
          />
        </Paper>
        <Paper shadow="xs" p="md" mb="lg" withBorder>
          <Title order={4} mb="sm">Upload Files</Title>
          <Box mb="sm">
            <Text size="sm" fw={500}>Cover Image</Text>
            <input type="file" accept="image/*" onChange={handleCoverChange} disabled={loading} />
            {coverUrl && <Image src={coverUrl} alt="Cover" width={120} height={160} className="mt-3 object-cover" />}
          </Box>
        </Paper>
        <Paper shadow="xs" p="md" mb="xl" withBorder>
          <Title order={4} mb="sm">Content</Title>
          <RichTextEditor editor={editor}>
            <RichTextEditor.Toolbar sticky stickyOffset={0}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
              </RichTextEditor.ControlsGroup>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>
            <RichTextEditor.Content />
          </RichTextEditor>
        </Paper>

        <Group position="left" gap="md">
          <Button variant="outline" onClick={saveDraft} disabled={loading}>{loading ? "Saving..." : "Save Draft"}</Button>
          <Button onClick={handlePublish} disabled={loading}>{loading ? "Publishing..." : "Publish Book"}</Button>
        </Group>
      </div>
    </div>
  )
}
