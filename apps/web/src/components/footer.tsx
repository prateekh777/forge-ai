import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-12">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-xl font-bold text-white tracking-tight">Forge</p>
          <p className="text-zinc-500 text-sm mt-1">AI does the work. You take the credit.</p>
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
          <span>© 2026 Forge</span>
        </div>
      </div>
    </footer>
  )
}
