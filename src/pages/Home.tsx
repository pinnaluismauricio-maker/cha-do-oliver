import { CheckIcon, GiftIcon, PinIcon } from '../Icons'
import { EVENT } from '../lib'

export default function Home() {
  return (
    <div className="home">
      <div className="photo">
        <div className="awning" aria-hidden="true" />
        <img src="/fundo.jpg" alt="Família no chá revelação do Oliver" />
        <div className="fade" aria-hidden="true" />
      </div>

      <section className="intro">
        <p className="kicker">Chá de bebê</p>
        <h1 className="script">Oliver</h1>
        <p className="invite">
          Estamos contando os dias para a chegada do Oliver. Separamos esse momento para celebrar com as pessoas
          que a gente ama, e você é uma delas!
        </p>
        <p className="date">
          {EVENT.shortDate} às {EVENT.time}
        </p>
      </section>

      <nav className="phases" aria-label="Fases do convite">
        <a className="phase" href="#presente">
          <span className="disc">
            <GiftIcon />
          </span>
          <span className="plabel">Presente</span>
          <span className="psub">Fase 1</span>
        </a>
        <a className="phase" href="#confirmar">
          <span className="disc">
            <CheckIcon />
          </span>
          <span className="plabel">Confirmar</span>
          <span className="psub">Fase 2</span>
        </a>
        <a className="phase" href="#local">
          <span className="disc">
            <PinIcon />
          </span>
          <span className="plabel">Local</span>
          <span className="psub">Fase 3</span>
        </a>
      </nav>

      <p className="hint">Toque em uma fase para continuar.</p>
    </div>
  )
}