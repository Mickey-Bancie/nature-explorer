'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { ArrowLeft, MapPin, Star, ThumbsUp, ThumbsDown, Bookmark, Send, Navigation } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { AuthProvider } from '@/lib/auth-context'

function PostDetail({ id }: { id: string }) {
  const { user } = useAuth()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchPost = useCallback(async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(username, profile_photo), likes(is_like, user_id), bookmarks(user_id)')
      .eq('id', id)
      .single()
    if (data) {
      setPost({
        ...data,
        username: data.profiles?.username || data.user_email,
        profile_photo: data.profiles?.profile_photo,
        user_liked: data.likes?.some((l: any) => l.user_id === user?.id && l.is_like),
        user_disliked: data.likes?.some((l: any) => l.user_id === user?.id && !l.is_like),
        user_bookmarked: data.bookmarks?.some((b: any) => b.user_id === user?.id),
        like_count: data.likes?.filter((l: any) => l.is_like).length || 0,
        dislike_count: data.likes?.filter((l: any) => !l.is_like).length || 0,
      })
    }
    const { data: cData } = await supabase
      .from('comments')
      .select('*, profiles(username, profile_photo)')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    if (cData) setComments(cData)
    setLoading(false)
  }, [id, user])

  useEffect(() => { fetchPost() }, [fetchPost])

  const handleLike = async (isLike: boolean) => {
    if (!user || !post) return
    const alreadyActive = isLike ? post.user_liked : post.user_disliked
    if (alreadyActive) {
      await supabase.from('likes').delete().match({ post_id: id, user_id: user.id })
    } else {
      await supabase.from('likes').upsert({ post_id: id, user_id: user.id, is_like: isLike }, { onConflict: 'post_id,user_id' })
    }
    fetchPost()
  }

  const handleBookmark = async () => {
    if (!user || !post) return
    if (post.user_bookmarked) {
      await supabase.from('bookmarks').delete().match({ post_id: id, user_id: user.id })
    } else {
      await supabase.from('bookmarks').insert({ post_id: id, user_id: user.id })
    }
    fetchPost()
  }

  const handleComment = async () => {
    if (!user || !commentText.trim()) return
    await supabase.from('comments').insert({ post_id: id, user_id: user.id, comment: commentText.trim() })
    setCommentText('')
    fetchPost()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-nature">
      <div className="w-8 h-8 border-4 border-[#1F7A63] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!post) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Post not found</p></div>

  const images = post.image_urls || [post.image_url]

  return (
    <div className="min-h-screen bg-nature max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <button onClick={() => window.history.back()}
            className="bg-black/50 text-white rounded-full p-2 backdrop-blur-sm">
            <ArrowLeft size={22} />
          </button>
        </div>
        {images[0] && (
          <div className="relative h-96 bg-gray-200">
            <Image src={images[0]} alt={post.title} fill className="object-cover" />
          </div>
        )}
      </div>

      <div className="bg-white p-4 mb-3">
        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-[#1F7A63] flex items-center justify-center text-white font-medium overflow-hidden flex-shrink-0">
            {post.profile_photo
              ? <Image src={post.profile_photo} alt="" width={40} height={40} className="object-cover" />
              : (post.username?.[0] || 'N').toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm text-[#1B2A2F]">{post.username}</p>
            <p className="text-xs text-gray-400">@{post.username?.split('@')[0] || 'explorer'}</p>
          </div>
        </div>

        <h1 className="font-serif text-2xl text-[#1B2A2F] mb-2">{post.title}</h1>
        {post.location && (
          <p className="text-sm text-[#2E86AB] flex items-center gap-1.5 mb-3">
            <MapPin size={14} />{post.location}
          </p>
        )}
        {post.rating && (
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={18} className={s <= post.rating ? 'text-[#F4A261] fill-[#F4A261]' : 'text-gray-200'} />
            ))}
          </div>
        )}
        {post.latitude && post.longitude && (
          <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`, '_blank')}
            className="flex items-center gap-2 bg-[#F0F9FF] text-[#2E86AB] text-xs px-3 py-2 rounded-lg mb-3 hover:bg-blue-100 transition-colors">
            <Navigation size={13} />
            {parseFloat(post.latitude).toFixed(4)}, {parseFloat(post.longitude).toFixed(4)}
            <span className="text-gray-400 ml-1">· Tap to open in Maps</span>
          </button>
        )}

        <div className="flex items-center justify-between py-3 border-y border-gray-100">
          <div className="flex items-center gap-5">
            <button onClick={() => handleLike(true)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${post.user_liked ? 'text-[#1F7A63]' : 'text-gray-400'}`}>
              <ThumbsUp size={20} className={post.user_liked ? 'fill-[#1F7A63]' : ''} />{post.like_count}
            </button>
            <button onClick={() => handleLike(false)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${post.user_disliked ? 'text-[#F4A261]' : 'text-gray-400'}`}>
              <ThumbsDown size={20} className={post.user_disliked ? 'fill-[#F4A261]' : ''} />{post.dislike_count}
            </button>
          </div>
          <button onClick={handleBookmark}
            className={`transition-colors ${post.user_bookmarked ? 'text-[#1F7A63]' : 'text-gray-400'}`}>
            <Bookmark size={22} className={post.user_bookmarked ? 'fill-[#1F7A63]' : ''} />
          </button>
        </div>
      </div>

      {[
        { label: 'Description', value: post.description },
        { label: 'Review', value: post.review },
        { label: "Do's and Don'ts", value: post.dos_and_donts },
        { label: 'Pros & Cons', value: post.pros_and_cons },
        { label: 'Recommendations', value: post.recommendations },
      ].filter(s => s.value).map(section => (
        <div key={section.label} className="bg-white p-4 mb-3">
          <h3 className="font-serif text-base text-[#1B2A2F] mb-2">{section.label}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{section.value}</p>
        </div>
      ))}

      <div className="bg-white p-4 mb-24">
        <h3 className="font-serif text-lg text-[#1B2A2F] mb-4">Comments ({comments.length})</h3>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No comments yet. Be the first!</p>
        ) : comments.map(c => (
          <div key={c.id} className="py-3 border-b border-gray-50">
            <p className="text-sm font-medium text-[#1B2A2F]">{c.profiles?.username || c.user_id?.slice(0,8)}</p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{c.comment}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-gray-200 p-3 flex gap-2">
        <input
          value={commentText} onChange={e => setCommentText(e.target.value)}
          placeholder={user ? 'Add a comment...' : 'Sign in to comment'}
          disabled={!user}
          onKeyDown={e => e.key === 'Enter' && handleComment()}
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-[#1F7A63] disabled:opacity-50"
        />
        <button onClick={handleComment} disabled={!commentText.trim() || !user}
          className="bg-[#1F7A63] text-white rounded-full p-2.5 disabled:opacity-40 hover:bg-[#0F5040] transition-colors">
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

export default function PostPage({ params }: { params: { id: string } }) {
  return <AuthProvider><PostDetail id={params.id} /></AuthProvider>
}
