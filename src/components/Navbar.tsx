'use client'
import { Home, Map, Plus, Video, Bookmark, User } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'explore', label: 'Explore', Icon: Map },
  { id: 'upload', label: 'Upload', Icon: Plus },
  { id: 'videos', label: 'Videos', Icon: Video },
  { id: 'saved', label: 'Saved', Icon: Bookmark },
  { id: 'profile', label: 'Profile', Icon: User },
]

export default function Navbar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-gray-200 flex z-40">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 text-[11px] transition-colors ${
            activeTab === id ? 'text-[#1F7A63]' : 'text-gray-500 hover:text-[#1F7A63]'
          }`}
        >
          <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 1.75} />
          {label}
        </button>
      ))}
    </nav>
  )
}
