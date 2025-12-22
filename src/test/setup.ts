import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup após cada teste
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})

// Mock das APIs do navegador
class MockAudioContext {
  destination = {}
  currentTime = 0
  state = 'running'
  
  createOscillator() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
      type: 'sine',
    }
  }
  
  createGain() {
    return {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }
  }
  
  async resume() {
    return Promise.resolve()
  }
  
  async close() {
    return Promise.resolve()
  }
}

global.AudioContext = MockAudioContext as any
;(window as any).webkitAudioContext = MockAudioContext

// Mock da Notification API
class MockNotification {
  title: string
  body?: string
  icon?: string
  onclick: (() => void) | null = null
  
  constructor(title: string, options?: any) {
    this.title = title
    if (options) {
      this.body = options.body
      this.icon = options.icon
    }
  }
  
  close() {}
  
  static permission: NotificationPermission = 'granted'
  
  static async requestPermission(): Promise<NotificationPermission> {
    return 'granted'
  }
}

global.Notification = MockNotification as any

// Mock da Wake Lock API
Object.defineProperty(navigator, 'wakeLock', {
  writable: true,
  value: {
    request: vi.fn().mockResolvedValue({
      release: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      type: 'screen',
      released: false,
    }),
  },
})

// Mock da Vibration API
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: vi.fn(),
})

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

