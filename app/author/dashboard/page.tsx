"use client";

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/useUser'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function AuthorDashboard() {
  const { user } = useUser()
  const [books, setBooks] = useState([])
  const [stats, setStats] = useState({ totalReads: 0, totalLikes: 0, totalReviews: 0 })

  useEffect(() => {
    if (user) {
      fetchAuthorBooks()
      fetchAuthorStats()
    }
  }, [user])

  const fetchAuthorBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('author_id', user.id)

    if (error) console.error('Error fetching books:', error)
    else setBooks(data)
  }

  const fetchAuthorStats = async () => {
    // Implement logic to fetch total reads, likes, and reviews for the author's books
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Author Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Reads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalReads}</p>
          </CardContent>
        </Card>
        {/* Similar cards for Total Likes and Total Reviews */}
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Book Performance</h2>
        <BarChart width={600} height={300} data={books}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="reads" fill="#8884d8" />
          <Bar dataKey="likes" fill="#82ca9d" />
        </BarChart>
      </div>
      <Button onClick={() => {/* Implement logic to create a new book */}}>
        Create New Book
      </Button>
    </div>
  )
}