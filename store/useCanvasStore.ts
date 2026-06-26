import { create } from 'zustand'

export type ElementType = 'text' | 'rect' | 'circle' | 'triangle' | 'image' | 'star' | 'polygon' | 'line' | 'diamond'

export interface CanvasElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  content?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textAlign?: string
  color?: string
  fillColor?: string
  borderColor?: string
  borderWidth?: number
  opacity?: number
  src?: string
  zIndex: number
  
  // Custom additions for premium editor
  borderRadius?: number
  rotation?: number // in degrees
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  letterSpacing?: number
  lineHeight?: number
  isLocked?: boolean
  isHidden?: boolean
  gradientType?: 'none' | 'linear' | 'radial'
  gradientColor1?: string
  gradientColor2?: string
  gradientAngle?: number
}

interface CanvasState {
  elements: CanvasElement[]
  selectedId: string | null
  history: CanvasElement[][]
  future: CanvasElement[][]
  canvasBg: string
  canvasWidth: number
  canvasHeight: number
  addElement: (el: CanvasElement) => void
  updateElement: (id: string, changes: Partial<CanvasElement>) => void
  deleteElement: (id: string) => void
  selectElement: (id: string | null) => void
  undo: () => void
  redo: () => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  duplicateElement: (id: string) => void
  toggleLock: (id: string) => void
  toggleVisibility: (id: string) => void
  setCanvasBg: (color: string) => void
  setCanvasSize: (width: number, height: number) => void
  clearCanvas: () => void
  loadDesign: (elements: CanvasElement[], canvasBg: string) => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  elements: [],
  selectedId: null,
  history: [],
  future: [],
  canvasBg: '#ffffff',
  canvasWidth: 800,
  canvasHeight: 600,

  addElement: (el) => {
    const { elements, history } = get()
    set({ history: [...history, elements], future: [], elements: [...elements, el], selectedId: el.id })
  },

  updateElement: (id, changes) => {
    const { elements, history } = get()
    // Avoid adding history for cursor-locked or fast moves if needed, but for simplicity we push history
    set({ history: [...history, elements], future: [], elements: elements.map((el) => (el.id === id ? { ...el, ...changes } : el)) })
  },

  deleteElement: (id) => {
    const { elements, history } = get()
    set({ history: [...history, elements], future: [], elements: elements.filter((el) => el.id !== id), selectedId: null })
  },

  selectElement: (id) => set({ selectedId: id }),

  undo: () => {
    const { history, elements, future } = get()
    if (!history.length) return
    const prev = history[history.length - 1]
    set({ elements: prev, history: history.slice(0, -1), future: [elements, ...future], selectedId: null })
  },

  redo: () => {
    const { future, elements, history } = get()
    if (!future.length) return
    set({ elements: future[0], future: future.slice(1), history: [...history, elements], selectedId: null })
  },

  bringForward: (id) => {
    const { elements } = get()
    set({ elements: elements.map((e) => (e.id === id ? { ...e, zIndex: e.zIndex + 1 } : e)) })
  },

  sendBackward: (id) => {
    const { elements } = get()
    set({ elements: elements.map((e) => (e.id === id ? { ...e, zIndex: Math.max(0, e.zIndex - 1) } : e)) })
  },

  bringToFront: (id) => {
    const { elements } = get()
    const maxZ = elements.reduce((max, el) => Math.max(max, el.zIndex), 0)
    set({ elements: elements.map((e) => (e.id === id ? { ...e, zIndex: maxZ + 1 } : e)) })
  },

  sendToBack: (id) => {
    const { elements } = get()
    const minZ = elements.reduce((min, el) => Math.min(min, el.zIndex), 0)
    set({ elements: elements.map((e) => (e.id === id ? { ...e, zIndex: Math.max(0, minZ - 1) } : e)) })
  },

  duplicateElement: (id) => {
    const { elements, history } = get()
    const el = elements.find((e) => e.id === id)
    if (!el) return
    const clone = {
      ...el,
      id: Math.random().toString(36).substring(2, 9),
      x: el.x + 20,
      y: el.y + 20,
      zIndex: Date.now(),
    }
    set({
      history: [...history, elements],
      future: [],
      elements: [...elements, clone],
      selectedId: clone.id
    })
  },

  toggleLock: (id) => {
    const { elements } = get()
    set({ elements: elements.map((e) => (e.id === id ? { ...e, isLocked: !e.isLocked } : e)) })
  },

  toggleVisibility: (id) => {
    const { elements } = get()
    set({ elements: elements.map((e) => (e.id === id ? { ...e, isHidden: !e.isHidden } : e)) })
  },

  setCanvasBg: (color) => set({ canvasBg: color }),

  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),

  clearCanvas: () => {
    const { elements, history } = get()
    set({ history: [...history, elements], future: [], elements: [], selectedId: null })
  },

  loadDesign: (elements, canvasBg) => {
    const { elements: currentElements } = get()
    set({
      history: [...get().history, currentElements],
      future: [],
      elements,
      canvasBg,
      selectedId: null,
    })
  },
}))
