'use client'

import { Dialog } from '@headlessui/react'
import { useAuthModal } from '@/context/AuthModalContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AuthModal() {
  const { isOpen, closeModal } = useAuthModal()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'auth' | 'profile-setup'>('auth')

  const [avatarUrl, setAvatarUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const router = useRouter()

  const avatars = [
    'https://avatars.dicebear.com/api/pixel-art-neutral/user1.svg',
    'https://avatars.dicebear.com/api/pixel-art-neutral/user2.svg',
    'https://avatars.dicebear.com/api/pixel-art-neutral/user3.svg',
    'https://avatars.dicebear.com/api/pixel-art-neutral/user4.svg'
  ]

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) closeModal()
    })
  }, [])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const handleEmailAuth = async () => {
    setLoading(true)
    setError('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else {
        closeModal()
        router.refresh()
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setStep('profile-setup')
      }
    }

    setLoading(false)
  }

  const handleUpload = async (file: File, userId: string) => {
    const ext = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (error) {
      setError('Upload failed')
      return ''
    }

    const { publicUrl } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleProfileSetup = async () => {
    setLoading(true)
    setError('')

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setError('No user found')
      setLoading(false)
      return
    }

    let finalAvatarUrl = avatarUrl

    if (file) {
      const uploadedUrl = await handleUpload(file, user.id)
      if (!uploadedUrl) {
        setError('Image upload failed')
        setLoading(false)
        return
      }
      finalAvatarUrl = uploadedUrl
    }

    // Save to users table
    await supabase.from('users').upsert([
      { id: user.id, name: name.trim(), avatar_url: finalAvatarUrl }
    ])

    // ✅ Prevent duplicate author creation
    const { data: existingAuthor, error: authorCheckError } = await supabase
      .from('authors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existingAuthor && !authorCheckError) {
      await supabase.from('authors').insert([
        { user_id: user.id, name: name.trim(), avatar_url: finalAvatarUrl }
      ])
    }

    closeModal()
    router.refresh()
    setLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setAvatarUrl('')
    }
  }

  if (!isOpen) return null

  return (
    <Dialog
      open={isOpen}
      onClose={closeModal}
      className="fixed z-[999] inset-0 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md space-y-6 text-black relative">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          &times;
        </button>

        {step === 'auth' && (
          <>
            <h1 className="text-2xl font-bold text-center">
              {isLogin ? 'Please Login' : 'Create an Account'}
            </h1>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <div className="space-y-4">
              {!isLogin && (
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Button onClick={handleEmailAuth} className="w-full" disabled={loading}>
                {isLogin ? 'Login with Email' : 'Sign Up with Email'}
              </Button>
            </div>

            <div className="relative text-center">
              <span className="absolute left-0 top-1/2 w-full border-t border-gray-300 transform -translate-y-1/2"></span>
              <span className="bg-white px-2 text-gray-500 relative z-10">or</span>
            </div>

            <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-500">
              {isLogin ? 'New here?' : 'Already have an account?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </>
        )}

        {step === 'profile-setup' && (
          <>
            <h2 className="text-xl font-semibold text-center">Set up your avatar</h2>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Upload Avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500"
                />
              </label>

              {file && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover mx-auto border"
                />
              )}

              <div className="text-center text-sm text-gray-500">Or choose an avatar</div>
              <div className="grid grid-cols-4 gap-3">
                {avatars.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="avatar option"
                    className={`w-16 h-16 rounded-full cursor-pointer border-2 ${
                      avatarUrl === url ? 'border-indigo-600' : 'border-transparent'
                    }`}
                    onClick={() => {
                      setAvatarUrl(url)
                      setFile(null)
                    }}
                  />
                ))}
              </div>

              <Button onClick={handleProfileSetup} className="w-full mt-4" disabled={loading}>
                Save and Continue
              </Button>

              <button
                onClick={() => {
                  setAvatarUrl('https://avatars.dicebear.com/api/pixel-art-neutral/default.svg')
                  handleProfileSetup()
                }}
                className="text-sm text-center text-gray-500 underline block mx-auto mt-2"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </Dialog.Panel>
    </Dialog>
  )
}
