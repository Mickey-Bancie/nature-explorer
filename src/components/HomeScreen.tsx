'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ThumbsUp, ThumbsDown, MessageCircle, Bookmark, MapPin, Star, Navigation, MoreVertical, Trash2, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

const CATEGORY_LABELS: Record<string, string> = {
  mountains: 'Mountains ⛰️', lakes: 'Lakes 💧', waterfalls: 'Waterfalls 🌊',
  national_parks: 'National Parks 🌲', hiking_trails: 'Hiking Trails 🥾',
  beaches: 'Beaches 🏖️', scenic_views: 'Scenic Views 📸',
  hidden_gems: 'Hidden Gems 🗺️', animals: 'Animals 🐸', other: 'Other 🖼️',
}

export default function HomeScreen({ onRequireAuth }: { onRequireAuth: () => void }) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`*, profiles(username, profile_photo), likes(is_like, user_id), bookmarks(user_id), comments(count)`)
      .order('created_at', { ascending: false })
    if (!error && data) {
      const enriched = data.map(p => ({
        ...p,
        username: p.profiles?.username || p.user_email,
        profile_photo: p.profiles?.profile_photo,
        user_liked: p.likes?.some((l: any) => l.user_id === user?.id && l.is_like),
        user_disliked: p.likes?.some((l: any) => l.user_id === user?.id && !l.is_like),
        user_bookmarked: p.bookmarks?.some((b: any) => b.user_id === user?.id),
        like_count: p.likes?.filter((l: any) => l.is_like).length || 0,
        dislike_count: p.likes?.filter((l: any) => !l.is_like).length || 0,
        comment_count: p.comments?.[0]?.count || 0,
      }))
      setPosts(enriched)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleLike = async (postId: string, isLike: boolean) => {
    if (!user) { onRequireAuth(); return }
    const existing = posts.find(p => p.id === postId)
    const alreadyActive = isLike ? existing?.user_liked : existing?.user_disliked
    if (alreadyActive) {
      await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id })
    } else {
      await supabase.from('likes').upsert({ post_id: postId, user_id: user.id, is_like: isLike }, { onConflict: 'post_id,user_id' })
    }
    fetchPosts()
  }

  const handleBookmark = async (postId: string) => {
    if (!user) { onRequireAuth(); return }
    const post = posts.find(p => p.id === postId)
    if (post?.user_bookmarked) {
      await supabase.from('bookmarks').delete().match({ post_id: postId, user_id: user.id })
    } else {
      await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id })
    }
    fetchPosts()
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id', postId)
    fetchPosts()
    setMenuOpen(null)
  }

  const openMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#1F7A63] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="font-serif text-2xl text-[#1B2A2F]">Nature Explorer</h1>
        <p className="text-sm text-[#2E86AB] mt-0.5">Discover amazing nature spots</p>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No posts yet</p>
            <p className="text-sm mt-1">Be the first to share a nature spot!</p>
          </div>
        ) : posts.map(post => {
          const images = post.image_urls || [post.image_url]
          const isOwner = user?.id === post.user_id
          return (
            <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center p-3 gap-3 border-b border-gray-50">
                <div className="w-9 h-9 rounded-full bg-[#1F7A63] flex items-center justify-center text-white font-medium text-sm flex-shrink-0 overflow-hidden">
                  {post.profile_photo
                    ? <Image src={post.profile_photo} alt="" width={36} height={36} className="object-cover" />
                    : (post.username?.[0] || 'N').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B2A2F] truncate">{post.username}</p>
                  {post.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />{post.location}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {post.category && (
                    <span className="text-xs bg-[#E8F5F0] text-[#1F7A63] px-2.5 py-1 rounded-full font-medium">
                      {CATEGORY_LABELS[post.category] || post.category}
                    </span>
                  )}
                  {isOwner && (
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)} className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreVertical size={18} />
                      </button>
                      {menuOpen === post.id && (
                        <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 z-20 min-w-36 overflow-hidden">
                          <button onClick={() => { setMenuOpen(null) }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#2E86AB] hover:bg-gray-50 border-b border-gray-50">
                            <Edit size={16} />Edit Post
                          </button>
                          <button onClick={() => handleDelete(post.id)} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50">
                            <Trash2 size={16} />Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {images[0] && (
                <div className="relative h-72 bg-gray-100">
                  <Image src={images[0]} alt={post.title} fill className="object-cover" />
                  {images.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {images.length} photos
                    </span>
                  )}
                </div>
              )}

              {post.rating && (
                <div className="flex items-center gap-1 px-4 pt-3">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} className={s <= post.rating ? 'text-[#F4A261] fill-[#F4A261]' : 'text-gray-200'} />
                  ))}
                  <span className="text-sm text-[#F4A261] font-medium ml-1">{post.rating}.0</span>
                </div>
              )}

              <div className="px-4 pt-2 pb-3">
                <h3 className="font-serif text-lg text-[#1B2A2F] mb-1">{post.title}</h3>
                {post.latitude && post.longitude && (
                  <button onClick={() => openMap(post.latitude, post.longitude)}
                    className="flex items-center gap-1.5 bg-[#F0F9FF] text-[#2E86AB] text-xs px-3 py-1.5 rounded-lg mb-2 hover:bg-blue-100 transition-colors">
                    <Navigation size={12} />{parseFloat(post.latitude).toFixed(4)}, {parseFloat(post.longitude).toFixed(4)}
                  </button>
                )}
                {post.description && (
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{post.description}</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleLike(post.id, true)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${post.user_liked ? 'text-[#1F7A63]' : 'text-gray-400 hover:text-[#1F7A63]'}`}>
                      <ThumbsUp size={18} className={post.user_liked ? 'fill-[#1F7A63]' : ''} />
                      {post.like_count}
                    </button>
                    <button onClick={() => handleLike(post.id, false)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${post.user_disliked ? 'text-[#F4A261]' : 'text-gray-400 hover:text-[#F4A261]'}`}>
                      <ThumbsDown size={18} className={post.user_disliked ? 'fill-[#F4A261]' : ''} />
                      {post.dislike_count}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#2E86AB] transition-colors">
                      <MessageCircle size={18} />{post.comment_count}
                    </button>
                  </div>
                  <button onClick={() => handleBookmark(post.id)}
                    className={`transition-colors ${post.user_bookmarked ? 'text-[#1F7A63]' : 'text-gray-400 hover:text-[#1F7A63]'}`}>
                    <Bookmark size={20} className={post.user_bookmarked ? 'fill-[#1F7A63]' : ''} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
