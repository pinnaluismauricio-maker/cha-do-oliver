import type { ReactNode } from 'react'

const PHASES = [
  { key: 'presente', n: 1, label: 'Presente' },
  { key: 'confirmar', n: 2, label: 'Confirmar' },
  { key: 'local', n: 3, label: 'Local' },
] as const

type Props = {
  route: (typeof PHASES)[number]['key']
  title: string
  children: ReactNode
}

export default function Shell({ route, title, children }: Props) {
  const idx = PHASES.findIndex((p) => p.key === route)
  const next = PHASES[idx + 1]

  return (
    <div className="page">
      <div className="awning slim" aria-hidden="true" />
      <header className="topbar">
        <a className="back" href="#">
          ← Início
        </a>
        <ol className="stepper">
          {PHASES.map((p) => (
            <li key={p.key}>
              <a href={`#${p.key}`} className={p.key === route ? 'on' : ''} aria-current={p.key === route ? 'page' : undefined}>
                <b>{p.n}</b> {p.label}
              </a>
            </li>
          ))}
        </ol>
      </header>

      <h1 className="ptitle">{title}</h1>
      {children}

      <footer className="pager">
        {next ? (
          <a className="btn" href={`#${next.key}`}>
            Próxima fase: {next.label} →
          </a>
        ) : (
          <a className="btn" href="#">
            Voltar ao início
          </a>
        )}
      </footer>
    </div>
  )
}