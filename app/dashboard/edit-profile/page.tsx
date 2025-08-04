"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"
import {
  TextInput,
  Textarea,
  Button,
  Title,
  Paper,
  Group,
  Image,
  Loader,
  Box,
  Stack,
  Text,
  Center,
} from "@mantine/core"
import { notifications } from "@mantine/notifications"

export default function EditProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      const { data: author, error } = await supabase
        .from("authors")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error || !author) {
        notifications.show({ title: "Error", message: "Failed to load profile", color: "red" })
        router.push("/dashboard")
        return
      }

      setName(author.name || "")
      setBio(author.bio || "")
      setLocation(author.location || "")
      setAvatarUrl(author.avatar_url || "")
      setLoading(false)
    }

    fetchProfile()
  }, [user, router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarUrl(URL.createObjectURL(file))
    }
  }

  const uploadAvatar = async (): Promise<string> => {
    if (!avatarFile) return avatarUrl
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `avatar-${user?.id}-${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, { upsert: true })

    if (error) throw error

    return `https://zqneqwqlbippqjkaggxc.supabase.co/storage/v1/object/public/avatars/${fileName}`
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const uploadedAvatarUrl = await uploadAvatar()

      const { error } = await supabase
        .from("authors")
        .update({
          name,
          bio,
          location,
          avatar_url: uploadedAvatarUrl,
        })
        .eq("user_id", user?.id)

      if (error) throw error

      notifications.show({
        title: "Profile Updated",
        message: "Your profile has been updated successfully.",
        color: "green",
      })

      router.push("/dashboard")
    } catch (err: any) {
      notifications.show({
        title: "Update Failed",
        message: err.message,
        color: "red",
      })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="xl" />
      </Center>
    )
  }

  return (
   
    <Box maw={480} mx="auto" py="xl" px="">
          <div className="absolute inset-0 -z-10 h-full w-full">
        <Image src="/blue-bg.png" alt="background" className="object-cover opacity-50" />
      </div>
      <Title order={2} mb="xl" align="center">
        Edit Profile
      </Title>

      <Paper className="text-black" shadow="md" p="xl" withBorder radius="md">
        <Stack spacing="md">
          <TextInput
            label="Name"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            disabled={saving}
            required
          />
          <Textarea
            label="Bio"
            placeholder="Tell us about yourself"
            value={bio}
            onChange={(e) => setBio(e.currentTarget.value)}
            disabled={saving}
            minRows={4}
          />
          <TextInput
            label="Location"
            placeholder="Where are you from?"
            value={location}
            onChange={(e) => setLocation(e.currentTarget.value)}
            disabled={saving}
          />

          <Box>
            <Text size="sm" weight={500} mb={4}>
              Avatar
            </Text>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={saving}
              style={{ cursor: saving ? "not-allowed" : "pointer" }}
            />
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={96}
                height={96}
                mt="sm"
                radius="50%"
                style={{ objectFit: "cover" }}
              />
            )}
          </Box>

          <Group position="right" spacing="md" mt="xl">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  )
}
