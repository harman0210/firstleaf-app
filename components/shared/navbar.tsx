"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdvancedSearch from "@/components/search/AdvancedSearch";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/context/AuthModalContext";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabaseClient";

export function UserNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { openModal } = useAuthModal();

  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname.startsWith("/read/")) return null;

  const handleStartWriting = async () => {
    if (!user) return openModal();

    let { data: author } = await supabase
      .from("authors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!author) {
      const { data: newAuthor, error } = await supabase
        .from("authors")
        .insert([{ user_id: user.id, name: user.email || "Unnamed Author" }])
        .select()
        .single();

      if (error || !newAuthor) {
        alert("Failed to create author profile.");
        return;
      }

      author = newAuthor;
    }

    const { data: draft, error: draftError } = await supabase
      .from("drafts")
      .insert([
        {
          title: "Untitled Draft",
          content: "<p>Start writing your story...</p>",
          author_id: author.id,
          status: "draft",
        },
      ])
      .select()
      .single();

    if (draftError || !draft) {
      alert("Failed to create draft.");
      return;
    }

    router.push(`/write/${draft.id}`);
  };

  return (
    <>
      <header className="bg-white shadow-md fixed w-full z-50 top-0 left-0 text-black">
        <div className="container mx-auto flex justify-between items-center px-4 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2 hover:text-emerald-600 transition-colors duration-300">
              Firstleaf <span role="img" aria-label="book">📗</span>
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="text-gray-700 hover:text-black"
            >
              <Search size={20} />
            </button>
            <Link href="/"
              className="relative hover:text-emerald-600 transition-colors duration-300">Home</Link>
            <button onClick={handleStartWriting}
              className="relative hover:text-emerald-600 transition-colors duration-300">Write</button>
            <Link
              href="/library"
              className="relative hover:text-emerald-600 transition-colors duration-300">Library
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-emerald-500 transition-all group-hover:w-full duration-300"></span>
            </Link>
            <Link href="/about"
              className="relative hover:text-emerald-600 transition-colors duration-300"
            >About</Link>
            <Link href="/contact"
              className="relative hover:text-emerald-600 transition-colors duration-300"
            >Contact</Link>
            {user ? (
              <>
                <Link href="/dashboard"
                  className="relative hover:text-emerald-600 transition-colors duration-300">Profile</Link>
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback>
                    {user?.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <button onClick={openModal}
                className="relative hover:text-emerald-600 transition-colors duration-300">Login/Signup</button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 space-y-2">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 text-gray-800">Home</Link>
            <Link href="/library" onClick={() => setMenuOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 text-gray-800">Library</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 text-gray-800">About</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 text-gray-800">Contact</Link>
            {user ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 text-gray-800">
                Profile
              </Link>
            ) : (
              <button
                onClick={() => { setMenuOpen(false); openModal(); }}
                className="block w-full text-left py-2 px-3 rounded hover:bg-gray-100 text-gray-800"
              >
                Login / Signup
              </button>
            )}
          </div>
        )}

      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col">
          <div className="p-4 flex justify-between items-center text-white">
            <span className="text-lg font-semibold">Search</span>
            <button onClick={() => setSearchOpen(false)} aria-label="Close Search">
              <X size={24} />
            </button>
          </div>
          <div className="bg-white p-4 flex-1 overflow-auto">
            <AdvancedSearch closeSearch={() => setSearchOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

