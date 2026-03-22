import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Nav from '@/components/nav'
import Footer from '@/components/footer'

const taskTypes = [
  { label: 'Automation', desc: 'Scripts, bots, and workflows that run themselves.' },
  { label: 'Content', desc: 'Blog posts, copy, emails, and social media.' },
  { label: 'AI Agents', desc: 'Autonomous agents that research, decide, and act.' },
  { label: 'Integrations', desc: 'Connect your tools — Zapier-style, but smarter.' },
  { label: 'Data Analysis', desc: 'Turn raw data into insight and decisions.' },
  { label: 'Custom', desc: 'Anything else. If it can be done, we deliver it.' },
]

const steps = [
  { num: '01', title: 'Describe your task', desc: 'Tell us what you need in plain English. Attach files if needed. No technical knowledge required.' },
  { num: '02', title: 'Pay a flat fee', desc: 'We quote you upfront — no hourly rates, no surprises. Pay once, get it done.' },
  { num: '03', title: 'AI delivers it', desc: 'Our system works on your task and delivers the result directly to you. Usually within hours.' },
]

const testimonials = [
  {
    quote: 'I described what I needed in two sentences and got back a fully working Python script 30 minutes later. Insane.',
    name: 'Marcus T.',
    role: 'Founder, SaaS startup',
  },
  {
    quote: "We've replaced an entire category of freelance spend with Forge. The quality is consistently excellent.",
    name: 'Priya S.',
    role: 'Operations Lead',
  },
  {
    quote: 'The data analysis report they delivered saved us three days of work. For €49. That math is not complicated.',
    name: 'James K.',
    role: 'Head of Growth',
  },
  // TODO: pull from feedback table in p1.x
]

const faqs = [
  {
    q: 'What kinds of tasks can you handle?',
    a: 'Automation scripts, content writing, data analysis, AI agents, tool integrations, and more. If it can be done with a computer and intelligence, we can deliver it.',
  },
  {
    q: 'How fast is delivery?',
    a: 'Most tasks are delivered within 1–4 hours. Complex tasks may take longer — we\'ll tell you upfront.',
  },
  {
    q: 'What if I\'m not happy with the result?',
    a: 'We\'ll revise it until it\'s right. If we genuinely can\'t deliver, you get a full refund. No questions asked.',
  },
  {
    q: 'Do I need a technical background?',
    a: 'Not at all. Describe the task the way you\'d explain it to a smart colleague. We handle everything else.',
  },
  {
    q: 'Is my data safe?',
    a: 'We process your task data to deliver the result and nothing more. Files are stored securely and deleted after 30 days.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Nav />

      {/* Hero */}
      <section className="pt-40 pb-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-800">
            Powered by Claude, GPT-4o, and more
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight text-white mb-6">
            Describe the task.<br />We deliver it.
          </h1>
          <p className="text-xl text-zinc-400 max-w-xl mx-auto mb-10">
            Forge is an AI-powered service factory. Tell us what you need,
            pay a flat fee, and get professional results — no freelancers, no waiting, no BS.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-zinc-950 hover:bg-zinc-100 text-base px-8 h-12">
              <Link href="/order">Start your task →</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-zinc-400 hover:text-white text-base h-12">
              <a href="#how-it-works">See how it works ↓</a>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">How it works</h2>
          <p className="text-zinc-400 text-center mb-16 text-lg">Three steps. That&apos;s it.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col gap-3">
                <span className="text-5xl font-bold text-zinc-700">{step.num}</span>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-24 px-6 border-t border-zinc-800 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">What we can do for you</h2>
          <p className="text-zinc-400 text-center mb-16 text-lg">Six categories. Hundreds of task types.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {taskTypes.map((type) => (
              <Card key={type.label} className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold text-lg mb-2">{type.label}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{type.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, flat pricing</h2>
          <p className="text-zinc-400 text-lg mb-12">No subscriptions. No hourly rates. Pay once per task.</p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10">
            <p className="text-zinc-400 text-sm uppercase tracking-widest mb-2">Starting from</p>
            <p className="text-7xl font-bold text-white mb-2">€29</p>
            <p className="text-zinc-400 mb-8">per task — priced by complexity at checkout</p>
            <ul className="text-left space-y-3 mb-10 max-w-xs mx-auto">
              {[
                'Quoted upfront before you pay',
                'Revisions included',
                'Full refund if unsatisfied',
                'Delivered within hours',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <span className="text-white">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="bg-white text-zinc-950 hover:bg-zinc-100 text-base px-10 h-12">
              <Link href="/order">Start your task →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 border-t border-zinc-800 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">What customers say</h2>
          <p className="text-zinc-400 text-center mb-16 text-lg">Real results from real tasks.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6 flex flex-col gap-4">
                  <p className="text-zinc-300 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-auto">
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-zinc-500 text-xs">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">Questions</h2>
          <div className="space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-zinc-800 pb-8">
                <h3 className="text-white font-semibold text-lg mb-3">{faq.q}</h3>
                <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <p className="text-zinc-400 mb-6">Ready to get something done?</p>
            <Button asChild size="lg" className="bg-white text-zinc-950 hover:bg-zinc-100 text-base px-10 h-12">
              <Link href="/order">Start your task →</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
