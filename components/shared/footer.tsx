// components/shared/footer.tsx
export function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-white/10 py-6 px-4 mt-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-zinc-500">
        <p>&copy; {new Date().getFullYear()} FirstLeaf. All rights reserved.</p>
        <div className="space-x-4">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  )
}
