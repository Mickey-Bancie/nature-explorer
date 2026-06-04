'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function VideosScreen() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('videos').select('*, profiles(username)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setVideos(data); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#1F7A63] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (videos.length === 0) return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center gap-3">
      <p className="text-white text-lg font-serif">No videos yet</p>
      <p className="text-gray-500 text-sm">Be the first to share a nature video!</p>
    </div>
  )

  return (
    <div className="bg-black">
      {videos.map(video => (
        <div key={video.id} className="relative h-screen flex items-center justify-center">
          <video
            src={video.video_url}
            className="w-full h-full object-cover"
            autoPlay loop muted playsInline
          />
          <div className="absolute bottom-24 left-4 right-4">
            <p className="text-white font-serif text-xl font-medium drop-shadow-lg">{video.title}</p>
            {video.description && <p className="text-white/80 text-sm mt-1 drop-shadow">{video.description}</p>}
            {video.profiles?.username && <p className="text-gray-300 text-sm mt-2">@{video.profiles.username}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
