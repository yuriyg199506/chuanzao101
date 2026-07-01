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
    const startFrequency = type === 'miss' ? 170 : type === 'don' ? 145 : 680
    const endFrequency = type === 'miss' ? 42 : type === 'don' ? 52 : 260
    const duration = type === 'miss' ? 0.28 : type === 'don' ? 0.105 : 0.085
    const now = context.currentTime
    oscillator.frequency.setValueAtTime(startFrequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration)
    gain.gain.setValueAtTime(type === 'miss' ? 0.28 : strong ? 0.32 : 0.26, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + duration)

    if (type !== 'miss') {
      const noiseLength = Math.max(1, Math.floor(context.sampleRate * 0.045))
      const noiseBuffer = context.createBuffer(1, noiseLength, context.sampleRate)
      const samples = noiseBuffer.getChannelData(0)
      for (let index = 0; index < noiseLength; index += 1) samples[index] = Math.random() * 2 - 1
      const noise = context.createBufferSource()
      const filter = context.createBiquadFilter()
      const transientGain = context.createGain()
      noise.buffer = noiseBuffer
      filter.type = type === 'don' ? 'lowpass' : 'bandpass'
      filter.frequency.value = type === 'don' ? 900 : 2400
      filter.Q.value = type === 'don' ? 0.7 : 1.5
      transientGain.gain.setValueAtTime(strong ? 0.095 : 0.075, now)
      transientGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)
      noise.connect(filter).connect(transientGain).connect(context.destination)
      noise.start(now)
      noise.stop(now + 0.045)
    }
  }, [])
}

declare global {
  interface Window { webkitAudioContext?: typeof AudioContext }
}
