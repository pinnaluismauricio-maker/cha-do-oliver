export const NAME_KEY = 'cha-oliver:nome'

export const EVENT = {
  weekday: 'Sábado',
  date: '23 de janeiro de 2027',
  shortDate: '23 de janeiro',
  time: '10h',
  place: 'Chácara dos Sonhos',
  address: 'Rua Caiapó, s/n, bairro Marajoara, Japeri/RJ',
}

export const MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('Chácara dos Sonhos, Rua Caiapó, Marajoara, Japeri, RJ')

export function readName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {
    /* sem armazenamento local: o nome só não fica lembrado */
  }
}

export function isHttp(url: string | null): url is string {
  return !!url && /^https?:\/\//i.test(url)
}