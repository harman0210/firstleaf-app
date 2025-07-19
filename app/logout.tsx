import { supabase } from "@/lib/supabaseClient"

const handleLogout = async () => {
  await supabase.auth.signOut()
  window.location.reload()
}
