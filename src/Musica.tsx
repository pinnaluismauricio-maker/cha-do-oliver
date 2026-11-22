import { useEffect, useRef, useState } from 'react'

const PREF_KEY = 'cha-oliver:musica'

function readOff(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === 'off'
  } catch {
    return false
  }
}
function savePref(v: 'on' | 'off') {
  try {
    localStorage.setItem(PREF_KEY, v)
  } catch {
    /* sem armazenamento local: a escolha só não fica lembrada */
  }
}

export default function Musica() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [off, setOff] = useState(readOff)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = 0.35
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    return () => {
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
    }
  }, [])

  // Os navegadores só deixam tocar depois de um toque do visitante:
  // a música começa no primeiro toque na página, a não ser que ele tenha silenciado antes.
  useEffect(() => {
    if (off) return
    const start = (e: Event) => {
      const target = e.target as Element | null
      if (target?.closest?.('.music-btn')) return
      audioRef.current?.play().catch(() => {})
    }
    window.addEventListener('pointerdown', start, { once: true })
    return () => window.removeEventListener('pointerdown', start)
  }, [off])

  async function toggle() {
    const a = audioRef.current
    if (!a) return
    if (a.paused) {
      setOff(false)
      savePref('on')
      try {
        await a.play()
      } catch {
        /* o navegador recusou: o botão continua disponível */
      }
    } else {
      a.pause()
      setOff(true)
      savePref('off')
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/musica.mp3" loop preload="none" />
      <button
        type="button"
        className="music-btn"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pausar a música' : 'Tocar a música'}
        title={playing ? 'Pausar a música' : 'Tocar a música'}
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18V5l11-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="17" cy="16" r="3" />
          {!playing && <path d="M3 3l18 18" />}
        </svg>
      </button>
    </>
  )
}