import { useState, useEffect } from 'react'
import { useUser } from '@/lib/useUser'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function ReadingChallenges() {
  const { user } = useUser()
  const [challenges, setChallenges] = useState([])
  const [userChallenges, setUserChallenges] = useState([])

  useEffect(() => {
    if (user) {
      fetchChallenges()
      fetchUserChallenges()
    }
  }, [user])

  const fetchChallenges = async () => {
    const { data, error } = await supabase
      .from('reading_challenges')
      .select('*')

    if (error) console.error('Error fetching challenges:', error)
    else setChallenges(data)
  }

  const fetchUserChallenges = async () => {
    const { data, error } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', user.id)

    if (error) console.error('Error fetching user challenges:', error)
    else setUserChallenges(data)
  }

  const joinChallenge = async (challengeId) => {
    // Implement logic to join a challenge
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reading Challenges</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader>
              <CardTitle>{challenge.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{challenge.description}</p>
              <p>Goal: {challenge.goal} books</p>
              <Button onClick={() => joinChallenge(challenge.id)}>Join Challenge</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <h2 className="text-xl font-bold mt-8 mb-4">Your Challenges</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userChallenges.map((userChallenge) => (
          <Card key={userChallenge.id}>
            <CardHeader>
              <CardTitle>{userChallenge.challenge.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(userChallenge.progress / userChallenge.challenge.goal) * 100} />
              <p>{userChallenge.progress} / {userChallenge.challenge.goal} books read</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}