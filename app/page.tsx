'use client'

import { useState } from 'react'
import { profiles, Profile } from '@/lib/profiles'
import { EvaluationResult, Tone } from '@/lib/types'
import confetti from 'canvas-confetti'

// Profile avatar config — gradient banner + initials circle
const avatarConfig: Record<number, { from: string; to: string; ring: string }> = {
  1: { from: 'from-amber-300',  to: 'to-yellow-200',  ring: 'ring-amber-200'  },
  2: { from: 'from-blue-300',   to: 'to-cyan-200',    ring: 'ring-blue-200'   },
  3: { from: 'from-purple-300', to: 'to-pink-200',    ring: 'ring-purple-200' },
}

// Profile-specific high-score example messages for the hint box
const hintExamples: Record<number, { unsafe: string; highScore: string }> = {
  1: {
    unsafe:    '"you\'re hot, send pics"',
    highScore: '"Max looks adorable! Where do you take him hiking?"',
  },
  2: {
    unsafe:    '"nice body, you must be a runner 👀"',
    highScore: '"Which coffee shops do you recommend for exploring the city?"',
  },
  3: {
    unsafe:    '"forget wine, let\'s just go back to mine"',
    highScore: '"Any natural wine bar recs? I\'ve been wanting to try some weird ones!"',
  },
}

