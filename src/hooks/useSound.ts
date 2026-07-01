import { useCallback, useEffect, useRef } from 'react'
import type { DrumType } from '../types'

type SoundKind = DrumType | 'miss' | 'unlock'

export function useSound() {
  const contextRef = useRef<AudioContext | null>(null)

  useEffect(() => () => void contextRef.current?.close(), [])

  return useCallback((type: SoundKind, strong = false) => {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext
    if (!AudioContextClass) return
    const context = contextRef.current ?? new AudioContextClass()
    contextRef.current = context
    void context.resume()
    if (type === 'unlock') return
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = type === 'miss' ? 'sawtooth' : type === 'don' ? 'sine' : 'triangle'
    const startFrequency = type === 'miss' ? 170 : type === 'don' ? 125 : 520
    const endFrequency = type === 'miss' ? 42 : type === 'don' ? 48 : 245
    const duration = type === 'miss' ? 0.28 : 0.12
    oscillator.frequency.setValueAtTime(startFrequency, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, context.currentTime + duration)
    gain.gain.setValueAtTime(type === 'miss' ? 0.3 : strong ? 0.3 : 0.2, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + duration)
  }, [])
}

declare global {
  interface Window { webkitAudioContext?: typeof AudioContext }
}
