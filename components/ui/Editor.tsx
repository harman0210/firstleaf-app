"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, useState } from "react"

type Props = {
  content: string
  onChange: (value: string) => void
}

export default function Editor({ content, onChange }: Props) {
  const [mounted, setMounted] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: "prose min-h-[150px] focus:outline-none p-2",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !editor) return <p>Loading editor...</p>

  return <EditorContent editor={editor} />
}
