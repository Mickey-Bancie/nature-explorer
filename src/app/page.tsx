'use client'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth-context'
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F9F7' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #1F7A63', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F9F7', display: 'flex', flexDirection: 'column', maxWidth: 672, margin: '0 auto', position: 'relative' }}>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
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
