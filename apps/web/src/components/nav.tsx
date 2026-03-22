import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <Link href="/" className="text-xl font-bold text-white tracking-tight">
        Forge
      </Link>
      <Button asChild size="sm" className="bg-white text-zinc-950 hover:bg-zinc-100">
        <Link href="/order">Get it done →</Link>
      </Button>
    </nav>
  )
}
