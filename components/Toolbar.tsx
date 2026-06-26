'use client'
import { useCanvasStore } from '@/store/useCanvasStore'
import {
  Undo2, Redo2, Download, Upload, Monitor, ChevronDown, 
  FileJson, Check, Smartphone, Tablet, Tv, Layout, Grid3X3,
  Sparkles, Zap
} from 'lucide-react'
import { useState, useRef } from 'react'

const CANVAS_SIZES = [
  { label: 'Default Canvas', sub: '800 × 600', w: 800,  h: 600,  icon: Layout },
  { label: 'Instagram Post', sub: '1080 × 1080', w: 1080, h: 1080, icon: Smartphone },
  { label: 'Instagram Story', sub: '540 × 960',  w: 540,  h: 960,  icon: Smartphone },
  { label: 'YouTube Thumb',  sub: '1280 × 720', w: 1280, h: 720,  icon: Tv },
  { label: 'A4 Document',    sub: '794 × 1123', w: 794,  h: 1123, icon: Tablet },
  { label: 'Web Banner',     sub: '1200 × 400', w: 1200, h: 400,  icon: Monitor },
]

/* ── XANVA Sparkle Logo ── */
function XanvaLogo() {
  return (
    <svg viewBox="0 0 44 44" fill="none" style={{ width: 34, height: 34 }}>
      <defs>
        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F9A8D4" />
        </linearGradient>
      </defs>
      {/* Main 4-pointed sparkle */}
      <path
        d="M22 4 L25.5 18.5 L40 22 L25.5 25.5 L22 40 L18.5 25.5 L4 22 L18.5 18.5 Z"
        fill="url(#lg1)"
      />
      {/* Small inner diamond accent */}
      <path
        d="M22 14 L23.8 20.2 L30 22 L23.8 23.8 L22 30 L20.2 23.8 L14 22 L20.2 20.2 Z"
        fill="url(#lg2)"
        opacity="0.7"
      />
      {/* Tiny accent dot */}
      <circle cx="36" cy="10" r="2.5" fill="#EC4899" opacity="0.85" />
      <circle cx="36" cy="10" r="4"   fill="#EC4899" opacity="0.2" />
    </svg>
  )
}

