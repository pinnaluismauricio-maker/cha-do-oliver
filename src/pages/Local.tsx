import { useState } from 'react'
import { EVENT, MAP_URL } from '../lib'

export default function Local() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${EVENT.place}, ${EVENT.address}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <span className="label">Quando</span>
        <p className="big">
          {EVENT.weekday}, {EVENT.date}
        </p>
        <p>A partir das {EVENT.time}</p>
      </section>

      <section className="card">
        <span className="label">Onde</span>
        <p className="big">{EVENT.place}</p>
        <p>{EVENT.address}</p>
        <div className="row">
          <a className="btn" href={MAP_URL} target="_blank" rel="noopener noreferrer">
            Abrir no mapa ↗
          </a>
          <button type="button" className="ghost" onClick={copy}>
            {copied ? 'Endereço copiado' : 'Copiar endereço'}
          </button>
        </div>
      </section>
    </div>
  )
}