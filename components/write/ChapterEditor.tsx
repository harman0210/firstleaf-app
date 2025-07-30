// components/write/ChapterEditor.tsx
"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function ChapterEditor({ chapterId, content }: { chapterId: string; content: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate({ editor }) {
      const updated = editor.getHTML()
      supabase.from("chapters").update({ content: updated }).eq("id", chapterId)
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="prose max-w-none border border-gray-200 rounded-md p-4 bg-white shadow">
      <EditorContent editor={editor} />
    </div>
  )
}
