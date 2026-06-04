'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MapPin, Compass, Star, X, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ExploreScreen() {
  const [posts, setPosts] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('posts').select('*, profiles(username, profile_photo)')
      .not('latitude', 'is', null).not('longitude', 'is', null)
      .then(({ data }) => { if (data) setPosts(data); setLoading(false) })
  }, [])

  const openMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="font-serif text-2xl text-[#1B2A2F]">Explore</h1>
        <p className="text-sm text-[#2E86AB] mt-0.5 flex items-center gap-1"><Compass size={12} />Discover nature spots near you</p>
      </div>

      <div className="p-4">
        <div className="bg-[#E8F5F0] rounded-2xl overflow-hidden mb-4">
          <div className="p-4 flex items-center justify-between">
            <p className="text-sm font-medium text-[#1F7A63]">
              {posts.length} nature spots mapped
            </p>
            <button
              onClick={() => posts[0] && openMap(posts[0].latitude, posts[0].longitude)}
              className="text-xs bg-[#1F7A63] text-white px-3 py-1.5 rounded-full hover:bg-[#0F5040] transition-colors"
            >
              Open in Maps
            </button>
          </div>

          <div className="relative bg-gradient-to-br from-[#1F7A63] via-[#2E86AB] to-[#1B2A2F] h-64 overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{backgroundImage:'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',backgroundSize:'32px 32px'}} />
            {posts.map((post, i) => {
              const lat = parseFloat(post.latitude)
              const lng = parseFloat(post.longitude)
              const x = ((lng + 180) / 360) * 100
              const y = ((90 - lat) / 180) * 100
              const cx = Math.max(5, Math.min(95, x))
              const cy = Math.max(5, Math.min(95, y))
              return (
                <button
                  key={post.id}
                  onClick={() => setSelected(selected?.id === post.id ? null : post)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-[#1F7A63] rounded-full p-2 border-2 border-white shadow-lg hover:scale-110 transition-transform z-10"
                  style={{ left: `${cx}%`, top: `${cy}%` }}
                  title={post.title}
                >
                  <MapPin size={14} className="text-white" />
                </button>
              )
            })}
            <div className="absolute bottom-2 right-2 text-white/40 text-xs">Nature Explorer Map</div>
          </div>
        </div>

        {selected && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-md mb-4">
            <div className="flex">
              <div className="relative w-28 h-28 flex-shrink-0 bg-gray-100">
                {(selected.image_urls?.[0] || selected.image_url) && (
                  <Image src={selected.image_urls?.[0] || selected.image_url} alt={selected.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 p-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-serif text-base text-[#1B2A2F]">{selected.title}</h3>
                  <button onClick={() => setSelected(null)} className="text-gray-400 ml-2"><X size={16} /></button>
                </div>
                {selected.location && (
                  <p className="text-xs text-[#2E86AB] flex items-center gap-1 mt-1">
                    <MapPin size={10} />{selected.location}
                  </p>
                )}
                {selected.rating && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} className={s <= selected.rating ? 'text-[#F4A261] fill-[#F4A261]' : 'text-gray-200'} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => openMap(selected.latitude, selected.longitude)}
              className="w-full bg-[#1F7A63] text-white py-3 text-sm font-medium flex items-center justify-center gap-1 hover:bg-[#0F5040] transition-colors"
            >
              View on Google Maps <ChevronRight size={16} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-serif text-lg text-[#1B2A2F] mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-[#1F7A63]" />All Nature Spots
          </h3>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-[#1F7A63] border-t-transparent rounded-full animate-spin" /></div>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No spots with locations yet</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {posts.map(post => (
                <button key={post.id} onClick={() => setSelected(selected?.id === post.id ? null : post)}
                  className="min-w-44 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 text-left hover:-translate-y-1 transition-transform">
                  <div className="relative h-24 bg-gray-100">
                    {(post.image_urls?.[0] || post.image_url) && (
                      <Image src={post.image_urls?.[0] || post.image_url} alt={post.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-medium text-[#1B2A2F] truncate">{post.title}</p>
                    {post.rating && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= post.rating ? 'text-[#F4A261] fill-[#F4A261]' : 'text-gray-200'} />)}
                      </div>
                    )}
                    <p className="text-xs text-[#1F7A63] font-medium mt-1">
                      {parseFloat(post.latitude).toFixed(2)}, {parseFloat(post.longitude).toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
