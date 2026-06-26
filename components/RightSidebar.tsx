'use client'
import { useCanvasStore, CanvasElement } from '@/store/useCanvasStore'
import {
  Trash2, Copy, AlignLeft, AlignCenter, AlignRight,
  MoveUp, MoveDown, ChevronRight, Palette, Type as TypeIcon,
  Layers, Layout, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter
} from 'lucide-react'
import { useState } from 'react'

/* ── Shared constants ── */
const FONTS = ['Space Grotesk', 'Plus Jakarta Sans', 'Playfair Display', 'JetBrains Mono', 'Inter', 'Arial', 'Georgia', 'Verdana']

const COLOR_SWATCHES = [
  '#111827', '#374151', '#6B7280', '#E5E7EB', '#FFFFFF',
  '#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#F97316',
]

const GRADIENT_PRESETS = [
  { c1: '#7C3AED', c2: '#EC4899', label: 'Violet Rose' },
  { c1: '#3B82F6', c2: '#10B981', label: 'Ocean Mint' },
  { c1: '#F59E0B', c2: '#EF4444', label: 'Sunset Fire' },
  { c1: '#EC4899', c2: '#F97316', label: 'Coral Bloom' },
  { c1: '#111827', c2: '#374151', label: 'Obsidian' },
]

/* ── Input component ── */
function LabeledInput({
  label, type = 'text', value, onChange, disabled, min, suffix, step,
  onFocus, onBlur
}: {
  label: string
  type?: 'text' | 'number' | 'color'
  value: string | number
  onChange: (v: string) => void
  disabled?: boolean
  min?: number
  suffix?: string
  step?: number
  onFocus?: () => void
  onBlur?: () => void
}) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {label}
      </p>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          min={min}
          step={step}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className="xanva-input"
          style={{ paddingRight: suffix ? 26 : 11 }}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Section component ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="section-label">{title}</p>
      {children}
    </div>
  )
}

