'use client'
import { useCanvasStore, CanvasElement, ElementType } from '@/store/useCanvasStore'
import { v4 as uuidv4 } from 'uuid'
import {
  Type, Square, Circle, Triangle, Image as ImageIcon, Trash2,
  Layers, Minus, Diamond, Star, Hexagon,
  Eye, EyeOff, Lock, Unlock, Upload, Sparkles, ChevronLeft,
  PenTool, LayoutGrid, Images, Layers2, Shapes
} from 'lucide-react'
import { useState, useEffect } from 'react'

/* ═══════════════════════════════════════════════════════
   TEMPLATES — 4 completely new designs
═══════════════════════════════════════════════════════ */
const TEMPLATES = [
  {
    label: 'Coastal Brand Kit',
    tag: 'hot' as const,
    preview: { bg: 'linear-gradient(135deg, #0EA5E9, #10B981)', text: '#fff' },
    bg: '#0C1A2E',
    elements: [
      { type: 'rect' as const, x: 0, y: 0, width: 800, height: 600, fillColor: '#0C1A2E', borderWidth: 0, zIndex: 0 },
      { type: 'rect' as const, x: 0, y: 0, width: 800, height: 4, fillColor: '#0EA5E9', borderWidth: 0, zIndex: 1 },
      { type: 'circle' as const, x: 580, y: -60, width: 280, height: 280, fillColor: 'rgba(14,165,233,0.12)', borderWidth: 0, zIndex: 1 },
      { type: 'text' as const, x: 60, y: 140, width: 580, height: 90, content: 'COASTAL\nSTUDIO', fontSize: 52, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#FFFFFF', fillColor: 'transparent', zIndex: 3 },
      { type: 'text' as const, x: 62, y: 260, width: 400, height: 30, content: 'Brand Identity · Web Design · Strategy', fontSize: 15, fontFamily: 'Plus Jakarta Sans', color: '#94A3B8', fillColor: 'transparent', zIndex: 4 },
      { type: 'line' as const, x: 60, y: 320, width: 100, height: 3, fillColor: '#0EA5E9', borderWidth: 0, zIndex: 5 },
      { type: 'text' as const, x: 62, y: 350, width: 300, height: 30, content: 'hello@coastalstudio.co', fontSize: 13, fontFamily: 'JetBrains Mono', color: '#64748B', fillColor: 'transparent', zIndex: 6 },
      { type: 'rect' as const, x: 590, y: 160, width: 150, height: 150, fillColor: 'rgba(14,165,233,0.15)', borderColor: '#0EA5E9', borderWidth: 1, borderRadius: 12, zIndex: 7 },
    ]
  },
  {
    label: 'Rose Gold Editorial',
    tag: 'new' as const,
    preview: { bg: 'linear-gradient(135deg, #FDF2F8, #FCE7F3)', text: '#9D174D' },
    bg: '#FDF2F8',
    elements: [
      { type: 'rect' as const, x: 0, y: 0, width: 800, height: 600, fillColor: '#FDF2F8', borderWidth: 0, zIndex: 0 },
      { type: 'rect' as const, x: 500, y: 0, width: 300, height: 600, fillColor: '#FCE7F3', borderWidth: 0, zIndex: 1 },
      { type: 'text' as const, x: 50, y: 80, width: 400, height: 40, content: 'EDITORIAL', fontSize: 11, fontFamily: 'JetBrains Mono', color: '#EC4899', fillColor: 'transparent', letterSpacing: 6, zIndex: 3 },
      { type: 'text' as const, x: 48, y: 130, width: 430, height: 140, content: 'The Art of\nBeautiful\nDesign.', fontSize: 48, fontFamily: 'Playfair Display', fontWeight: 'bold', color: '#1F2937', fillColor: 'transparent', zIndex: 4 },
      { type: 'line' as const, x: 50, y: 305, width: 80, height: 2, fillColor: '#EC4899', borderWidth: 0, zIndex: 5 },
      { type: 'text' as const, x: 50, y: 330, width: 380, height: 80, content: 'Crafting visual experiences that move, inspire, and leave a lasting impression in every pixel.', fontSize: 14, fontFamily: 'Plus Jakarta Sans', color: '#6B7280', fillColor: 'transparent', zIndex: 6 },
      { type: 'circle' as const, x: 540, y: 80, width: 200, height: 200, fillColor: '#FBCFE8', borderColor: '#F9A8D4', borderWidth: 2, zIndex: 7 },
      { type: 'text' as const, x: 520, y: 370, width: 240, height: 60, content: 'Issue 12\nSpring 2026', fontSize: 14, fontFamily: 'Playfair Display', color: '#9D174D', fillColor: 'transparent', zIndex: 8 },
    ]
  },
  {
    label: 'Minimal Tech Deck',
    tag: 'pro' as const,
    preview: { bg: 'linear-gradient(135deg, #F5F3FF, #EDE9FF)', text: '#7C3AED' },
    bg: '#FAFAFA',
    elements: [
      { type: 'rect' as const, x: 0, y: 0, width: 800, height: 600, fillColor: '#FAFAFA', borderWidth: 0, zIndex: 0 },
      { type: 'rect' as const, x: 60, y: 60, width: 4, height: 480, fillColor: '#7C3AED', borderWidth: 0, zIndex: 1 },
      { type: 'text' as const, x: 90, y: 70, width: 640, height: 40, content: 'Q3 GROWTH REPORT', fontSize: 11, fontFamily: 'JetBrains Mono', color: '#7C3AED', fillColor: 'transparent', letterSpacing: 3, zIndex: 2 },
      { type: 'text' as const, x: 90, y: 120, width: 550, height: 120, content: 'Revenue\nup 340%', fontSize: 52, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#111827', fillColor: 'transparent', zIndex: 3 },
      { type: 'line' as const, x: 90, y: 265, width: 680, height: 1, fillColor: '#E5E7EB', borderWidth: 0, zIndex: 4 },
      { type: 'rect' as const, x: 90, y: 290, width: 190, height: 120, fillColor: '#EDE9FF', borderWidth: 0, borderRadius: 12, zIndex: 5 },
      { type: 'rect' as const, x: 300, y: 290, width: 190, height: 120, fillColor: '#FDF2F8', borderWidth: 0, borderRadius: 12, zIndex: 6 },
      { type: 'rect' as const, x: 510, y: 290, width: 190, height: 120, fillColor: '#F0FDF4', borderWidth: 0, borderRadius: 12, zIndex: 7 },
      { type: 'text' as const, x: 110, y: 320, width: 150, height: 30, content: '12,400', fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#7C3AED', fillColor: 'transparent', zIndex: 8 },
      { type: 'text' as const, x: 320, y: 320, width: 150, height: 30, content: '98.2%', fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#EC4899', fillColor: 'transparent', zIndex: 9 },
      { type: 'text' as const, x: 530, y: 320, width: 150, height: 30, content: '$2.4M', fontSize: 26, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#10B981', fillColor: 'transparent', zIndex: 10 },
    ]
  },
  {
    label: 'Golden Hour Poster',
    tag: 'new' as const,
    preview: { bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A, #F59E0B)', text: '#78350F' },
    bg: '#1C0A00',
    elements: [
      { type: 'rect' as const, x: 0, y: 0, width: 800, height: 600, fillColor: '#1C0A00', borderWidth: 0, zIndex: 0 },
      { type: 'circle' as const, x: 250, y: 150, width: 300, height: 300, fillColor: 'rgba(245,158,11,0.08)', borderWidth: 0, zIndex: 1 },
      { type: 'circle' as const, x: 300, y: 200, width: 200, height: 200, fillColor: 'rgba(245,158,11,0.12)', borderWidth: 0, zIndex: 2 },
      { type: 'text' as const, x: 60, y: 100, width: 680, height: 60, content: 'GOLDEN HOUR', fontSize: 58, fontFamily: 'Playfair Display', fontWeight: 'bold', color: '#F59E0B', fillColor: 'transparent', shadowColor: '#F59E0B', shadowBlur: 20, zIndex: 3 },
      { type: 'line' as const, x: 60, y: 185, width: 680, height: 1, fillColor: '#78350F', borderWidth: 0, zIndex: 4 },
      { type: 'text' as const, x: 62, y: 215, width: 680, height: 50, content: 'WHERE LIGHT MEETS DESIGN', fontSize: 14, fontFamily: 'JetBrains Mono', color: '#D97706', fillColor: 'transparent', letterSpacing: 4, zIndex: 5 },
      { type: 'text' as const, x: 62, y: 430, width: 400, height: 80, content: 'A creative exhibition celebrating\nthe beauty of natural light\nin visual storytelling.', fontSize: 15, fontFamily: 'Plus Jakarta Sans', color: '#92400E', fillColor: 'transparent', zIndex: 6 },
      { type: 'text' as const, x: 560, y: 470, width: 180, height: 40, content: 'Sept 2026', fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#F59E0B', fillColor: 'transparent', zIndex: 7 },
    ]
  }
]

/* ═══════════════════════════════════════════════════════
   TEXT PRESETS
═══════════════════════════════════════════════════════ */
const TEXT_PRESETS = [
  {
    label: 'Hero Title', category: 'Basic',
    fontSize: 52, fontWeight: 'bold', fontFamily: 'Space Grotesk',
    color: '#111827', content: 'Hero Title Here'
  },
  {
    label: 'Section Header', category: 'Basic',
    fontSize: 28, fontWeight: '600', fontFamily: 'Space Grotesk',
    color: '#1F2937', content: 'Section Header'
  },
  {
    label: 'Body Copy', category: 'Basic',
    fontSize: 16, fontWeight: 'normal', fontFamily: 'Plus Jakarta Sans',
    color: '#6B7280', content: 'Your body text goes here. Clear and readable.'
  },
  {
    label: 'Neon Pulse', category: 'FX',
    fontSize: 38, fontWeight: 'bold', fontFamily: 'Space Grotesk',
    color: '#ffffff', content: 'NEON PULSE',
    shadowColor: '#EC4899', shadowBlur: 22, shadowOffsetX: 0, shadowOffsetY: 0
  },
  {
    label: 'Chrome Gradient', category: 'FX',
    fontSize: 42, fontWeight: '800', fontFamily: 'Space Grotesk',
    color: '#7C3AED', content: 'CHROME FX',
    gradientType: 'linear' as const, gradientColor1: '#7C3AED', gradientColor2: '#EC4899', gradientAngle: 135
  },
  {
    label: 'Classic Serif', category: 'Display',
    fontSize: 36, fontWeight: '700', fontFamily: 'Playfair Display',
    color: '#D97706', content: 'Timeless Beauty',
    shadowColor: '#92400E', shadowBlur: 0, shadowOffsetX: 2, shadowOffsetY: 2
  },
  {
    label: 'Terminal Mono', category: 'Display',
    fontSize: 24, fontWeight: '500', fontFamily: 'JetBrains Mono',
    color: '#10B981', content: '> hello_world',
    shadowColor: '#10B981', shadowBlur: 6
  },
]

/* ═══════════════════════════════════════════════════════
   SHAPES
═══════════════════════════════════════════════════════ */
const SHAPES = [
  { type: 'rect' as const,    label: 'Rectangle', icon: Square,   defaultW: 160, defaultH: 120, fill: '#7C3AED', border: '#6D28D9' },
  { type: 'circle' as const,  label: 'Circle',    icon: Circle,   defaultW: 140, defaultH: 140, fill: '#EC4899', border: '#DB2777' },
  { type: 'triangle' as const,label: 'Triangle',  icon: Triangle, defaultW: 140, defaultH: 140, fill: '#F59E0B', border: '#D97706' },
  { type: 'star' as const,    label: 'Star',      icon: Star,     defaultW: 140, defaultH: 140, fill: '#10B981', border: '#059669' },
  { type: 'polygon' as const, label: 'Hexagon',   icon: Hexagon,  defaultW: 140, defaultH: 140, fill: '#3B82F6', border: '#2563EB' },
  { type: 'diamond' as const, label: 'Diamond',   icon: Diamond,  defaultW: 140, defaultH: 140, fill: '#8B5CF6', border: '#7C3AED' },
  { type: 'line' as const,    label: 'Line',      icon: Minus,    defaultW: 200, defaultH: 4,   fill: '#9CA3AF', border: '' },
]

const STICKERS = [
  { name: 'Fire', hex: '1F525' },
  { name: 'Rocket', hex: '1F680' },
  { name: 'Sparkles', hex: '2728' },
  { name: 'Heart', hex: '1F496' },
  { name: 'Sunglasses', hex: '1F60E' },
  { name: 'Party Popper', hex: '1F389' },
  { name: 'Mind Blown', hex: '1F92F' },
  { name: 'Rainbow', hex: '1F308' },
  { name: 'Cat', hex: '1F431' },
  { name: 'Alien', hex: '1F47D' },
  { name: 'Unicorn', hex: '1F984' },
  { name: 'Pizza', hex: '1F355' },
  { name: 'Palette', hex: '1F3A8' },
  { name: 'Camera', hex: '1F4F7' },
  { name: 'Crown', hex: '1F451' },
]

/* ═══════════════════════════════════════════════════════
   STOCK PHOTOS — Fresh Unsplash collection
═══════════════════════════════════════════════════════ */
const STOCK_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=400', label: 'Workspace' },
  { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400', label: 'Gradient Wave' },
  { url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=400', label: 'Architecture' },
  { url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=400', label: 'Abstract Art' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400', label: 'Mountain Lake' },
  { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400', label: 'Watch Close' },
  { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400', label: 'Fashion' },
  { url: 'https://images.unsplash.com/photo-1517091787980-f6b64b0d3e34?q=80&w=400', label: 'City Lights' },
]

const TAB_ITEMS = [
  { id: 'templates', icon: LayoutGrid, label: 'Templates' },
  { id: 'elements',  icon: Shapes,     label: 'Elements'  },
  { id: 'text',      icon: Type,       label: 'Text'      },
  { id: 'photos',    icon: Images,     label: 'Photos'    },
  { id: 'layers',    icon: Layers2,    label: 'Layers'    },
] as const

const TYPE_ICONS: Record<ElementType, any> = {
  text: Type, rect: Square, circle: Circle, triangle: Triangle,
  star: Star, polygon: Hexagon, diamond: Diamond, line: Minus, image: ImageIcon,
}

type TabId = 'templates' | 'elements' | 'text' | 'photos' | 'layers'

/* ═══════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════ */
export default function LeftSidebar() {
  const {
    addElement, clearCanvas, setCanvasBg, elements,
    selectedId, selectElement, deleteElement,
    toggleLock, toggleVisibility, updateElement
  } = useCanvasStore()

  const [activeTab,   setActiveTab]   = useState<TabId>('templates')
  const [drawerOpen,  setDrawerOpen]  = useState(true)
  const [photoSearch, setPhotoSearch] = useState('')

  /* Auto-collapse on small screens */
  useEffect(() => {
    const check = () => { if (window.innerWidth < 1100) setDrawerOpen(false) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const addText = (preset: typeof TEXT_PRESETS[0]) => {
    addElement({
      id: uuidv4(), type: 'text',
      x: 80, y: 80, width: 340, height: 70,
      content: preset.content,
      fontSize: preset.fontSize, fontFamily: preset.fontFamily,
      fontWeight: preset.fontWeight, fontStyle: 'normal', textAlign: 'left',
      color: preset.color, fillColor: 'transparent',
      borderColor: 'transparent', borderWidth: 0, opacity: 1,
      zIndex: Date.now(),
      shadowColor:  (preset as any).shadowColor,
      shadowBlur:   (preset as any).shadowBlur,
      shadowOffsetX:(preset as any).shadowOffsetX,
      shadowOffsetY:(preset as any).shadowOffsetY,
      gradientType: (preset as any).gradientType,
      gradientColor1:(preset as any).gradientColor1,
      gradientColor2:(preset as any).gradientColor2,
      gradientAngle: (preset as any).gradientAngle,
    })
  }

  const addShape = (shape: typeof SHAPES[0]) => {
    addElement({
      id: uuidv4(), type: shape.type,
      x: 120, y: 120,
      width: shape.defaultW, height: shape.defaultH,
      fillColor: shape.fill,
      borderColor: shape.border,
      borderWidth: shape.border ? 2 : 0,
      opacity: 1, zIndex: Date.now(),
    })
  }

  const addSticker = (sticker: typeof STICKERS[0]) => {
    addElement({
      id: uuidv4(), type: 'image',
      x: 120, y: 120,
      width: 140, height: 140,
      src: `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji/color/svg/${sticker.hex}.svg`,
      opacity: 1, zIndex: Date.now(),
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => addElement({
      id: uuidv4(), type: 'image',
      x: 80, y: 80, width: 300, height: 200,
      src: ev.target?.result as string, opacity: 1, zIndex: Date.now(),
    })
    reader.readAsDataURL(file)
  }

  const addStockPhoto = (url: string) => addElement({
    id: uuidv4(), type: 'image',
    x: 80, y: 80, width: 300, height: 200,
    src: url, opacity: 1, zIndex: Date.now(),
  })

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    clearCanvas(); setCanvasBg(tpl.bg)
    tpl.elements.forEach(el => addElement({ id: uuidv4(), ...el, opacity: 1 } as any))
  }

  const handleTabClick = (id: TabId) => {
    if (activeTab === id && drawerOpen) setDrawerOpen(false)
    else { setActiveTab(id); setDrawerOpen(true) }
  }

  const BADGE_STYLES: Record<string, string> = {
    pro: 'badge badge-pro', new: 'badge badge-new', hot: 'badge badge-hot'
  }
  const BADGE_LABELS: Record<string, string> = { pro: 'PRO', new: 'NEW', hot: 'HOT' }

  const TEXT_BY_CATEGORY = TEXT_PRESETS.reduce((acc, p) => {
    acc[p.category] = [...(acc[p.category] || []), p]
    return acc
  }, {} as Record<string, typeof TEXT_PRESETS>)

  return (
    <div className="flex h-full" style={{ flexShrink: 0, position: 'relative', zIndex: 30 }}>

      {/* ── Icon Rail ── */}
      <nav
        style={{
          width: 64,
          background: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 12,
          paddingBottom: 12,
          gap: 2,
          flexShrink: 0,
        }}
      >
        {/* Group 1: Templates + Elements */}
        {TAB_ITEMS.slice(0, 2).map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id && drawerOpen
          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              title={label}
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 160ms ease',
                background: isActive
                  ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
                  : 'transparent',
                color: isActive ? '#FFFFFF' : '#9CA3AF',
                boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = '#F5F3FF'
                  ;(e.currentTarget as HTMLElement).style.color = '#7C3AED'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = '#9CA3AF'
                }
              }}
            >
              <Icon size={21} />
            </button>
          )
        })}

        {/* Divider */}
        <div style={{ width: 28, height: 1, background: '#E5E7EB', margin: '6px 0' }} />

        {/* Group 2: Text + Photos */}
        {TAB_ITEMS.slice(2, 4).map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id && drawerOpen
          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              title={label}
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 160ms ease',
                background: isActive
                  ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
                  : 'transparent',
                color: isActive ? '#FFFFFF' : '#9CA3AF',
                boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = '#F5F3FF'
                  ;(e.currentTarget as HTMLElement).style.color = '#7C3AED'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = '#9CA3AF'
                }
              }}
            >
              <Icon size={21} />
            </button>
          )
        })}

        {/* Divider */}
        <div style={{ width: 28, height: 1, background: '#E5E7EB', margin: '6px 0' }} />

        {/* Group 3: Layers */}
        {TAB_ITEMS.slice(4).map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id && drawerOpen
          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              title={label}
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 160ms ease',
                background: isActive
                  ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
                  : 'transparent',
                color: isActive ? '#FFFFFF' : '#9CA3AF',
                boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = '#F5F3FF'
                  ;(e.currentTarget as HTMLElement).style.color = '#7C3AED'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = '#9CA3AF'
                }
              }}
            >
              <Icon size={21} />
            </button>
          )
        })}
      </nav>

      {/* ── Sliding Content Drawer ── */}
      <div style={{
        width: drawerOpen ? 316 : 0,
        minWidth: 0,
        overflow: 'hidden',
        transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
      }}>
        <aside
          className="panel-left scrollbar-thin"
          style={{
            width: 316, height: '100%',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Drawer Header */}
          <div style={{
            padding: '14px 16px 10px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <h2 style={{
                fontSize: 13, fontWeight: 700, color: '#111827',
                fontFamily: "'Space Grotesk', sans-serif",
                textTransform: 'capitalize',
              }}>
                {activeTab}
              </h2>
              <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {activeTab === 'templates' && 'Ready-made designs'}
                {activeTab === 'elements'  && 'Shapes & graphics'}
                {activeTab === 'text'      && 'Typography styles'}
                {activeTab === 'photos'    && 'Stock imagery'}
                {activeTab === 'layers'    && `${elements.length} layer${elements.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              style={{
                width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E7EB',
                background: '#F9FAFB', cursor: 'pointer', color: '#6B7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#C4B5FD'
                ;(e.currentTarget as HTMLElement).style.color = '#7C3AED'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'
                ;(e.currentTarget as HTMLElement).style.color = '#6B7280'
              }}
            >
              <ChevronLeft size={15} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

            {/* ══ TEMPLATES ══ */}
            {activeTab === 'templates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    onClick={() => applyTemplate(tpl)}
                    className="template-card"
                    style={{ textAlign: 'left', padding: 0, width: '100%', border: 'none' }}
                  >
                    {/* Mini Preview */}
                    <div style={{
                      height: 100, borderRadius: '10px 10px 0 0',
                      background: tpl.preview.bg,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'flex-start', justifyContent: 'flex-end',
                      padding: '10px 12px',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {/* Decorative circles in preview */}
                      <div style={{
                        position: 'absolute', top: -20, right: -20,
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                      }} />
                      <div style={{
                        position: 'absolute', bottom: -10, right: 30,
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                      }} />
                      <span className={BADGE_STYLES[tpl.tag]}>
                        {BADGE_LABELS[tpl.tag]}
                      </span>
                    </div>
                    {/* Card Footer */}
                    <div style={{
                      padding: '10px 12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: 12, fontWeight: 600, color: '#111827',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                          {tpl.label}
                        </h4>
                        <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>Click to apply</p>
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 600, color: '#7C3AED',
                        padding: '3px 8px', borderRadius: 6, background: '#EDE9FF',
                      }}>
                        Use →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ══ ELEMENTS ══ */}
            {activeTab === 'elements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p className="section-label">Shapes & Lines</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {SHAPES.map((shape) => {
                      const Icon = shape.icon
                      return (
                        <button
                          key={shape.label}
                          onClick={() => addShape(shape)}
                          style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '14px 8px',
                            background: '#F9FAFB',
                            border: '1.5px solid #E5E7EB',
                            borderRadius: 12, cursor: 'pointer',
                            transition: 'all 200ms ease',
                            color: '#6B7280',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = '#EDE9FF'
                            ;(e.currentTarget as HTMLElement).style.borderColor = '#C4B5FD'
                            ;(e.currentTarget as HTMLElement).style.color = '#7C3AED'
                            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = '#F9FAFB'
                            ;(e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'
                            ;(e.currentTarget as HTMLElement).style.color = '#6B7280'
                            ;(e.currentTarget as HTMLElement).style.transform = 'none'
                          }}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: `${shape.fill}20`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Icon size={18} style={{ color: shape.fill }} />
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {shape.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <p className="section-label" style={{ marginTop: 8 }}>Stickers</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                    {STICKERS.map((sticker) => (
                      <button
                        key={sticker.name}
                        onClick={() => addSticker(sticker)}
                        style={{
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', gap: 4,
                          padding: '10px 4px',
                          background: '#F9FAFB',
                          border: '1.5px solid #E5E7EB',
                          borderRadius: 10, cursor: 'pointer',
                          transition: 'all 200ms ease',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = '#EDE9FF'
                          ;(e.currentTarget as HTMLElement).style.borderColor = '#C4B5FD'
                          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = '#F9FAFB'
                          ;(e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'
                          ;(e.currentTarget as HTMLElement).style.transform = 'none'
                        }}
                      >
                        <img 
                          src={`https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji/color/svg/${sticker.hex}.svg`} 
                          alt={sticker.name}
                          style={{ width: 34, height: 34, objectFit: 'contain' }}
                          draggable={false}
                        />
                        <span style={{ fontSize: 8, fontWeight: 600, color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {sticker.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ TEXT ══ */}
            {activeTab === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(TEXT_BY_CATEGORY).map(([category, presets]) => (
                  <div key={category}>
                    <p className="section-label">{category}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {presets.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => addText(preset)}
                          style={{
                            textAlign: 'left', padding: '10px 12px',
                            background: '#FFFFFF', border: '1.5px solid #E5E7EB',
                            borderRadius: 10, cursor: 'pointer', width: '100%',
                            transition: 'all 150ms ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = '#C4B5FD'
                            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(124,58,237,0.08)'
                            ;(e.currentTarget as HTMLElement).style.background = '#FAFBFF'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'
                            ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                            ;(e.currentTarget as HTMLElement).style.background = '#FFFFFF'
                          }}
                        >
                          <div>
                            <p style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                              {preset.label}
                            </p>
                            <span style={{
                              fontFamily: preset.fontFamily,
                              fontWeight: preset.fontWeight as any,
                              fontSize: Math.min(preset.fontSize, 18),
                              color: preset.color === '#ffffff' ? '#111827' : preset.color,
                            }}>
                              {preset.content.length > 20 ? preset.content.substring(0,20) + '…' : preset.content}
                            </span>
                          </div>
                          <div style={{
                            width: 24, height: 24, borderRadius: 6,
                            background: '#EDE9FF', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Sparkles size={12} style={{ color: '#7C3AED' }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ══ PHOTOS ══ */}
            {activeTab === 'photos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Upload Zone */}
                <label style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '20px 16px',
                  background: 'linear-gradient(135deg, #F5F3FF, #FDF2F8)',
                  border: '2px dashed #C4B5FD',
                  borderRadius: 12, cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Upload size={18} style={{ color: '#FFFFFF' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Drop image here
                    </p>
                    <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
                      or click to browse files
                    </p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>

                {/* Stock Photos */}
                <div>
                  <p className="section-label">Curated Stock Photos</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {STOCK_PHOTOS.map((img) => (
                      <button
                        key={img.url}
                        onClick={() => addStockPhoto(img.url)}
                        style={{
                          position: 'relative', borderRadius: 10,
                          border: '1.5px solid #E5E7EB', overflow: 'hidden',
                          aspectRatio: '4/3', cursor: 'pointer', padding: 0,
                          background: '#F3F4F6',
                          transition: 'all 200ms ease',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#C4B5FD'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'}
                      >
                        <img
                          src={img.url} alt={img.label}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(124,58,237,0.75)',
                          opacity: 0, transition: 'opacity 200ms ease',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}
                        >
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: '#FFFFFF',
                            background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: 6,
                          }}>
                            + Add
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ LAYERS ══ */}
            {activeTab === 'layers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {elements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: '#F3F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}>
                      <Layers size={22} style={{ color: '#9CA3AF' }} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                      No layers yet
                    </p>
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>
                      Add elements to your canvas to see them here
                    </p>
                  </div>
                ) : (
                  [...elements].reverse().map((el) => {
                    const Icon = TYPE_ICONS[el.type] || Square
                    const isSelected = selectedId === el.id
                    return (
                      <div
                        key={el.id}
                        onClick={() => selectElement(el.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 10px',
                          borderRadius: 10, cursor: 'pointer',
                          background: isSelected ? '#EDE9FF' : '#FFFFFF',
                          border: `1.5px solid ${isSelected ? '#C4B5FD' : '#E5E7EB'}`,
                          transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#FFFFFF'
                        }}
                      >
                        {/* Type icon pill */}
                        <div style={{
                          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                          background: isSelected ? '#DDD6FE' : '#F3F4F6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={13} style={{ color: isSelected ? '#7C3AED' : '#9CA3AF' }} />
                        </div>

                        {/* Name */}
                        <input
                          type="text"
                          value={el.content ? el.content.substring(0, 16) : el.type}
                          onChange={(e) => updateElement(el.id, { content: e.target.value })}
                          disabled={el.type !== 'text'}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            flex: 1, background: 'transparent', border: 'none', outline: 'none',
                            fontSize: 11, fontWeight: 500, color: '#374151',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            cursor: el.type === 'text' ? 'text' : 'default',
                            minWidth: 0,
                          }}
                        />

                        {/* Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}
                          onClick={e => e.stopPropagation()}
                        >
                          {[
                            {
                              fn: () => toggleVisibility(el.id),
                              active: el.isHidden,
                              icon: el.isHidden ? EyeOff : Eye,
                              activeColor: '#EF4444',
                              title: el.isHidden ? 'Show' : 'Hide',
                            },
                            {
                              fn: () => toggleLock(el.id),
                              active: el.isLocked,
                              icon: el.isLocked ? Lock : Unlock,
                              activeColor: '#F59E0B',
                              title: el.isLocked ? 'Unlock' : 'Lock',
                            },
                            {
                              fn: () => deleteElement(el.id),
                              active: false,
                              icon: Trash2,
                              activeColor: '#EF4444',
                              title: 'Delete',
                              danger: true,
                            },
                          ].map(({ fn, active, icon: BtnIcon, activeColor, title, danger }) => (
                            <button
                              key={title}
                              onClick={fn}
                              title={title}
                              style={{
                                width: 22, height: 22, borderRadius: 5, border: 'none',
                                background: 'transparent', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: active ? activeColor : '#9CA3AF',
                                transition: 'all 120ms ease',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = danger ? '#FEF2F2' : '#F3F4F6'
                                ;(e.currentTarget as HTMLElement).style.color = danger ? '#EF4444' : '#374151'
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent'
                                ;(e.currentTarget as HTMLElement).style.color = active ? activeColor : '#9CA3AF'
                              }}
                            >
                              <BtnIcon size={12} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

          </div>

          {/* ── Footer: Clear Canvas ── */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid #E5E7EB', flexShrink: 0 }}>
            <button
              onClick={() => { if (confirm('Clear everything on the canvas?')) clearCanvas() }}
              style={{
                width: '100%', padding: '9px', borderRadius: 10,
                border: '1.5px solid #FECACA',
                background: '#FFF5F5', color: '#DC2626',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#FEE2E2'
                ;(e.currentTarget as HTMLElement).style.borderColor = '#FCA5A5'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#FFF5F5'
                ;(e.currentTarget as HTMLElement).style.borderColor = '#FECACA'
              }}
            >
              <Trash2 size={13} />
              Reset Canvas
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}