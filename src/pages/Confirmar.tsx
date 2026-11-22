import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../supabase'
import { readName, saveName } from '../lib'

export default function Confirmar() {
  const [name, setName] = useState(readName)
  const [guests, setGuests] = useState(1)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (!n) {
      setError('Escreva seu nome.')
      return
    }
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.rpc('confirm_presence', { p_name: n, p_guests: guests })
    setBusy(false)
    if (err) {
      setError('Não foi possível confirmar agora. Tente novamente em instantes.')
      return
    }
    saveName(n)
    setDone(n)
  }

  if (done) {
    return (
      <section className="card center">
        <p className="big">Presença confirmada!</p>
        <p>
          Obrigado, {done}. A gente te espera lá.
        </p>
        <button type="button" className="ghost" onClick={() => setDone(null)}>
          Confirmar outra pessoa ou família
        </button>
      </section>
    )
  }

  return (
    <form className="card" onSubmit={submit}>
      <label htmlFor="rsvpName">Seu nome</label>
      <input
        id="rsvpName"
        type="text"
        maxLength={60}
        autoComplete="name"
        placeholder="Nome completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="rsvpGuests">Quantas pessoas vão, contando com você?</label>
      <select id="rsvpGuests" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n} {n === 1 ? 'pessoa' : 'pessoas'}
          </option>
        ))}
      </select>

      {error && <p className="alert">{error}</p>}
      <button type="submit" disabled={busy}>
        {busy ? 'Enviando…' : 'Confirmar presença'}
      </button>
    </form>
  )
}