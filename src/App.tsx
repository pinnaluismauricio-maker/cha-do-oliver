import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Shell from './pages/Shell'
import Presentes from './pages/Presentes'
import Confirmar from './pages/Confirmar'
import Local from './pages/Local'

type Route = 'home' | 'presente' | 'confirmar' | 'local'
const PAGES = ['presente', 'confirmar', 'local']

function parse(): Route {
  const h = window.location.hash.replace('#', '').replace(/^\//, '')
  return PAGES.includes(h) ? (h as Route) : 'home'
}

export default function App() {
  const [route, setRoute] = useState<Route>(parse)

  useEffect(() => {
    const onChange = () => {
      setRoute(parse())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return (
    <>
      <div className="bg" aria-hidden="true" />
      <div className="sheet">
        {route === 'home' && <Home />}
        {route === 'presente' && (
          <Shell route="presente" title="Lista de presentes">
            <Presentes />
          </Shell>
        )}
        {route === 'confirmar' && (
          <Shell route="confirmar" title="Confirmar presença">
            <Confirmar />
          </Shell>
        )}
        {route === 'local' && (
          <Shell route="local" title="Data e local">
            <Local />
          </Shell>
        )}
      </div>
    </>
  )
}