export default function Toolbar() {
  const {
    undo, redo, history, future, canvasBg, setCanvasBg,
    canvasWidth, canvasHeight, setCanvasSize, elements, loadDesign
  } = useCanvasStore()

  const [showSizes, setShowSizes]   = useState(false)
  const [showExport, setShowExport] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── Export handlers (logic unchanged) ── */
  const downloadPNG = async () => {
    setShowExport(false)
    const { default: html2canvas } = await import('html2canvas')
    const canvas = document.getElementById('design-canvas')
    if (!canvas) return
    try {
      const result = await html2canvas(canvas, { useCORS: true, scale: 2 })
      const link = document.createElement('a')
      link.download = 'xanva-design.png'
      link.href = result.toDataURL('image/png')
      link.click()
    } catch (err) { console.error(err) }
  }
  const downloadJPG = async () => {
    setShowExport(false)
    const { default: html2canvas } = await import('html2canvas')
    const canvas = document.getElementById('design-canvas')
    if (!canvas) return
    try {
      const result = await html2canvas(canvas, { useCORS: true, scale: 2 })
      const link = document.createElement('a')
      link.download = 'xanva-design.jpg'
      link.href = result.toDataURL('image/jpeg', 0.95)
      link.click()
    } catch (err) { console.error(err) }
  }
  const downloadJSON = () => {
    setShowExport(false)
    const data = { canvasBg, canvasWidth, canvasHeight, elements }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'xanva-project.json'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }
  const handleJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data && Array.isArray(data.elements)) {
          loadDesign(data.elements, data.canvasBg || '#ffffff')
          if (typeof data.canvasWidth === 'number') setCanvasSize(data.canvasWidth, data.canvasHeight)
        } else alert('Invalid design file format!')
      } catch { alert('Failed to parse design file!') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const currentPreset = CANVAS_SIZES.find(s => s.w === canvasWidth && s.h === canvasHeight)

  /* ── Shared hover helpers ── */
  const iconBtnHover = (e: React.MouseEvent, enter: boolean) => {
    const el = e.currentTarget as HTMLElement
    if (enter) {
      el.style.background = '#EDE9FF'
      el.style.color = '#7C3AED'
    } else {
      el.style.background = 'transparent'
      el.style.color = '#6B7280'
    }
  }

  return (
    <header
      style={{
        height: 58,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8,
        zIndex: 150,
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      {/* ── Brand ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 4, flexShrink: 0 }}>
        <div className="animate-sparkle" style={{ lineHeight: 0 }}>
          <XanvaLogo />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            XANVA
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            fontWeight: 500,
            color: '#9CA3AF',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            Studio
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: '#E5E7EB', margin: '0 4px', flexShrink: 0 }} />


      {/* ── Undo / Redo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {[
          { fn: undo, enabled: history.length > 0, Icon: Undo2, title: 'Undo  Ctrl+Z' },
          { fn: redo, enabled: future.length > 0,  Icon: Redo2, title: 'Redo  Ctrl+Y' },
        ].map(({ fn, enabled, Icon, title }) => (
          <button
            key={title}
            onClick={fn}
            disabled={!enabled}
            title={title}
            style={{
              padding: 7,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: '#6B7280',
              cursor: enabled ? 'pointer' : 'not-allowed',
              opacity: enabled ? 1 : 0.35,
              transition: 'all 150ms ease',
              lineHeight: 0,
            }}
            onMouseEnter={e => enabled && iconBtnHover(e, true)}
            onMouseLeave={e => iconBtnHover(e, false)}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: '#E5E7EB', margin: '0 4px', flexShrink: 0 }} />

      {/* ── Canvas Size Picker ── */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setShowSizes(s => !s)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            background: '#F9FAFB',
            border: '1.5px solid #E5E7EB',
            borderRadius: 9,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            color: '#374151',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'all 150ms ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#C4B5FD'
            ;(e.currentTarget as HTMLElement).style.background = '#FAFAFA'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'
            ;(e.currentTarget as HTMLElement).style.background = '#F9FAFB'
          }}
        >
          <Monitor size={13} style={{ color: '#7C3AED' }} />
          <span>{currentPreset ? currentPreset.label : `${canvasWidth}×${canvasHeight}`}</span>
          <ChevronDown size={11} style={{
            color: '#9CA3AF',
            transform: showSizes ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms ease'
          }} />
        </button>

        {showSizes && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSizes(false)} />
            <div className="animate-scale-in" style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0,
              zIndex: 50, width: 240,
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              padding: 6,
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', padding: '6px 10px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Canvas Presets
              </p>
              {CANVAS_SIZES.map((s) => {
                const Icon = s.icon
                const isActive = s.w === canvasWidth && s.h === canvasHeight
                return (
                  <button
                    key={s.label}
                    onClick={() => { setCanvasSize(s.w, s.h); setShowSizes(false) }}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '8px 10px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      borderRadius: 9, border: 'none', cursor: 'pointer',
                      background: isActive ? '#EDE9FF' : 'transparent',
                      color: isActive ? '#7C3AED' : '#374151',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: 'all 120ms ease',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <div style={{
                      width: 30, height: 30,
                      background: isActive ? '#DDD6FE' : '#F3F4F6',
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={14} style={{ color: isActive ? '#7C3AED' : '#6B7280' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{s.sub}</div>
                    </div>
                    {isActive && <Check size={14} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Import ── */}
      <button
        onClick={() => fileInputRef.current?.click()}
        title="Import Project (.json)"
        className="btn-secondary"
        style={{ flexShrink: 0 }}
      >
        <Upload size={13} />
        <span>Import</span>
        <input type="file" ref={fileInputRef} accept=".json" className="hidden" onChange={handleJSONUpload} />
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* ── Export Button ── */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setShowExport(s => !s)}
          className="btn-primary"
        >
          <Zap size={14} />
          <span>Export</span>
          <ChevronDown size={12} style={{
            transform: showExport ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms ease'
          }} />
        </button>

        {showExport && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
            <div className="animate-scale-in" style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              zIndex: 50, width: 220,
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              padding: 6,
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', padding: '6px 10px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Export Format
              </p>
              {[
                { label: 'PNG Image', sub: 'Best for web & social', color: '#7C3AED', bg: '#EDE9FF', fn: downloadPNG },
                { label: 'JPG Image', sub: 'Smaller file size', color: '#EC4899', bg: '#FDF2F8', fn: downloadJPG },
              ].map(({ label, sub, color, bg, fn }) => (
                <button
                  key={label}
                  onClick={fn}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '9px 10px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: 'transparent', color: '#374151',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: 'all 120ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div style={{ width: 30, height: 30, background: bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Download size={13} style={{ color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>{sub}</div>
                  </div>
                </button>
              ))}
              <div style={{ height: 1, background: '#F3F4F6', margin: '4px 8px' }} />
              <button
                onClick={downloadJSON}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '9px 10px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: 'transparent', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 120ms ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div style={{ width: 30, height: 30, background: '#F0FDF4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileJson size={13} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>Save Project</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>Xanva project file (.json)</div>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}