export default function Home() {
  const [selectedProfile, setSelectedProfile] = useState<Profile>(profiles[0])
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [devMode, setDevMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [switchedTo, setSwitchedTo] = useState<string | null>(null)

  const handleCheckPulse = async () => {
    if (!message.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    setSent(false)
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, profileId: selectedProfile.id })
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Evaluation failed. Please try again.')
        return
      }
      const typed = data as EvaluationResult
      setResult(typed)
      if (typed.is_safe && typed.pulse_score >= 76) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFC629', '#FFD700', '#ffffff']
        })
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSwitch = (p: Profile) => {
    if (p.id === selectedProfile.id) return
    setSelectedProfile(p)
    setResult(null)
    setSent(false)
    setError(null)
    setSwitchedTo(p.name)
    setTimeout(() => setSwitchedTo(null), 2000)
  }

  const handleSend = () => {
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  // Returns border color + background + text + dot classes for each tone
  const getToneStyle = (tone: Tone) => {
    switch (tone) {
      case 'Respectful':    return { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800',  dot: 'bg-green-500'  }
      case 'Forward':       return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', dot: 'bg-yellow-500' }
      case 'Objectifying':  return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', dot: 'bg-orange-500' }
      case 'Inappropriate': return { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    dot: 'bg-red-400'    }
      case 'Aggressive':    return { bg: 'bg-red-100',   border: 'border-red-300',    text: 'text-red-900',    dot: 'bg-red-600'    }
      default:              return { bg: 'bg-gray-50',   border: 'border-gray-200',   text: 'text-gray-800',   dot: 'bg-gray-400'   }
    }
  }

  const getToneLabel = (tone: Tone) =>
    tone === 'Respectful' ? 'Great' : tone === 'Forward' ? 'Caution' : 'Flagged'

  const getPulseBandLabel = (r: EvaluationResult) => {
    if (!r.is_safe) {
      if (r.tone === 'Objectifying') return '🚫 Objectifying — focuses on appearance, not the person'
      if (r.tone === 'Aggressive')   return '🚫 Aggressive — threatening or hostile tone'
      return '🚫 Inappropriate — violates community guidelines'
    }
    if (r.pulse_score >= 76) return '🌟 Highly personalized — great opener!'
    if (r.pulse_score >= 41) return '👍 Decent — a little more context would help'
    return '⚠️ Too generic — try referencing something specific'
  }

  const getPulseColor = (score: number, isSafe: boolean) => {
    if (!isSafe) return 'text-red-600'
    if (score >= 76) return 'text-green-700'
    if (score >= 41) return 'text-green-500'
    return 'text-orange-500'
  }

  const getPulseBarColor = (score: number, isSafe: boolean) => {
    if (!isSafe) return 'bg-red-400'
    if (score >= 76) return 'bg-green-600'
    if (score >= 41) return 'bg-green-400'
    return 'bg-orange-400'
  }

  const sendEnabled = result?.is_safe === true
  const av = avatarConfig[selectedProfile.id] ?? avatarConfig[1]

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFC629' }}>
            <span className="text-sm font-bold" style={{ color: '#222222' }}>B</span>
          </div>
          <div>
            <h1 className="font-bold text-xl" style={{ color: '#222222' }}>Bumble Pulse</h1>
            <p className="text-xs text-gray-500">Pre-Send Vibe Check</p>
          </div>
        </div>
        <button
          onClick={() => setDevMode(!devMode)}
          aria-pressed={devMode}
          aria-label="Toggle developer logs"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            devMode
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }`}
        >
          <span className="font-mono">{'{}'}</span>
          Dev Logs
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Left Panel — Profile */}
          <div className="md:w-2/5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Select Match</h2>
              <div className="flex gap-2 flex-wrap">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProfileSwitch(p)}
                    aria-pressed={selectedProfile.id === p.id}
                    className={`px-4 py-2 rounded-full text-sm transition-all border ${
                      selectedProfile.id === p.id
                        ? 'border-transparent font-semibold text-gray-900'
                        : 'bg-white border-gray-200 font-medium text-gray-600 hover:border-gray-400'
                    }`}
                    style={selectedProfile.id === p.id ? { backgroundColor: '#FFC629' } : {}}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Card */}
            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Gradient banner + floating avatar */}
              <div className={`h-28 bg-gradient-to-br ${av.from} ${av.to} relative`}>
                <div className={`absolute -bottom-8 left-5 w-16 h-16 rounded-full bg-white ring-4 ${av.ring} shadow-sm flex items-center justify-center text-2xl font-bold`}
                  style={{ color: '#222222' }}>
                  {selectedProfile.name[0]}
                </div>
                <div className="absolute bottom-2 right-3 text-3xl">{selectedProfile.avatar}</div>
              </div>
              <div className="pt-11 px-5 pb-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-xl font-bold" style={{ color: '#222222' }}>{selectedProfile.name}</h3>
                  <span className="text-gray-500 font-medium">{selectedProfile.age}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{selectedProfile.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hint box — profile-specific examples */}
            {(() => {
              const hint = hintExamples[selectedProfile.id] ?? hintExamples[1]
              return (
                <div className="rounded-2xl p-4 text-xs text-gray-600 leading-relaxed" style={{ backgroundColor: '#FFF8E1' }}>
                  <p className="font-semibold mb-2" style={{ color: '#222222' }}>Try these test cases:</p>
                  <ul className="space-y-1.5">
                    <li className="flex gap-1.5 items-start">💬 <span><span className="italic">&quot;hey&quot;</span> — generic, low score</span></li>
                    <li className="flex gap-1.5 items-start">🚨 <span><span className="italic">{hint.unsafe}</span> — unsafe, Send blocked</span></li>
                    <li className="flex gap-1.5 items-start">✨ <span><span className="italic">{hint.highScore}</span> — high score + confetti</span></li>
                  </ul>
                </div>
              )
            })()}
          </div>

          {/* Right Panel — Input & Results */}
          <div className="md:w-3/5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Your Opening Message</h2>
              <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-100 transition-all">
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Draft your message to ${selectedProfile.name}...`}
                  rows={4}
                  maxLength={500}
                  aria-label={`Draft your opening message to ${selectedProfile.name}`}
                  className="w-full p-4 text-sm resize-none outline-none text-gray-800 placeholder-gray-400"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCheckPulse()
                  }}
                />
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-400 shrink-0">{message.length}/500 · ⌘/Ctrl+Enter</span>
                  <div className="flex items-center gap-2">
                    {/* Send Button */}
                    <button
                      onClick={handleSend}
                      disabled={!sendEnabled || sent}
                      aria-label={!result ? 'Check Pulse first' : !result.is_safe ? 'Blocked — message flagged as unsafe' : 'Send message'}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                      style={
                        sent
                          ? { backgroundColor: '#FFC629', color: '#222222', borderColor: '#FFC629' }
                          : { backgroundColor: 'white', color: '#222222', borderColor: '#d1d5db' }
                      }
                    >
                      {sent ? '✓ Sent!' : 'Send'}
                    </button>

                    {/* Check Pulse Button */}
                    <button
                      onClick={handleCheckPulse}
                      disabled={!message.trim() || loading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#FFC629', color: '#222222' }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        <>✨ Check Pulse</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error state — with icon + retry */}
            {error && (
              <div className="rounded-2xl p-5 bg-red-50 border border-red-200 flex items-start gap-3">
                <span className="text-red-400 text-xl shrink-0" aria-hidden="true">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                  <button
                    onClick={handleCheckPulse}
                    disabled={!message.trim()}
                    className="mt-1.5 text-xs font-semibold text-red-600 underline underline-offset-2 disabled:opacity-50"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-3 animate-pulse" aria-label="Analyzing your message…">
                {[80, 60, 90].map((w, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 p-5 bg-white">
                    <div className="h-3 bg-gray-200 rounded w-24 mb-3"/>
                    <div className={`h-5 bg-gray-200 rounded`} style={{ width: `${w}%` }}/>
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-3 animate-fadeIn">

                {/* Safety Status — status card */}
                <div className={`flex items-center justify-between rounded-2xl p-5 border ${
                  result.is_safe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Safety Status</p>
                    <p className={`text-lg font-bold ${result.is_safe ? 'text-green-700' : 'text-red-700'}`}>
                      {result.is_safe ? '✅ Safe to Send' : '🚨 Flagged — Not Safe'}
                    </p>
                    {!result.is_safe && (
                      <p className="text-xs text-red-500 mt-1">Send disabled until message is revised.</p>
                    )}
                  </div>
                  {/* Standardized badge: px-3 py-1.5 text-xs font-bold */}
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    result.is_safe ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {result.is_safe ? 'PASS' : 'FAIL'}
                  </div>
                </div>

                {/* Tone Analysis — status card */}
                {result.tone && (() => {
                  const s = getToneStyle(result.tone)
                  return (
                    <div className={`flex items-center justify-between rounded-2xl p-5 border ${s.bg} ${s.border}`}>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Tone Analysis</p>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} aria-hidden="true"/>
                          <p className={`text-lg font-bold ${s.text}`}>{result.tone}</p>
                        </div>
                      </div>
                      {/* Pill: white bg so it's visible against any card background */}
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold bg-white border ${s.border} ${s.text}`}>
                        {getToneLabel(result.tone)}
                      </div>
                    </div>
                  )
                })()}

                {/* Pulse Score — data card */}
                <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pulse Score</p>
                    <span className={`text-2xl font-bold ${getPulseColor(result.pulse_score, result.is_safe)}`}>
                      {result.pulse_score}<span className="text-sm text-gray-400 font-normal">/100</span>
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getPulseBarColor(result.pulse_score, result.is_safe)}`}
                      style={{ width: `${Math.min(100, Math.max(0, result.pulse_score))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                    <span>Generic</span>
                    <span>Good</span>
                    <span>Personalized</span>
                  </div>
                  <p className={`text-xs font-medium mt-2 ${getPulseColor(result.pulse_score, result.is_safe)}`}>
                    {getPulseBandLabel(result)}
                  </p>
                </div>

                {/* Coach's Note — data card (white, consistent with Pulse card) */}
                <div className="rounded-2xl p-5 border border-yellow-200 bg-white shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-gray-500">
                    Coach&apos;s Note
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: '#222222' }}>{result.coach_note}</p>
                </div>
              </div>
            )}

            {/* Empty / switched state */}
            {!result && !loading && !error && (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                <div className="text-4xl mb-3">💬</div>
                {switchedTo ? (
                  <>
                    <p className="text-sm font-medium text-gray-500 animate-fadeIn">Switched to {switchedTo}</p>
                    <p className="text-xs text-gray-400 mt-1">Draft a new message and hit Check Pulse</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-500">Your pulse reading will appear here</p>
                    <p className="text-xs text-gray-400 mt-1">Type a message and hit Check Pulse to begin</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dev Logs — slide-up drawer */}
      <div
        role="dialog"
        aria-label="Developer logs"
        aria-modal="true"
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-in-out ${
          devMode ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '40vh' }}
      >
        <div className="rounded-t-2xl border-t border-gray-800 overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '40vh' }}>
          <div className="px-4 py-2.5 bg-gray-900 flex items-center gap-2 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" aria-hidden="true"/>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" aria-hidden="true"/>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" aria-hidden="true"/>
            <span className="ml-2 text-xs text-gray-400 font-mono flex-1">Developer Logs — Raw LLM Response</span>
            <button
              onClick={() => setDevMode(false)}
              aria-label="Close developer logs"
              className="text-gray-500 hover:text-gray-300 text-xs font-mono transition-colors"
            >
              ✕ close
            </button>
          </div>
          <pre className="p-4 bg-gray-950 text-green-400 text-xs overflow-auto font-mono leading-relaxed flex-1">
            {result
              ? JSON.stringify(result, null, 2)
              : '// Run a Check Pulse evaluation to see raw LLM output here.'}
          </pre>
        </div>
      </div>

      {/* Drawer backdrop */}
      {devMode && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setDevMode(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
