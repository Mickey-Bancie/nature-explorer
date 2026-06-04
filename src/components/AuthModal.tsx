'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password)
    setLoading(false)
    if (error) { setError(error.message); return }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Mountain background using CSS gradient + overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.15)' }} />

      {/* Card */}
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: 20,
        padding: '32px',
        width: '100%',
        maxWidth: 380,
        margin: '0 16px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1F7A63', textAlign: 'center', marginBottom: 4 }}>
          {mode === 'signin' ? 'Welcome Back' : 'Join Nature Explorer'}
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
          {mode === 'signin' ? 'Continue your mountain adventure' : 'Start exploring nature spots'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email" placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
            <input
              type="password" placeholder="Enter your password" value={password}
              onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 12 }}>{error}</p>}
          <button
            type="submit" disabled={loading}
            style={{ width: '100%', background: '#1F7A63', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Return to Nature' : 'Start Exploring'}
          </button>
        </form>

        <button
          onClick={signInWithGoogle}
          style={{ width: '100%', marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px', fontSize: 14, color: '#374151', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 16 }}>
          {mode === 'signin' ? "New explorer? " : "Already have an account? "}
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            style={{ color: '#1F7A63', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
