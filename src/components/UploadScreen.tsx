'use client'
import { useState, useCallback } from 'react'
import { Camera, X, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

const CATEGORIES = [
  { label: 'Mountains ⛰️', value: 'mountains' }, { label: 'Lakes 💧', value: 'lakes' },
  { label: 'Waterfalls 🌊', value: 'waterfalls' }, { label: 'National Parks 🌲', value: 'national_parks' },
  { label: 'Hiking Trails 🥾', value: 'hiking_trails' }, { label: 'Beaches 🏖️', value: 'beaches' },
  { label: 'Scenic Views 📸', value: 'scenic_views' }, { label: 'Hidden Gems 🗺️', value: 'hidden_gems' },
  { label: 'Animals 🐸', value: 'animals' }, { label: 'Other 🖼️', value: 'other' },
]

export default function UploadScreen() {
  const { user } = useAuth()
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [review, setReview] = useState('')
  const [dosAndDonts, setDosAndDonts] = useState('')
  const [prosAndCons, setProsAndCons] = useState('')
  const [rating, setRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 10)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop()
    const path = `posts/${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('nature-images').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('nature-images').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (images.length === 0 || !title.trim() || !category) {
      alert('Please add at least one image, a title, and a category.')
      return
    }
    setSubmitting(true)
    try {
      const imageUrls = await Promise.all(images.map(uploadImage))
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        user_email: user.email,
        image_urls: imageUrls,
        image_url: imageUrls[0],
        title: title.trim(),
        location: location.trim() || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        category,
        description: description.trim() || null,
        review: review.trim() || null,
        dos_and_donts: dosAndDonts.trim() || null,
        pros_and_cons: prosAndCons.trim() || null,
        rating: rating || null,
      })
      if (error) throw error
      setSuccess(true)
      setImages([]); setPreviews([]); setTitle(''); setLocation(''); setLatitude(''); setLongitude('')
      setCategory(''); setDescription(''); setReview(''); setDosAndDonts(''); setProsAndCons(''); setRating(0)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      alert('Failed to share post: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1F7A63] bg-gray-50 placeholder-gray-400"

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="font-serif text-2xl text-[#1B2A2F]">Share Nature</h1>
        <p className="text-sm text-[#2E86AB] mt-0.5">Upload your nature discoveries</p>
      </div>

      {success && (
        <div className="mx-4 mt-4 bg-[#E8F5F0] text-[#1F7A63] px-4 py-3 rounded-xl text-sm font-medium">
          Post shared successfully! 🌿
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
        <label className={`border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-colors ${previews.length ? 'border-[#1F7A63]' : 'border-gray-200 hover:border-[#1F7A63]'}`}>
          <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
          {previews.length > 0 ? (
            <div>
              <div className="flex overflow-x-auto">
                {previews.map((src, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={src} alt="" className="w-48 h-56 object-cover" />
                    <button type="button" onClick={e => { e.preventDefault(); removeImage(i) }}
                      className="absolute top-2 right-2 bg-black/70 rounded-full p-1.5 text-white">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 py-2">{previews.length}/10 photos</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12">
              <Camera size={40} className="text-gray-300" />
              <p className="text-sm text-gray-500">Tap to select photos</p>
              <p className="text-xs text-gray-400">Up to 10 photos</p>
            </div>
          )}
        </label>

        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your spot a name" className={inputCls} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Category *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button type="button" key={cat.value} onClick={() => setCategory(cat.value)}
                  className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${category === cat.value ? 'bg-[#1F7A63] text-white border-[#1F7A63]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1F7A63]'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Where is this place?" className={inputCls} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
              <input value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="37.7749" type="number" step="any" className={inputCls} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
              <input value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="-122.4194" type="number" step="any" className={inputCls} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what makes this place special" rows={3} className={inputCls + ' resize-none'} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Your Review</label>
            <textarea value={review} onChange={e => setReview(e.target.value)} placeholder="Share your experience" rows={3} className={inputCls + ' resize-none'} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Do's and Don'ts</label>
            <textarea value={dosAndDonts} onChange={e => setDosAndDonts(e.target.value)} placeholder="Important tips for visitors" rows={2} className={inputCls + ' resize-none'} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Pros and Cons</label>
            <textarea value={prosAndCons} onChange={e => setProsAndCons(e.target.value)} placeholder="What are the pros and cons?" rows={2} className={inputCls + ' resize-none'} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Your Rating</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(s => (
                <button type="button" key={s} onClick={() => setRating(s)}>
                  <Star size={32} className={s <= rating ? 'text-[#F4A261] fill-[#F4A261]' : 'text-gray-200'} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting || !title || !category || images.length === 0}
          className="bg-[#1F7A63] text-white rounded-2xl py-4 text-sm font-medium disabled:opacity-50 hover:bg-[#0F5040] transition-colors shadow-lg shadow-[#1F7A63]/20">
          {submitting ? 'Sharing...' : 'Share Post'}
        </button>
      </form>
    </div>
  )
}
