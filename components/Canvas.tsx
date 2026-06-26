'use client'
import { useCanvasStore, CanvasElement, ElementType } from '@/store/useCanvasStore'
import { useRef, useState, useCallback, useEffect } from 'react'

interface DragState   { id: string; startX: number; startY: number; origX: number; origY: number }
interface ResizeState { id: string; handle: string; startX: number; startY: number; origX: number; origY: number; origW: number; origH: number }
interface RotateState { id: string; centerX: number; centerY: number }
interface SnapLines   { x?: number; y?: number }

/* ════════════════════════════════
   TEXT ELEMENT
════════════════════════════════ */
function TextEl({ el, isSelected, onMouseDown, onDoubleClick }:
  { el: CanvasElement; isSelected: boolean; onMouseDown: (e: React.MouseEvent) => void; onDoubleClick: () => void }) {
  const { updateElement } = useCanvasStore()
  const [editing, setEditing] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (editing) taRef.current?.focus() }, [editing])

  const shadowFilter = el.shadowBlur
    ? `drop-shadow(${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur}px ${el.shadowColor || 'rgba(0,0,0,0.4)'})`
    : undefined

  const sharedStyle: React.CSSProperties = {
    position: 'absolute', left: el.x, top: el.y,
    width: el.width, height: el.height, zIndex: el.zIndex,
    opacity: el.opacity ?? 1,
    transform: `rotate(${el.rotation || 0}deg)`, transformOrigin: 'center center',
    filter: shadowFilter,
    fontSize: el.fontSize, fontFamily: el.fontFamily,
    fontWeight: el.fontWeight as any, fontStyle: el.fontStyle,
    textAlign: el.textAlign as any, color: el.color,
    lineHeight: el.lineHeight || 1.45,
    letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
  }

  if (editing) {
    return (
      <textarea
        ref={taRef}
        value={el.content ?? ''}
        onChange={e => updateElement(el.id, { content: e.target.value })}
        onBlur={() => setEditing(false)}
        style={{
          ...sharedStyle,
          background: 'rgba(255,255,255,0.85)',
          border: '2px solid #7C3AED',
          borderRadius: 4, outline: 'none', resize: 'none',
          padding: '4px 6px', boxSizing: 'border-box',
          boxShadow: '0 0 0 4px rgba(124,58,237,0.12)',
          whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
        }}
      />
    )
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={() => { if (!el.isLocked) { setEditing(true); onDoubleClick() } }}
      style={{
        ...sharedStyle,
        padding: '4px 6px', boxSizing: 'border-box',
        cursor: el.isLocked ? 'not-allowed' : 'grab',
        userSelect: 'none',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        outline: isSelected ? '2px solid #7C3AED' : '2px solid transparent',
        outlineOffset: 2, borderRadius: 2,
      }}
    >
      {el.content}
    </div>
  )
}

