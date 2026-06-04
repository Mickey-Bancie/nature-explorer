'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { MapPin, Bookmark } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function SavedScreen() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('bookmarks').select('post_id, posts(*, profiles(username, profile_photo))')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setPosts(data.map((b: any) => b.posts).filter(Boolean))
        setLoading(false)
      })
  }, [user])

  return (
    <div>
      <div className="bg-white border-b border-[#1F7A63] px-4 py-4 sticky top-0 z-10">
        <h1 className="font-serif text-2xl text-[#1B2A2F]">Saved</h1>
        <p className="text-sm text-[#2E86AB] mt-0.5">Your bookmarked nature spots</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#1F7A63] border-t-transparent rounded-full animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Bookmark size={48} strokeWidth={1} />
          <p className="text-base">No saved posts yet</p>
          <p className="text-sm">Bookmark posts to save them for later</p>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-52 bg-gray-100">
                {(post.image_urls?.[0] || post.image_url) && (
                  <Image src={post.image_urls?.[0] || post.image_url} alt={post.title} fill className="object-cover" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg text-[#1B2A2F]">{post.title}</h3>
                {post.location && (
                  <p className="text-sm text-[#2E86AB] flex items-center gap-1 mt-1">
                    <MapPin size={13} />{post.location}
                  </p>
                )}
                {post.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
