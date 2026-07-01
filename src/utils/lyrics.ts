import type { LyricLine, RhythmNote } from '../types'

const SRT_TIME = /^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})$/

export function srtTimeToMs(value: string): number {
  const match = value.trim().match(SRT_TIME)
  if (!match) throw new Error(`Invalid SRT timestamp: ${value}`)
  const [, hours, minutes, seconds, milliseconds] = match
  return ((Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds)) * 1000) + Number(milliseconds)
}

/** Parse CapCut/WebVTT-like SRT into the millisecond timeline used by the rhythm engine. */
export function parseSRTToLyrics(srtText: string): LyricLine[] {
  const normalized = srtText.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim()
  if (!normalized) return []

  return normalized
    .split(/\n{2,}/)
    .flatMap((block): LyricLine[] => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
      const timingIndex = lines.findIndex((line) => line.includes('-->'))
      if (timingIndex < 0) return []
      const [rawStart, rawEndWithSettings] = lines[timingIndex].split(/\s*-->\s*/)
      const rawEnd = rawEndWithSettings?.split(/\s+/)[0]
      if (!rawStart || !rawEnd) return []

      try {
        const startMs = srtTimeToMs(rawStart)
        const endMs = srtTimeToMs(rawEnd)
        const text = lines.slice(timingIndex + 1).join(' ').replace(/<[^>]+>/g, '').trim()
        return text && endMs > startMs ? [{ startMs, endMs, text }] : []
      } catch {
        return []
      }
    })
    .sort((a, b) => a.startMs - b.startMs)
}

/** Parse standard [mm:ss.xx] LRC, including several timestamps on one line. */
export function parseLRC(lrcText: string): LyricLine[] {
  const entries: Array<Omit<LyricLine, 'endMs'>> = []
  for (const rawLine of lrcText.replace(/\r/g, '').split('\n')) {
    const stamps = [...rawLine.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)]
    if (!stamps.length) continue
    const text = rawLine.replace(/\[[^\]]+\]/g, '').trim()
    if (!text) continue
    for (const stamp of stamps) {
      const fraction = (stamp[3] ?? '0').padEnd(3, '0').slice(0, 3)
      entries.push({ startMs: (Number(stamp[1]) * 60 + Number(stamp[2])) * 1000 + Number(fraction), text })
    }
  }
  entries.sort((a, b) => a.startMs - b.startMs)
  return entries.map((entry, index) => ({
    ...entry,
    endMs: entries[index + 1]?.startMs ?? entry.startMs + 4000,
  }))
}

/**
 * Build a beat-locked chart. Each subtitle start is a fresh phase anchor, so
 * small BPM drift in unstable exports cannot accumulate across the whole song.
 */
export function lyricsToNotes(lyrics: LyricLine[], bpm = 124, difficulty = 3): RhythmNote[] {
  const beatMs = 60000 / bpm
  const notes: RhythmNote[] = []
  const occupied = new Set<number>()
  const stepBeats = difficulty >= 6 ? 0.5 : difficulty === 5 ? 0.75 : difficulty >= 3 ? 1 : difficulty === 2 ? 1.5 : 2
  const maxPerLine = difficulty >= 6 ? 14 : difficulty === 5 ? 11 : difficulty >= 3 ? 8 : difficulty === 2 ? 6 : 4
  lyrics.forEach((line, lineIndex) => {
    const duration = Math.max(beatMs, line.endMs - line.startMs)
    const beatCount = Math.max(1, duration / beatMs)
    let lineNotes = 0
    for (let beat = 0; beat < beatCount && lineNotes < maxPerLine; beat += stepBeats, lineNotes += 1) {
      const timeMs = Math.round(line.startMs + beat * beatMs)
      const timeKey = Math.round(timeMs / 20)
      if (occupied.has(timeKey)) continue
      occupied.add(timeKey)
      notes.push({
        id: notes.length,
        timeMs,
        type: (lineIndex + beat) % 3 === 1 ? 'ka' : 'don',
        judged: false,
      })
    }
  })
  return notes
}
