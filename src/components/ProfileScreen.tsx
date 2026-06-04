'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { MapPin, LogOut, Edit, Camera, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function ProfileScreen({ onRequireAuth }: { onRequireAuth: () => void }) {
  const { user, signOut } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => { if (data) { setProfile(data); setUsername(data.username || ''); setBio(data.bio || '') } })
    supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setPosts(data) })
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    let photoUrl = profile?.profile_photo
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      await supabase.storage.from('nature-images').upload(path, photoFile, { upsert: true })
      const { data } = supabase.storage.from('nature-images').getPublicUrl(path)
      photoUrl = data.publicUrl
    }
    await supabase.from('profiles').upsert({ id: user.id, username, bio, profile_photo: photoUrl, updated_at: new Date().toISOString() })
    setProfile((p: any) => ({ ...p, username, bio, profile_photo: photoUrl }))
    setSaving(false)
    setEditing(false)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
      <p className="text-base">Sign in to view your profile</p>
      <button onClick={onRequireAuth} className="bg-[#1F7A63] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0F5040] transition-colors">
        Sign In
      </button>
    </div>
  )

  const avatarSrc = photoPreview || profile?.profile_photo
  const displayName = profile?.username || user.email?.split('@')[0] || 'Explorer'

  return (
    <div>
      <div className="bg-white border-b border-[#1F7A63] px-4 py-4 sticky top-0 z-10">
        <h1 className="font-serif text-2xl text-[#1B2A2F]">Profile</h1>
      </div>

      <div className="bg-white px-4 py-6 flex flex-col items-center gap-3 border-b border-gray-100">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[#1F7A63] flex items-center justify-center text-white text-3xl font-medium overflow-hidden border-2 border-[#1F7A63]">
            {avatarSrc
              ? <Image src={avatarSrc} alt="" width={96} height={96} className="object-cover w-full h-full" />
              : displayName[0].toUpperCase()}
          </div>
          {editing && (
            <>
              <input type="file" accept="image/*" ref={fileRef} className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)) } }} />
              <button onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#1F7A63] rounded-full p-2 border-2 border-white">
                <Camera size={16} className="text-white" />
              </button>
            </>
          )}
        </div>

        {editing ? (
          <div className="w-full flex flex-col gap-3 mt-2">
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1F7A63] bg-gray-50" />
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio (20-150 characters)" rows={3} maxLength={150}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1F7A63] bg-gray-50 resize-none" />
            <p className="text-xs text-gray-400 text-right">{bio.length}/150</p>
            <div className="flex gap-3">
              <button onClick={() => { setEditing(false); setPhotoPreview(null) }}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-[#1F7A63] text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? 'Saving...' : <><Check size={16} />Save</>}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-xl text-[#1B2A2F]">{displayName}</h2>
            <p className="text-sm text-[#2E86AB]">{user.email}</p>
            {profile?.bio && <p className="text-sm text-gray-500 text-center px-6">{profile.bio}</p>}
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 bg-[#1F7A63] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0F5040] transition-colors">
              <Edit size={16} />Edit Profile
            </button>
            <button onClick={signOut}
              className="flex items-center gap-2 bg-red-50 text-red-500 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
              <LogOut size={16} />Sign Out
            </button>
          </>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-serif text-lg text-[#1B2A2F] mb-3">My Posts ({posts.length})</h3>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No posts yet</p>
            <p className="text-sm mt-1">Share your first nature discovery!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl overflow-hidden flex gap-3 p-3 shadow-sm">
                <div className="relative w-20 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {(post.image_urls?.[0] || post.image_url) && (
                    <Image src={post.image_urls?.[0] || post.image_url} alt={post.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#1B2A2F] truncate">{post.title}</p>
                  {post.location && (
                    <p className="text-xs text-[#2E86AB] flex items-center gap-1 mt-1">
                      <MapPin size={10} />{post.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
