import { useCallback, useEffect, useState } from 'react'
import Map, { Marker, type MapLayerMouseEvent, type MarkerDragEvent } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { HiLocationMarker, HiOutlineSearch } from 'react-icons/hi'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

type LocationValue = { lat: number; lng: number; address?: string }
type SearchResult = {
  id: string
  place_name: string
  center: [number, number]
}

type MapPickerProps = {
  label?: string
  value?: LocationValue
  onChange: (value: LocationValue) => void
  height?: number
}

const DEFAULT_CENTER = { lat: 30.0444, lng: 31.2357 }

export default function MapPicker({ label, value, onChange, height = 320 }: MapPickerProps) {
  const center = value ?? DEFAULT_CENTER
  const [query, setQuery] = useState(value?.address ?? '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [viewState, setViewState] = useState({
    latitude: center.lat,
    longitude: center.lng,
    zoom: value ? 12 : 5.5,
  })

  useEffect(() => {
    if (!MAPBOX_TOKEN || query.trim().length < 2 || query === value?.address) {
      setResults([])
      return
    }
    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setSearching(true)
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query.trim())}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=6&language=ar`
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error('Mapbox search failed')
        const data = await response.json() as { features?: SearchResult[] }
        setResults(data.features ?? [])
      } catch (error) {
        if (!controller.signal.aborted) setResults([])
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 450)
    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [query, value?.address])

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    onChange({ lat, lng, address: value?.address })
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=ar`
      const response = await fetch(url)
      const data = await response.json() as { features?: SearchResult[] }
      const address = data.features?.[0]?.place_name
      if (address) {
        setQuery(address)
        onChange({ lat, lng, address })
      }
    } catch {
      // Coordinates remain selected even if address lookup is unavailable.
    }
  }, [onChange, value?.address])

  const selectResult = (result: SearchResult) => {
    const [lng, lat] = result.center
    setQuery(result.place_name)
    setResults([])
    onChange({ lat, lng, address: result.place_name })
    setViewState({ latitude: lat, longitude: lng, zoom: 14 })
  }

  const handleClick = (event: MapLayerMouseEvent) => {
    void reverseGeocode(event.lngLat.lat, event.lngLat.lng)
  }

  const handleDragEnd = (event: MarkerDragEvent) => {
    void reverseGeocode(event.lngLat.lat, event.lngLat.lng)
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div>
        {label && <label className="field-label">{label}</label>}
        <div className="grid gap-3 rounded-xl border border-dashed border-secondary-300 bg-secondary-50 p-4 dark:border-secondary-800 dark:bg-secondary-900/20 sm:grid-cols-3">
          <input type="text" placeholder="العنوان" value={value?.address ?? ''} onChange={(e) => onChange({ lat: value?.lat ?? 0, lng: value?.lng ?? 0, address: e.target.value })} className="input-field" />
          <input type="number" step="any" placeholder="خط العرض" value={value?.lat ?? ''} onChange={(e) => onChange({ ...value, lat: Number(e.target.value), lng: value?.lng ?? 0 })} className="input-field" />
          <input type="number" step="any" placeholder="خط الطول" value={value?.lng ?? ''} onChange={(e) => onChange({ ...value, lat: value?.lat ?? 0, lng: Number(e.target.value) })} className="input-field" />
        </div>
      </div>
    )
  }

  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      <div className="relative z-10 mb-3">
        <HiOutlineSearch className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-stone-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث عن مدينة، فندق أو عنوان..."
          className="input-field w-full pr-10"
        />
        {searching && <span className="absolute left-3 top-3 text-xs text-stone-400">جاري البحث...</span>}
        {results.length > 0 && (
          <div className="absolute inset-x-0 top-full mt-1 max-h-60 overflow-y-auto rounded-xl border border-stone-200 bg-white p-1 shadow-xl dark:border-stone-700 dark:bg-stone-900">
            {results.map((result) => (
              <button key={result.id} type="button" onClick={() => selectResult(result)} className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-right text-sm hover:bg-primary-50 dark:hover:bg-stone-800">
                <HiLocationMarker className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                <span>{result.place_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700" style={{ height }}>
        <Map {...viewState} onMove={(event) => setViewState(event.viewState)} onClick={handleClick} mapboxAccessToken={MAPBOX_TOKEN} mapStyle="mapbox://styles/mapbox/streets-v12" style={{ width: '100%', height: '100%' }}>
          {value && (
            <Marker longitude={value.lng} latitude={value.lat} draggable onDragEnd={handleDragEnd} anchor="bottom">
              <HiLocationMarker className="h-8 w-8 text-primary-600 drop-shadow" />
            </Marker>
          )}
        </Map>
      </div>
      <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">ابحث واختر نتيجة، أو اضغط على الخريطة، أو اسحب العلامة لتعديل الموقع.</p>
      {value && (
        <div className="mt-2 rounded-lg bg-stone-100 px-3 py-2 text-sm dark:bg-stone-800">
          {value.address && <p className="mb-1 font-medium">{value.address}</p>}
          <p dir="ltr" className="text-left text-xs text-stone-500">Lat: {value.lat.toFixed(6)} — Lng: {value.lng.toFixed(6)}</p>
        </div>
      )}
    </div>
  )
}
