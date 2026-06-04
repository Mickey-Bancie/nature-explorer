'use client'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import HomeScreen from '@/components/HomeScreen'
import ExploreScreen from '@/components/ExploreScreen'
import UploadScreen from '@/components/UploadScreen'
import VideosScreen from '@/components/VideosScreen'
import SavedScreen from '@/components/SavedScreen'
import ProfileScreen from '@/components/ProfileScreen'
import AuthModal from '@/components/AuthModal'

function AppContent() {
  const [activeTab, setActiveTab] = useState('home')
  const [showAuth, setShowAuth] = useState(false)
  const { user, loading } = useAuth()

  const requireAuth = (tab: string) => {
    if (!user && (tab === 'upload' || tab === 'saved' || tab === 'profile')) {
      setShowAuth(true)
      return
    }
    setActiveTab(tab)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nature">
        <div className="w-10 h-10 border-4 border-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nature flex flex-col max-w-2xl mx-auto relative">
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && <HomeScreen onRequireAuth={() => setShowAuth(true)} />}
        {activeTab === 'explore' && <ExploreScreen />}
        {activeTab === 'upload' && <UploadScreen />}
        {activeTab === 'videos' && <VideosScreen />}
        {activeTab === 'saved' && <SavedScreen />}
        {activeTab === 'profile' && <ProfileScreen onRequireAuth={() => setShowAuth(true)} />}
      </main>
      <Navbar activeTab={activeTab} onTabChange={requireAuth} />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
