'use client'
import Toolbar from '@/components/Toolbar'
import LeftSidebar from '@/components/LeftSidebar'
import Canvas from '@/components/Canvas'
import RightSidebar from '@/components/RightSidebar'

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#EEF1F8' }}>
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <Canvas />
        <RightSidebar />
      </div>
    </div>
  )
}