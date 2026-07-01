import { describe, expect, it } from 'vitest'
import { lyricsToNotes, parseLRC, parseSRTToLyrics, srtTimeToMs } from './lyrics'

describe('subtitle parsers', () => {
  it('converts CapCut SRT timestamps to milliseconds', () => {
    const result = parseSRTToLyrics(`1\r\n00:00:01,230 --> 00:00:04,500\r\n旋转 跳跃\r\n我不停歇\r\n\r\n2\r\n00:01:02,005 --> 00:01:04,000\r\n闭嘴惊艳`)
    expect(result).toEqual([
      { startMs: 1230, endMs: 4500, text: '旋转 跳跃 我不停歇' },
      { startMs: 62005, endMs: 64000, text: '闭嘴惊艳' },
    ])
  })

  it('ignores malformed cues without breaking the song', () => {
    expect(parseSRTToLyrics('broken\ncue')).toEqual([])
    expect(srtTimeToMs('01:02:03,004')).toBe(3723004)
  })

  it('parses standard LRC fractions', () => {
    expect(parseLRC('[00:01.00] 前奏\n[00:04.50] 旋转 跳跃')).toEqual([
      { startMs: 1000, endMs: 4500, text: '前奏' },
      { startMs: 4500, endMs: 8500, text: '旋转 跳跃' },
    ])
  })

  it('locks generated notes to whole beats from each subtitle anchor', () => {
    const notes = lyricsToNotes([{ startMs: 1000, endMs: 2600, text: '跟着底鼓走' }], 120)
    expect(notes.map((note) => note.timeMs)).toEqual([1000, 1500, 2000, 2500])
  })

  it('makes later-stage charts clearly denser than the first stage', () => {
    const lyrics = [{ startMs: 1000, endMs: 7000, text: 'difficulty-density-check' }]
    const firstStage = lyricsToNotes(lyrics, 120, 1)
    const finalStage = lyricsToNotes(lyrics, 120, 6)

    expect(firstStage.length).toBeLessThan(finalStage.length)
    expect(finalStage.length).toBeGreaterThanOrEqual(firstStage.length * 3)
  })
})
