import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key for server
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { id, ended_at, duration } = req.body

    if (!id || !ended_at || duration === undefined) {
      return res.status(400).json({ error: 'Missing parameters' })
    }

    const { error } = await supabase
      .from('reading_sessions')
      .update({ ended_at,duration: duration })
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.status(200).json({ message: 'Session ended' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}
