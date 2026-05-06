import { useMemo } from 'react'

export type CourseParams = {
  curso: string
  horas: string
  data: string
}

export type ParamsState =
  | { status: 'ok'; params: CourseParams }
  | { status: 'invalid'; missing: string[] }

const REQUIRED_KEYS: (keyof CourseParams)[] = ['curso', 'horas', 'data']

export function useQueryParams(): ParamsState {
  return useMemo(() => {
    const search = new URLSearchParams(window.location.search)
    const missing = REQUIRED_KEYS.filter((k) => !search.get(k)?.trim())

    if (missing.length > 0) {
      return { status: 'invalid', missing }
    }

    return {
      status: 'ok',
      params: {
        curso: search.get('curso')!.trim(),
        horas: search.get('horas')!.trim(),
        data: search.get('data')!.trim(),
      },
    }
  }, [])
}
