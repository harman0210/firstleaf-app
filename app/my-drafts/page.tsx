'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface Book {
  id: string
  title: string
  created_at: string
}

export default function MyDraftsPage() {
  const { user } = useAuth()
  const [drafts, setDrafts] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDrafts = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('id, title, created_at')
      .eq('user_id', user?.id)
      .eq('is_draft', true)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDrafts(data)
    }
    setLoading(false)
  }

  const handlePublish = async (id: string) => {
    const { error } = await supabase
      .from('books')
      .update({ is_draft: false })
      .eq('id', id)
      .eq('user_id', user?.id)

    if (!error) {
      fetchDrafts()
    }
  }

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this draft?')
    if (!confirm) return

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id)

    if (!error) {
      fetchDrafts()
    }
  }

  useEffect(() => {
    if (user) fetchDrafts()
  }, [user])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Drafts</h1>

      {drafts.length === 0 && (
        <p className="text-gray-500">You have no drafts yet.</p>
      )}

      <div className="grid gap-4">
        {drafts.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <p className="text-sm text-gray-500">
                Created at: {new Date(book.created_at).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Link href={`/write/${book.id}`}>
                <Button variant="outline">Edit</Button>
              </Link>
              <Button onClick={() => handlePublish(book.id)}>Publish</Button>
              <Button variant="destructive" onClick={() => handleDelete(book.id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