/* ════════════════════════════════
   SHAPE ELEMENT
════════════════════════════════ */
function ShapeEl({ el, isSelected, onMouseDown }:
  { el: CanvasElement; isSelected: boolean; onMouseDown: (e: React.MouseEvent) => void }) {
  const shadowFilter = el.shadowBlur
    ? `drop-shadow(${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur}px ${el.shadowColor || 'rgba(0,0,0,0.3)'})`
    : undefined

  const base: React.CSSProperties = {
    position: 'absolute', left: el.x, top: el.y,
    width: el.width, height: el.height, zIndex: el.zIndex,
    opacity: el.opacity ?? 1,
    cursor: el.isLocked ? 'not-allowed' : 'grab',
    outline: isSelected ? '2px solid #7C3AED' : 'none', outlineOffset: 2,
    transform: `rotate(${el.rotation || 0}deg)`, transformOrigin: 'center center',
    filter: shadowFilter,
  }

  const borderStyle = el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || 'transparent'}` : 'none'

  if (el.type === 'rect') return <div onMouseDown={onMouseDown} style={{ ...base, backgroundColor: el.fillColor, border: borderStyle, borderRadius: el.borderRadius || 0 }} />
  if (el.type === 'circle') return <div onMouseDown={onMouseDown} style={{ ...base, backgroundColor: el.fillColor, border: borderStyle, borderRadius: '50%' }} />
  if (el.type === 'line')   return <div onMouseDown={onMouseDown} style={{ ...base, backgroundColor: el.fillColor || '#9CA3AF', height: Math.max(2, el.height) }} />

  const fill = el.fillColor || '#7C3AED'
  const stroke = el.borderColor || 'transparent'
  const sw = el.borderWidth || 0
  let svgContent: React.ReactNode = null
  if (el.type === 'triangle') svgContent = <polygon points="50,0 100,100 0,100" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
  if (el.type === 'star')     svgContent = <polygon points="50,0 63,38 100,38 69,59 82,100 50,75 18,100 31,59 0,38 37,38" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
  if (el.type === 'polygon')  svgContent = <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
  if (el.type === 'diamond')  svgContent = <polygon points="50,0 100,50 50,100 0,50" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
  return <svg onMouseDown={onMouseDown} style={{ ...base, overflow: 'visible' }} viewBox="0 0 100 100" preserveAspectRatio="none">{svgContent}</svg>
}

/* ════════════════════════════════
   IMAGE ELEMENT
════════════════════════════════ */
function ImageEl({ el, isSelected, onMouseDown }:
  { el: CanvasElement; isSelected: boolean; onMouseDown: (e: React.MouseEvent) => void }) {
  const shadowFilter = el.shadowBlur
    ? `drop-shadow(${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur}px ${el.shadowColor || 'rgba(0,0,0,0.3)'})`
    : undefined
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute', left: el.x, top: el.y,
        width: el.width, height: el.height, zIndex: el.zIndex,
        opacity: el.opacity ?? 1, borderRadius: el.borderRadius || 0, overflow: 'hidden',
        cursor: el.isLocked ? 'not-allowed' : 'grab',
        outline: isSelected ? '2px solid #7C3AED' : 'none', outlineOffset: 2,
        transform: `rotate(${el.rotation || 0}deg)`, transformOrigin: 'center center',
        filter: shadowFilter,
      }}
    >
      <img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: el.src?.endsWith('.svg') ? 'contain' : 'cover', userSelect: 'none', pointerEvents: 'none', display: 'block' }} draggable={false} />
    </div>
  )
}

/* ════════════════════════════════
   SELECTION OUTLINE
════════════════════════════════ */
function SelectionOutline({ el, onResizeStart, onRotateStart }:
  { el: CanvasElement; onResizeStart: (e: React.MouseEvent, h: string) => void; onRotateStart: (e: React.MouseEvent) => void }) {
  const handles = ['nw','n','ne','e','se','s','sw','w']
  const cursors: Record<string,string> = { nw:'nw-resize',n:'n-resize',ne:'ne-resize',e:'e-resize',se:'se-resize',s:'s-resize',sw:'sw-resize',w:'w-resize' }
  const pos: Record<string, React.CSSProperties> = {
    nw:{left:-5,top:-5}, n:{left:'50%',top:-5,transform:'translateX(-50%)'}, ne:{right:-5,top:-5},
    e:{right:-5,top:'50%',transform:'translateY(-50%)'}, se:{right:-5,bottom:-5},
    s:{left:'50%',bottom:-5,transform:'translateX(-50%)'}, sw:{left:-5,bottom:-5}, w:{left:-5,top:'50%',transform:'translateY(-50%)'},
  }
  return (
    <div style={{
      position: 'absolute', left: el.x, top: el.y,
      width: el.width, height: el.height, zIndex: el.zIndex + 1000,
      pointerEvents: 'none',
      outline: el.isLocked ? '2px solid #F59E0B' : '2px solid #7C3AED',
      outlineOffset: 2,
      borderRadius: (el.type === 'rect' || el.type === 'image') ? el.borderRadius : 0,
      transform: `rotate(${el.rotation || 0}deg)`, transformOrigin: 'center center',
      boxShadow: el.isLocked ? 'none' : '0 0 0 4px rgba(124,58,237,0.1)',
    }}>
      {!el.isLocked && handles.map(h => (
        <div key={h} onMouseDown={e => { e.stopPropagation(); onResizeStart(e, h) }} style={{
          position: 'absolute', width: 9, height: 9,
          background: '#FFFFFF', border: '2px solid #7C3AED', borderRadius: 2,
          cursor: cursors[h], pointerEvents: 'all',
          boxShadow: '0 1px 4px rgba(124,58,237,0.3)',
          ...pos[h]
        }} />
      ))}
      {!el.isLocked && (
        <>
          <div onMouseDown={e => { e.stopPropagation(); onRotateStart(e) }} style={{
            position: 'absolute', left: '50%', top: -24, transform: 'translateX(-50%)',
            width: 11, height: 11, borderRadius: '50%',
            background: '#FFFFFF', border: '2px solid #7C3AED',
            cursor: 'grab', pointerEvents: 'all',
            boxShadow: '0 2px 8px rgba(124,58,237,0.35)',
          }} title="Rotate" />
          <div style={{
            position: 'absolute', left: '50%', top: -14, transform: 'translateX(-50%)',
            width: 1.5, height: 14, background: '#7C3AED', opacity: 0.5,
          }} />
        </>
      )}
    </div>
  )
}

/* ════════════════════════════════
   RULER
════════════════════════════════ */
function Ruler({ direction, length, zoom, pan }:
  { direction: 'h'|'v'; length: number; zoom: number; pan: number }) {
  const isH = direction === 'h'
  const step = 50
  const start = Math.ceil(-pan / zoom / step) * step
  const end   = Math.floor((length - pan) / zoom / step) * step
  const ticks: React.ReactNode[] = []
  for (let v = start; v <= end; v += step) {
    const major = v % 100 === 0
    const px = v * zoom + pan
    if (px < 0 || px > length) continue
    ticks.push(
      <div key={v} style={{
        position: 'absolute',
        [isH ? 'left' : 'top']: px,
        [isH ? 'top' : 'left']: 0,
        [isH ? 'width' : 'height']: 1,
        [isH ? 'height' : 'width']: major ? 10 : 5,
        background: major ? '#C4B5FD' : '#D1D5DB',
      }}>
        {major && (
          <span style={{
            position: 'absolute',
            [isH ? 'left' : 'top']: 2,
            [isH ? 'top' : 'left']: 11,
            fontSize: 7.5, color: '#9CA3AF',
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: 'nowrap',
            transform: isH ? 'none' : 'rotate(90deg)',
            transformOrigin: 'top left',
          }}>
            {v}
          </span>
        )}
      </div>
    )
  }
  return (
    <div 
      onMouseDown={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        [isH ? 'top' : 'left']: 0,
        [isH ? 'left' : 'top']: 0,
        [isH ? 'width' : 'height']: length,
        [isH ? 'height' : 'width']: 20,
        background: '#FFFFFF',
        [isH ? 'borderBottom' : 'borderRight']: '1px solid #E5E7EB',
        zIndex: 98, overflow: 'hidden',
      }}
    >
      {ticks}
    </div>
  )
}

/* ════════════════════════════════
   MAIN CANVAS
════════════════════════════════ */
export default function Canvas() {
  const { elements, selectedId, selectElement, updateElement, canvasBg, canvasWidth, canvasHeight } = useCanvasStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLDivElement>(null)
  const drag    = useRef<DragState   | null>(null)
  const resize  = useRef<ResizeState | null>(null)
  const rotate  = useRef<RotateState | null>(null)

  const [pan,        setPan       ] = useState({ x: 80, y: 80 })
  const [zoom,       setZoom      ] = useState(0.85)
  const [showGrid,   setShowGrid  ] = useState(false)
  const [showRulers, setShowRulers] = useState(true)
  const [spaceDown,  setSpaceDown ] = useState(false)
  const [isPanning,  setIsPanning ] = useState(false)
  const [panOrigin,  setPanOrigin ] = useState({ x: 0, y: 0 })
  const [snapLines,  setSnapLines ] = useState<SnapLines | null>(null)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  /* Track container size */
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(([entry]) => {
      setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return
    const cw = containerRef.current.clientWidth
    const ch = containerRef.current.clientHeight
    const newZoom = Math.min(1.4, Math.max(0.25, Math.min((cw - 100) / canvasWidth, (ch - 100) / canvasHeight)))
    setZoom(newZoom)
    setPan({ x: (cw - canvasWidth * newZoom) / 2, y: (ch - canvasHeight * newZoom) / 2 })
  }, [canvasWidth, canvasHeight])

  useEffect(() => { setTimeout(fitToScreen, 120) }, [fitToScreen])

  /* Keyboard shortcuts */
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement === document.body) { e.preventDefault(); setSpaceDown(true) }
      if (document.activeElement !== document.body) return
      const { undo, redo, deleteElement, selectedId: sid, elements: els, duplicateElement } = useCanvasStore.getState()
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); if (sid) duplicateElement(sid) }
      if ((e.key === 'Delete' || e.key === 'Backspace') && sid) {
        const active = els.find(x => x.id === sid)
        if (active && !active.isLocked) { e.preventDefault(); deleteElement(sid) }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '=') { e.preventDefault(); setZoom(z => Math.min(3, z + 0.1)) }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); setZoom(z => Math.max(0.2, z - 0.1)) }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); setZoom(1) }
    }
    const ku = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceDown(false) }
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku) }
  }, [])

  /* Mouse events */
  const onElMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    selectElement(id)
    const el = elements.find(x => x.id === id)
    if (!el || el.isLocked) return
    drag.current = { id, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y }
  }, [elements, selectElement])

  const onResizeStart = useCallback((e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation()
    const el = elements.find(x => x.id === id)
    if (!el || el.isLocked) return
    resize.current = { id, handle, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y, origW: el.width, origH: el.height }
  }, [elements])

  const onRotateStart = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const el = elements.find(x => x.id === id)
    if (!el || el.isLocked) return
    const board = document.getElementById('design-canvas')
    if (!board) return
    const rect = board.getBoundingClientRect()
    rotate.current = {
      id,
      centerX: rect.left + (el.x + el.width / 2)  * zoom,
      centerY: rect.top  + (el.y + el.height / 2) * zoom,
    }
  }, [elements, zoom])

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) { setPan({ x: e.clientX - panOrigin.x, y: e.clientY - panOrigin.y }); return }

    if (drag.current) {
      const dx = (e.clientX - drag.current.startX) / zoom
      const dy = (e.clientY - drag.current.startY) / zoom
      const el = elements.find(x => x.id === drag.current!.id)
      if (!el) return

      let nx = drag.current.origX + dx
      let ny = drag.current.origY + dy
      const snap: SnapLines = {}
      const T = 8, hw = canvasWidth / 2, hh = canvasHeight / 2

      if (Math.abs(nx) < T)                          { nx = 0; snap.x = 0 }
      else if (Math.abs(nx + el.width / 2 - hw) < T) { nx = hw - el.width / 2; snap.x = hw }
      else if (Math.abs(nx + el.width - canvasWidth) < T) { nx = canvasWidth - el.width; snap.x = canvasWidth }

      if (Math.abs(ny) < T)                           { ny = 0; snap.y = 0 }
      else if (Math.abs(ny + el.height / 2 - hh) < T) { ny = hh - el.height / 2; snap.y = hh }
      else if (Math.abs(ny + el.height - canvasHeight) < T) { ny = canvasHeight - el.height; snap.y = canvasHeight }

      setSnapLines(Object.keys(snap).length ? snap : null)
      updateElement(drag.current.id, { x: nx, y: ny })
    }

    if (resize.current) {
      const { id, handle, startX, startY, origX, origY, origW, origH } = resize.current
      const dx = (e.clientX - startX) / zoom, dy = (e.clientY - startY) / zoom
      let x = origX, y = origY, w = origW, h = origH
      if (handle.includes('e')) w = Math.max(10, origW + dx)
      if (handle.includes('s')) h = Math.max(10, origH + dy)
      if (handle.includes('w')) { w = Math.max(10, origW - dx); x = origX + origW - w }
      if (handle.includes('n')) { h = Math.max(10, origH - dy); y = origY + origH - h }
      updateElement(id, { x, y, width: w, height: h })
    }

    if (rotate.current) {
      const { id, centerX, centerY } = rotate.current
      let deg = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI + 90
      if (deg < 0) deg += 360
      updateElement(id, { rotation: Math.round(deg) })
    }
  }, [updateElement, zoom, isPanning, panOrigin, elements, canvasWidth, canvasHeight])

  const onMouseUp = useCallback(() => {
    drag.current = resize.current = rotate.current = null
    setIsPanning(false)
    setSnapLines(null)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) }
  }, [onMouseMove, onMouseUp])

  const zoomRef = useRef(zoom)
  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ── Trackpad / Mouse Wheel Panning & Zooming ──
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        // standard trackpad pinch sends deltaY, scale factor is proportional to deltaY
        const zoomFactor = -e.deltaY * 0.01
        setZoom(z => Math.min(3, Math.max(0.2, z + zoomFactor)))
      } else {
        e.preventDefault()
        if (e.shiftKey || e.deltaX !== 0) {
          const dx = e.deltaX !== 0 ? e.deltaX : e.deltaY
          setPan(p => ({ ...p, x: p.x - dx }))
        } else {
          setPan(p => ({ ...p, y: p.y - e.deltaY }))
        }
      }
    }

    // ── Touch Screen Pinch-to-Zoom ──
    let touchStartDist = 0
    let touchStartZoom = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        touchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
        touchStartZoom = zoomRef.current
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        e.preventDefault()
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
        const factor = dist / touchStartDist
        setZoom(Math.min(3, Math.max(0.2, touchStartZoom * factor)))
      }
    }

    const handleTouchEnd = () => {
      touchStartDist = 0
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  const onWorkspaceMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      const clickedOnBoard = (e.target as HTMLElement).id === 'design-canvas' || 
                             (e.target as HTMLElement).closest('#design-canvas') !== null;
      
      const shouldPan = spaceDown || e.button === 1 || !clickedOnBoard;
      
      if (shouldPan) {
        setIsPanning(true)
        setPanOrigin({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        
        // Deselect element on left-click background (outside the board)
        if (e.button === 0 && !spaceDown && !clickedOnBoard) {
          selectElement(null)
        }
      } else {
        // Deselect element if we click on empty area of the board
        if (e.button === 0 && !spaceDown && clickedOnBoard) {
          selectElement(null)
        }
      }
    }
  }

  const sorted    = [...elements].sort((a, b) => a.zIndex - b.zIndex)
  const activeEl  = selectedId ? elements.find(e => e.id === selectedId) : null
  const isGrad    = canvasBg.startsWith('linear-gradient') || canvasBg.startsWith('radial-gradient')

  /* Canvas board background */
  const canvasStyle: React.CSSProperties = {
    position: 'relative', width: canvasWidth, height: canvasHeight, flexShrink: 0,
    borderRadius: 6, overflow: 'hidden',
    boxShadow: '0 8px 48px rgba(0,0,0,0.15), 0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
    pointerEvents: 'auto',
  }
  if (showGrid) {
    canvasStyle.backgroundImage = isGrad
      ? `radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px), ${canvasBg}`
      : 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)'
    if (!isGrad) canvasStyle.backgroundColor = canvasBg
    canvasStyle.backgroundSize = '20px 20px'
  } else {
    if (isGrad) { canvasStyle.backgroundImage = canvasBg }
    else { canvasStyle.backgroundColor = canvasBg }
  }

  return (
    <div
      ref={containerRef}
      className={`workspace-bg flex-1 overflow-hidden select-none relative ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={onWorkspaceMouseDown}
      style={{ position: 'relative', touchAction: 'none' }}
    >
      {/* ── Rulers ── */}
      {showRulers && containerSize.w > 0 && (
        <>
          <Ruler direction="h" length={containerSize.w} zoom={zoom} pan={pan.x} />
          <Ruler direction="v" length={containerSize.h} zoom={zoom} pan={pan.y} />
        </>
      )}

      {/* Ruler corner */}
      {showRulers && (
        <div 
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'absolute', left: 0, top: 0, width: 20, height: 20,
            background: '#F8F9FC', borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB',
            zIndex: 99,
          }} 
        />
      )}

      {/* ── Canvas Viewport ── */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0',
        pointerEvents: 'none', zIndex: 1,
      }}>
        {/* Design Board */}
        <div id="design-canvas" ref={canvasRef} style={canvasStyle} onClick={e => e.stopPropagation()}>
          {sorted.map(el => {
            if (el.isHidden) return null
            const isSel = el.id === selectedId
            const onMD  = (e: React.MouseEvent) => onElMouseDown(e, el.id)
            if (el.type === 'text')  return <TextEl  key={el.id} el={el} isSelected={isSel} onMouseDown={onMD} onDoubleClick={() => {}} />
            if (el.type === 'image') return <ImageEl key={el.id} el={el} isSelected={isSel} onMouseDown={onMD} />
            return <ShapeEl key={el.id} el={el} isSelected={isSel} onMouseDown={onMD} />
          })}

          {/* Violet Snap Lines */}
          {snapLines?.x !== undefined && (
            <div style={{ position: 'absolute', left: snapLines.x, top: 0, bottom: 0, width: 1.5, background: '#7C3AED', opacity: 0.7, zIndex: 99999, pointerEvents: 'none', boxShadow: '0 0 4px rgba(124,58,237,0.5)' }} />
          )}
          {snapLines?.y !== undefined && (
            <div style={{ position: 'absolute', top: snapLines.y, left: 0, right: 0, height: 1.5, background: '#7C3AED', opacity: 0.7, zIndex: 99999, pointerEvents: 'none', boxShadow: '0 0 4px rgba(124,58,237,0.5)' }} />
          )}
        </div>

        {/* Selection Outline */}
        {activeEl && !activeEl.isHidden && (
          <SelectionOutline
            el={activeEl}
            onResizeStart={(e, h) => onResizeStart(e, selectedId!, h)}
            onRotateStart={e => onRotateStart(e, selectedId!)}
          />
        )}
      </div>

      {/* ── Zoom / View Controls ── */}
      <div 
        onMouseDown={e => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 4, zIndex: 50,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 999,
          padding: '5px 10px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        {[
          { label: '−', fn: () => setZoom(z => Math.max(0.2, z - 0.1)), title: 'Zoom Out' },
        ].map(({ label, fn, title }) => (
          <button key={label} onClick={fn} title={title} style={{
            width: 28, height: 28, borderRadius: 999, border: 'none',
            background: 'transparent', cursor: 'pointer', color: '#6B7280',
            fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 120ms ease',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EDE9FF'; (e.currentTarget as HTMLElement).style.color = '#7C3AED' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280' }}
          >
            −
          </button>
        ))}

        <span style={{
          minWidth: 48, textAlign: 'center',
          fontSize: 11, fontWeight: 700, color: '#374151',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {Math.round(zoom * 100)}%
        </span>

        <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} title="Zoom In" style={{
          width: 28, height: 28, borderRadius: 999, border: 'none',
          background: 'transparent', cursor: 'pointer', color: '#6B7280',
          fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 120ms ease',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EDE9FF'; (e.currentTarget as HTMLElement).style.color = '#7C3AED' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280' }}
        >
          +
        </button>

        <div style={{ width: 1, height: 16, background: '#E5E7EB', margin: '0 2px' }} />

        <button onClick={fitToScreen} title="Fit to Screen" style={{
          padding: '4px 10px', borderRadius: 999, border: 'none',
          background: 'transparent', cursor: 'pointer',
          fontSize: 11, fontWeight: 600, color: '#6B7280',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          transition: 'all 120ms ease',
          whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EDE9FF'; (e.currentTarget as HTMLElement).style.color = '#7C3AED' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280' }}
        >
          Fit
        </button>

        <div style={{ width: 1, height: 16, background: '#E5E7EB', margin: '0 2px' }} />

        <button
          onClick={() => setShowGrid(g => !g)}
          title="Toggle Grid"
          style={{
            width: 28, height: 28, borderRadius: 999, border: 'none',
            background: showGrid ? '#EDE9FF' : 'transparent',
            cursor: 'pointer', color: showGrid ? '#7C3AED' : '#6B7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 120ms ease',
          }}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="1" width="14" height="14" rx="1.5" />
            <line x1="1" y1="6" x2="15" y2="6" />
            <line x1="1" y1="10.5" x2="15" y2="10.5" />
            <line x1="6" y1="1" x2="6" y2="15" />
            <line x1="10.5" y1="1" x2="10.5" y2="15" />
          </svg>
        </button>

        <div style={{ width: 1, height: 16, background: '#E5E7EB', margin: '0 2px' }} />

        <button
          onClick={() => setShowRulers(r => !r)}
          title="Toggle Rulers"
          style={{
            width: 28, height: 28, borderRadius: 999, border: 'none',
            background: showRulers ? '#EDE9FF' : 'transparent',
            cursor: 'pointer', color: showRulers ? '#7C3AED' : '#6B7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 120ms ease',
          }}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="14" height="8" rx="1" />
            <line x1="4" y1="4" x2="4" y2="7" />
            <line x1="7" y1="4" x2="7" y2="9" />
            <line x1="10" y1="4" x2="10" y2="7" />
            <line x1="13" y1="4" x2="13" y2="7" />
          </svg>
        </button>
      </div>

      {/* Canvas size badge */}
      <div 
        onMouseDown={e => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 20, right: 16, zIndex: 10,
          fontSize: 10, fontWeight: 500, color: '#9CA3AF',
          fontFamily: "'JetBrains Mono', monospace",
          background: 'rgba(255,255,255,0.8)',
          padding: '3px 8px', borderRadius: 6,
          border: '1px solid #E5E7EB',
          backdropFilter: 'blur(4px)',
        }}
      >
        {canvasWidth} × {canvasHeight}
      </div>
    </div>
  )
}