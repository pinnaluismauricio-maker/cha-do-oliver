
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../supabase'
import { isHttp, readName, saveName } from '../lib'

type Item = {
  id: string
  name: string
  category: string
  link: string | null
  max_claims: number | null
  sort: number
}

type Claim = {
  id: string
  item_id: string
  guest_name: string
  created_at: string
}

type Mine = {
  claimId: string
  token: string
  itemId: string
}

const MINE_KEY = 'cha-oliver:minhas'

function readMine(): Mine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(MINE_KEY) ?? '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function saveMine(m: Mine[]) {
  try {
    localStorage.setItem(MINE_KEY, JSON.stringify(m))
  } catch {
    /* Sem armazenamento local, o botão Desfazer pode não aparecer */
  }
}

export default function Presentes() {
  const [items, setItems] = useState<Item[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(readName)
  const [mine, setMine] = useState<Mine[]>(readMine)
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const nameRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const showToast = (text: string) => {
    setToast(text)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }

  const load = useCallback(async () => {
    const [i, c] = await Promise.all([
      supabase.from('items').select('*').order('sort').order('name'),
      supabase.from('claims_public').select('*').order('created_at'),
    ])

    if (i.error || c.error) {
      setError(
        'Não foi possível carregar a lista agora. Tente de novo em instantes.',
      )
      setLoading(false)
      return
    }

    setError(null)
    setItems(i.data as Item[])
    setClaims(c.data as Claim[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()

    const timer = window.setInterval(load, 20000)

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        load()
      }
    }

    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load])

  const claimsByItem = useMemo(() => {
    const map = new Map<string, Claim[]>()

    for (const c of claims) {
      const list = map.get(c.item_id) ?? []
      list.push(c)
      map.set(c.item_id, list)
    }

    return map
  }, [claims])

  const mineByClaim = useMemo(
    () => new Map(mine.map((m) => [m.claimId, m])),
    [mine],
  )

  const groups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, Item[]>()

    for (const it of items) {
      if (!map.has(it.category)) {
        map.set(it.category, [])
        order.push(it.category)
      }

      map.get(it.category)!.push(it)
    }

    return order.map((category) => ({
      category,
      items: map.get(category)!,
    }))
  }, [items])

  // A barra de progresso conta somente os itens com limite.
  // Os mimos são ilimitados.
  const limited = items.filter((it) => it.max_claims !== null)

  const totalSlots = limited.reduce(
    (sum, it) => sum + (it.max_claims ?? 0),
    0,
  )

  const taken = limited.reduce(
    (sum, it) => sum + (claimsByItem.get(it.id)?.length ?? 0),
    0,
  )

  const pct = totalSlots
    ? Math.round((taken / totalSlots) * 100)
    : 0

  async function claim(item: Item) {
    const guest = name.trim()

    if (!guest) {
      showToast('Escreva seu nome primeiro.')
      nameRef.current?.focus()
      return
    }

    saveName(guest)
    setBusy(item.id)

    const { data, error: err } = await supabase.rpc('claim_item', {
      p_item_id: item.id,
      p_name: guest,
    })

    setBusy(null)

    if (err) {
      showToast(
        err.message.includes('item_esgotado')
          ? 'Esse item acabou de esgotar. Escolha outro, por favor.'
          : 'Não foi possível salvar sua escolha. Tente novamente.',
      )

      load()
      return
    }

    const row = Array.isArray(data) ? data[0] : data

    if (row) {
      const next = [
        ...mine,
        {
          claimId: row.claim_id,
          token: row.claim_token,
          itemId: item.id,
        },
      ]

      setMine(next)
      saveMine(next)
    }

    showToast(`Anotado! Obrigado, ${guest}.`)
    load()
  }

  async function release(m: Mine) {
    const { data, error: err } = await supabase.rpc('release_claim', {
      p_claim_id: m.claimId,
      p_token: m.token,
    })

    if (err) {
      showToast('Não foi possível desfazer. Tente novamente.')
      return
    }

    const next = mine.filter((x) => x.claimId !== m.claimId)

    setMine(next)
    saveMine(next)

    showToast(
      data
        ? 'Escolha desfeita.'
        : 'Essa escolha já tinha sido removida.',
    )

    load()
  }

  return (
    <div className="stack">
      <p className="msg">
        Escolha um presente da lista e deixe seu nome. Mais de uma pessoa
        pode escolher o mesmo mimo, e as fraldas têm um limite de pacotes
        por tamanho.
      </p>

      {totalSlots > 0 && (
        <div className="progress">
          <div
            className="bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <i style={{ width: `${pct}%` }} />
          </div>

          <p>
            <span className="count">
              {taken} de {totalSlots}
            </span>{' '}
            <span className="note">
              pacotes de fralda já escolhidos
            </span>
          </p>
        </div>
      )}

      <section className="card">
        <label htmlFor="guestName">Seu nome</label>

        <input
          id="guestName"
          ref={nameRef}
          type="text"
          maxLength={60}
          autoComplete="name"
          placeholder="Como você quer aparecer na lista"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <p className="note">
          Escreva o nome uma vez e toque em “Vou levar” no que você escolher.
        </p>
      </section>

      {error && <p className="alert">{error}</p>}

      {loading && !error && (
        <p className="note">Carregando a lista…</p>
      )}

      {groups.map((g) => (
        <section className="cat" key={g.category}>
          <h2>{g.category}</h2>

          <ul className="items">
            {g.items.map((it) => {
              const list = claimsByItem.get(it.id) ?? []
              const limit = it.max_claims

              const left =
                limit === null
                  ? Infinity
                  : limit - list.length

              // Itens ilimitados nunca ficam esgotados.
              const full = limit !== null && left <= 0

              const unit = /fralda/i.test(it.name)
                ? 'pacotes'
                : 'unidades'

              return (
                <li
                  key={it.id}
                  className={`item${full ? ' taken' : ''}`}
                >
                  <div className="info">
                    <span className="name">{it.name}</span>

                    {limit !== null && limit > 1 && (
                      <span className="by">
                        {full
                          ? `Todos os ${unit} foram escolhidos`
                          : `${left} de ${limit} ${unit} disponíveis`}
                      </span>
                    )}

                    {isHttp(it.link) && (
                      <a
                        className="lnk"
                        href={it.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Onde comprar ↗
                      </a>
                    )}

                    {list.length > 0 && (
                      <ul className="chips">
                        {list.map((c) => {
                          const m = mineByClaim.get(c.id)

                          return (
                            <li
                              key={c.id}
                              className={`chip${m ? ' mine' : ''}`}
                            >
                              <span>{c.guest_name}</span>

                              {m && (
                                <button
                                  type="button"
                                  className="undo"
                                  onClick={() => release(m)}
                                >
                                  Desfazer
                                </button>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>

                  {!full && (
                    <button
                      type="button"
                      disabled={busy === it.id}
                      onClick={() => claim(it)}
                    >
                      {busy === it.id ? 'Salvando…' : 'Vou levar'}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {!loading && !error && groups.length === 0 && (
        <p className="empty">
          A lista ainda está sendo montada. Volte em instantes.
        </p>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