/* ── Color Picker row ── */
function ColorPicker({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {label}
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, overflow: 'hidden', flexShrink: 0, border: '2px solid #E5E7EB', cursor: 'pointer', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: value }} />
          <input type="color" value={value.startsWith('#') ? value : '#000000'} disabled={disabled} onChange={e => onChange(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
        </div>
        <input
          type="text" value={value.toUpperCase()} disabled={disabled}
          onChange={e => onChange(e.target.value)}
          className="xanva-input"
          style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
        />
      </div>
      {/* Swatches */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
        {COLOR_SWATCHES.map(c => (
          <button
            key={c}
            onClick={() => !disabled && onChange(c)}
            disabled={disabled}
            title={c}
            style={{
              width: 20, height: 20, borderRadius: 5, border: `2px solid ${value === c ? '#7C3AED' : '#E5E7EB'}`,
              background: c, cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'transform 120ms ease',
              outline: value === c ? '2px solid rgba(124,58,237,0.3)' : 'none',
              outlineOffset: 1,
            }}
            onMouseEnter={e => !disabled && ((e.currentTarget as HTMLElement).style.transform = 'scale(1.15)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
          />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function RightSidebar() {
  const {
    elements, selectedId, updateElement, deleteElement, duplicateElement,
    bringForward, sendBackward, bringToFront, sendToBack, toggleLock, toggleVisibility,
    canvasBg, setCanvasBg, canvasWidth, canvasHeight,
  } = useCanvasStore()

  const [panelOpen, setPanelOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'style' | 'text' | 'arrange'>('style')

  const el = elements.find(e => e.id === selectedId) ?? null
  const upd = (changes: Partial<CanvasElement>) => { if (el) updateElement(el.id, changes) }

  const isGradientBg = canvasBg.startsWith('linear-gradient')

  /* ── Alignment helpers ── */
  const alignTo = (dir: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!el) return
    const cw = canvasWidth, ch = canvasHeight
    const map: Record<string, Partial<CanvasElement>> = {
      left:   { x: 0 },
      center: { x: (cw - el.width)  / 2 },
      right:  { x:  cw - el.width },
      top:    { y: 0 },
      middle: { y: (ch - el.height) / 2 },
      bottom: { y:  ch - el.height },
    }
    updateElement(el.id, map[dir])
  }

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative', flexShrink: 0 }}>

      {/* ── Collapse Handle ── */}
      <div style={{
        width: 28, height: '100%', flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#F8F9FC', borderLeft: '1px solid #E5E7EB',
        cursor: 'pointer',
      }}
        onClick={() => setPanelOpen(o => !o)}
        title={panelOpen ? 'Collapse panel' : 'Open Properties panel'}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          padding: '12px 0',
          color: '#9CA3AF',
          transition: 'color 150ms ease',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#7C3AED'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9CA3AF'}
        >
          <ChevronRight size={13} style={{ transform: panelOpen ? 'rotate(180deg)' : 'none', transition: 'transform 280ms ease' }} />
          {!panelOpen && (
            <div style={{
              writingMode: 'vertical-rl', textOrientation: 'mixed',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#9CA3AF',
              transform: 'rotate(180deg)',
              marginTop: 8,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Properties
            </div>
          )}
        </div>
      </div>

      {/* ── Main Panel ── */}
      <div style={{
        width: panelOpen ? 276 : 0,
        minWidth: 0,
        overflow: 'hidden',
        transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
      }}>
        <aside className="panel-right scrollbar-thin" style={{
          width: 276, height: '100%',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* ── Panel Header ── */}
          <div style={{
            padding: '12px 14px 0',
            flexShrink: 0,
          }}>
            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, #EDE9FF, #FDF2F8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Palette size={13} style={{ color: '#7C3AED' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 12, fontWeight: 700, color: '#111827', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.2 }}>
                    {el ? `${el.type.charAt(0).toUpperCase() + el.type.slice(1)}` : 'Canvas'}
                  </h2>
                  <p style={{ fontSize: 9, color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {el ? 'Element properties' : 'Design settings'}
                  </p>
                </div>
              </div>
              {el && (
                <div style={{ display: 'flex', gap: 2 }}>
                  <button
                    onClick={() => duplicateElement(el.id)}
                    title="Duplicate"
                    style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: '#F9FAFB', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EDE9FF'; (e.currentTarget as HTMLElement).style.color = '#7C3AED' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.color = '#6B7280' }}
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => deleteElement(el.id)}
                    title="Delete"
                    style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: '#F9FAFB', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.color = '#6B7280' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Tabs — only for element selected */}
            {el && (
              <div className="pill-container" style={{ marginBottom: 10 }}>
                {[
                  { id: 'style' as const,   label: 'Style',   icon: Palette  },
                  { id: 'text' as const,    label: 'Text',    icon: TypeIcon, show: el.type === 'text' },
                  { id: 'arrange' as const, label: 'Arrange', icon: Layers   },
                ].filter(t => t.show !== false).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`tab-btn ${activeTab === id ? 'active' : ''}`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: '#E5E7EB', flexShrink: 0 }} />

          {/* ── Scrollable Content ── */}
          <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>

            {/* ══ NO ELEMENT: Canvas Settings ══ */}
            {!el && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Canvas Size Info */}
                <Section title="Canvas Dimensions">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[{ label: 'Width', val: `${canvasWidth} px` }, { label: 'Height', val: `${canvasHeight} px` }].map(d => (
                      <div key={d.label} style={{
                        padding: '10px 12px', borderRadius: 10,
                        background: '#F9FAFB', border: '1.5px solid #E5E7EB',
                      }}>
                        <p style={{ fontSize: 9, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{d.label}</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: "'JetBrains Mono', monospace" }}>{d.val}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Background Type Switcher */}
                <Section title="Background">
                  <div className="pill-container" style={{ marginBottom: 12 }}>
                    {[{ id: 'solid', label: 'Solid' }, { id: 'gradient', label: 'Gradient' }].map(({ id, label }) => {
                      const isA = id === 'solid' ? !isGradientBg : isGradientBg
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            if (id === 'solid') setCanvasBg('#ffffff')
                            else setCanvasBg('linear-gradient(135deg, #7C3AED, #EC4899)')
                          }}
                          className={`tab-btn ${isA ? 'active' : ''}`}
                          style={{ flex: 1 }}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  {!isGradientBg ? (
                    <ColorPicker
                      label="Canvas Color"
                      value={canvasBg.startsWith('#') ? canvasBg : '#FFFFFF'}
                      onChange={setCanvasBg}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gradient Presets</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {GRADIENT_PRESETS.map(p => (
                          <button
                            key={p.label}
                            onClick={() => setCanvasBg(`linear-gradient(135deg, ${p.c1}, ${p.c2})`)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '8px 10px', borderRadius: 9,
                              border: `1.5px solid ${canvasBg.includes(p.c1) ? '#C4B5FD' : '#E5E7EB'}`,
                              background: canvasBg.includes(p.c1) ? '#EDE9FF' : '#F9FAFB',
                              cursor: 'pointer', transition: 'all 150ms ease',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C4B5FD' }}
                            onMouseLeave={e => { if (!canvasBg.includes(p.c1)) (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB' }}
                          >
                            <div style={{ width: 30, height: 22, borderRadius: 6, background: `linear-gradient(135deg, ${p.c1}, ${p.c2})`, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, fontWeight: 500, color: '#374151', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              </div>
            )}

            {/* ══ ELEMENT SELECTED ══ */}
            {el && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* ─ STYLE TAB ─ */}
                {activeTab === 'style' && (
                  <>
                    {/* Opacity */}
                    <Section title="Opacity">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <input
                          type="range" min={0} max={1} step={0.01}
                          value={el.opacity ?? 1}
                          disabled={el.isLocked}
                          onChange={e => upd({ opacity: Number(e.target.value) })}
                          className="premium-slider"
                          style={{ flex: 1, opacity: el.isLocked ? 0.4 : 1 }}
                        />
                        <span style={{ width: 36, fontSize: 11, fontWeight: 600, color: '#7C3AED', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                          {Math.round((el.opacity ?? 1) * 100)}%
                        </span>
                      </div>
                    </Section>

                    {/* Fill — shapes only (not text, not image) */}
                    {['rect', 'circle', 'triangle', 'star', 'polygon', 'diamond', 'line'].includes(el.type) && (
                      <Section title={el.type === 'line' ? 'Line Color' : 'Fill Color'}>
                        <ColorPicker
                          label=""
                          value={el.fillColor || '#7C3AED'}
                          onChange={v => upd({ fillColor: v })}
                          disabled={el.isLocked}
                        />
                      </Section>
                    )}

                    {/* Border — shapes only */}
                    {['rect', 'circle', 'triangle', 'star', 'polygon', 'diamond'].includes(el.type) && (
                      <Section title="Border">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                          <LabeledInput
                            label="Width"
                            type="number"
                            value={el.borderWidth || 0}
                            onChange={v => upd({ borderWidth: Math.max(0, Number(v)) })}
                            disabled={el.isLocked}
                            min={0}
                            suffix="px"
                          />
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Color</p>
                            <input type="color"
                              value={el.borderColor || '#7C3AED'}
                              disabled={el.isLocked}
                              onChange={e => upd({ borderColor: e.target.value })}
                              style={{ width: '100%', height: 34, borderRadius: 8, border: '1.5px solid #E5E7EB', padding: '3px 6px', cursor: 'pointer', background: '#F9FAFB' }}
                            />
                          </div>
                        </div>
                      </Section>
                    )}

                    {/* Corner Radius */}
                    {(el.type === 'rect' || el.type === 'image') && (
                      <Section title="Corner Radius">
                        <LabeledInput label="" type="number" value={el.borderRadius || 0}
                          onChange={v => upd({ borderRadius: Math.max(0, Number(v)) })}
                          disabled={el.isLocked} min={0} suffix="px"
                        />
                      </Section>
                    )}

                    {/* Shadow */}
                    <Section title="Shadow">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <LabeledInput label="Blur" type="number" value={el.shadowBlur || 0}
                          onChange={v => upd({ shadowBlur: Math.max(0, Number(v)) })}
                          disabled={el.isLocked} min={0}
                        />
                        <LabeledInput label="X Offset" type="number" value={el.shadowOffsetX || 0}
                          onChange={v => upd({ shadowOffsetX: Number(v) })}
                          disabled={el.isLocked}
                        />
                        <LabeledInput label="Y Offset" type="number" value={el.shadowOffsetY || 0}
                          onChange={v => upd({ shadowOffsetY: Number(v) })}
                          disabled={el.isLocked}
                        />
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Color</p>
                          <input type="color"
                            value={el.shadowColor || '#000000'}
                            disabled={el.isLocked}
                            onChange={e => upd({ shadowColor: e.target.value })}
                            style={{ width: '100%', height: 34, borderRadius: 8, border: '1.5px solid #E5E7EB', padding: '3px 6px', cursor: 'pointer', background: '#F9FAFB' }}
                          />
                        </div>
                      </div>
                    </Section>

                    {/* Lock/Hide */}
                    <Section title="Layer Controls">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          { label: el.isLocked ? 'Locked' : 'Unlocked', fn: () => toggleLock(el.id), active: el.isLocked, activeColor: '#F59E0B', activeBg: '#FFFBEB' },
                          { label: el.isHidden ? 'Hidden' : 'Visible',  fn: () => toggleVisibility(el.id), active: el.isHidden, activeColor: '#EF4444', activeBg: '#FEF2F2' },
                        ].map(({ label, fn, active, activeColor, activeBg }) => (
                          <button key={label} onClick={fn} style={{
                            padding: '8px 0', borderRadius: 9, border: `1.5px solid ${active ? activeColor : '#E5E7EB'}`,
                            background: active ? activeBg : '#F9FAFB', cursor: 'pointer',
                            fontSize: 11, fontWeight: 600, color: active ? activeColor : '#6B7280',
                            transition: 'all 150ms ease', fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </Section>
                  </>
                )}

                {/* ─ TEXT TAB ─ */}
                {activeTab === 'text' && el.type === 'text' && (
                  <>
                    {/* Content */}
                    <Section title="Text Content">
                      <textarea
                        value={el.content ?? ''}
                        disabled={el.isLocked}
                        onChange={e => upd({ content: e.target.value })}
                        rows={4}
                        placeholder="Your text here…"
                        className="xanva-input"
                        style={{ resize: 'none', lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      />
                    </Section>

                    {/* Font Family + Size */}
                    <Section title="Font">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Family</p>
                          <select
                            value={el.fontFamily ?? 'Plus Jakarta Sans'}
                            disabled={el.isLocked}
                            onChange={e => upd({ fontFamily: e.target.value })}
                            className="xanva-select"
                          >
                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Size</p>
                          <input
                            type="number" value={el.fontSize ?? 24} min={6}
                            disabled={el.isLocked}
                            onChange={e => upd({ fontSize: Math.max(6, Number(e.target.value)) })}
                            className="xanva-input"
                            style={{ width: 72 }}
                          />
                        </div>
                      </div>

                      {/* Bold, Italic, Align */}
                      <div className="pill-container" style={{ marginTop: 4 }}>
                        {[
                          { label: 'B', isOn: el.fontWeight === 'bold', fn: () => upd({ fontWeight: el.fontWeight === 'bold' ? 'normal' : 'bold' }), style: { fontWeight: 700 } },
                          { label: 'I', isOn: el.fontStyle === 'italic', fn: () => upd({ fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' }), style: { fontStyle: 'italic' } },
                        ].map(({ label, isOn, fn, style: s }) => (
                          <button
                            key={label}
                            onClick={fn}
                            disabled={el.isLocked}
                            className={`tab-btn ${isOn ? 'active' : ''}`}
                            style={{ flex: 1, ...s }}
                          >
                            {label}
                          </button>
                        ))}
                        <div style={{ width: 1, background: '#E5E7EB', margin: '4px 0' }} />
                        {(['left', 'center', 'right'] as const).map(align => (
                          <button
                            key={align}
                            onClick={() => upd({ textAlign: align })}
                            disabled={el.isLocked}
                            className={`tab-btn ${el.textAlign === align ? 'active' : ''}`}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            {align === 'left' && <AlignLeft size={12} />}
                            {align === 'center' && <AlignCenter size={12} />}
                            {align === 'right' && <AlignRight size={12} />}
                          </button>
                        ))}
                      </div>
                    </Section>

                    {/* Text Color */}
                    <Section title="Text Color">
                      <ColorPicker
                        label="" value={el.color || '#111827'}
                        onChange={v => upd({ color: v })}
                        disabled={el.isLocked}
                      />
                    </Section>

                    {/* Text Shadow/Glow */}
                    <Section title="Glow / Shadow">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <LabeledInput label="Blur" type="number" value={el.shadowBlur || 0}
                          onChange={v => upd({ shadowBlur: Math.max(0, Number(v)) })}
                          disabled={el.isLocked} min={0}
                        />
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Color</p>
                          <input type="color" value={el.shadowColor || '#000000'} disabled={el.isLocked}
                            onChange={e => upd({ shadowColor: e.target.value })}
                            style={{ width: '100%', height: 34, borderRadius: 8, border: '1.5px solid #E5E7EB', padding: '3px 6px', cursor: 'pointer', background: '#F9FAFB' }}
                          />
                        </div>
                      </div>
                    </Section>
                  </>
                )}

                {/* ─ ARRANGE TAB ─ */}
                {activeTab === 'arrange' && (
                  <>
                    {/* Position & Size */}
                    <Section title="Position & Size">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          { label: 'X', key: 'x', val: Math.round(el.x) },
                          { label: 'Y', key: 'y', val: Math.round(el.y) },
                          { label: 'W', key: 'width',  val: Math.round(el.width),  min: 10 },
                          { label: 'H', key: 'height', val: Math.round(el.height), min: 10 },
                        ].map(({ label, key, val, min }) => (
                          <LabeledInput
                            key={key} label={label} type="number" value={val}
                            onChange={v => upd({ [key]: min ? Math.max(min, Number(v)) : Number(v) })}
                            disabled={el.isLocked} min={min} suffix="px"
                          />
                        ))}
                        <LabeledInput label="Rotate" type="number" value={Math.round(el.rotation || 0)}
                          onChange={v => upd({ rotation: Number(v) })}
                          disabled={el.isLocked} suffix="°"
                        />
                      </div>
                    </Section>

                    {/* Alignment */}
                    <Section title="Align to Canvas">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                        {[
                          { dir: 'left' as const,   icon: AlignLeft,  label: 'Left' },
                          { dir: 'center' as const, icon: AlignHorizontalJustifyCenter, label: 'Center H' },
                          { dir: 'right' as const,  icon: AlignRight, label: 'Right' },
                          { dir: 'top' as const,    icon: MoveUp,     label: 'Top' },
                          { dir: 'middle' as const, icon: AlignVerticalJustifyCenter,   label: 'Middle V' },
                          { dir: 'bottom' as const, icon: MoveDown,   label: 'Bottom' },
                        ].map(({ dir, icon: Icon, label }) => (
                          <button
                            key={dir}
                            onClick={() => alignTo(dir)}
                            disabled={el.isLocked}
                            title={label}
                            style={{
                              padding: '8px 0', borderRadius: 9, border: '1.5px solid #E5E7EB',
                              background: '#F9FAFB', cursor: 'pointer', color: '#6B7280',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 150ms ease',
                              opacity: el.isLocked ? 0.4 : 1,
                            }}
                            onMouseEnter={e => {
                              if (!el.isLocked) {
                                (e.currentTarget as HTMLElement).style.borderColor = '#C4B5FD'
                                ;(e.currentTarget as HTMLElement).style.background = '#EDE9FF'
                                ;(e.currentTarget as HTMLElement).style.color = '#7C3AED'
                              }
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'
                              ;(e.currentTarget as HTMLElement).style.background = '#F9FAFB'
                              ;(e.currentTarget as HTMLElement).style.color = '#6B7280'
                            }}
                          >
                            <Icon size={14} />
                          </button>
                        ))}
                      </div>
                    </Section>

                    {/* Z-Order */}
                    <Section title="Layer Order">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                        {[
                          { label: 'Front', fn: () => bringToFront(el.id) },
                          { label: 'Fwd',   fn: () => bringForward(el.id) },
                          { label: 'Back',  fn: () => sendBackward(el.id) },
                          { label: 'Rear',  fn: () => sendToBack(el.id) },
                        ].map(({ label, fn }) => (
                          <button
                            key={label}
                            onClick={fn}
                            disabled={el.isLocked}
                            style={{
                              padding: '7px 0', borderRadius: 8, border: '1.5px solid #E5E7EB',
                              background: '#F9FAFB', cursor: 'pointer',
                              fontSize: 10, fontWeight: 600, color: '#6B7280',
                              transition: 'all 150ms ease',
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              opacity: el.isLocked ? 0.4 : 1,
                            }}
                            onMouseEnter={e => {
                              if (!el.isLocked) {
                                (e.currentTarget as HTMLElement).style.borderColor = '#C4B5FD'
                                ;(e.currentTarget as HTMLElement).style.background = '#EDE9FF'
                                ;(e.currentTarget as HTMLElement).style.color = '#7C3AED'
                              }
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'
                              ;(e.currentTarget as HTMLElement).style.background = '#F9FAFB'
                              ;(e.currentTarget as HTMLElement).style.color = '#6B7280'
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </Section>
                  </>
                )}

              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}