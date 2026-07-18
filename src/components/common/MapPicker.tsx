import { useState, useCallback } from 'react'
import Map, { Marker, type MapLayerMouseEvent, type MarkerDragEvent } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { HiLocationMarker } from 'react-icons/hi'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

type LatLng = { lat: number; lng: number }

type MapPickerProps = {
  label?: string
  value?: LatLng
  onChange: (value: LatLng) => void
  height?: number
}

const DEFAULT_CENTER: LatLng = { lat: 30.0444, lng: 31.2357 } // Cairo, Egypt

export default function MapPicker({ label, value, onChange, height = 320 }: MapPickerProps) {
  const center = value ?? DEFAULT_CENTER
  const [viewState, setViewState] = useState({
    latitude: center.lat,
    longitude: center.lng,
    zoom: value ? 12 : 5.5,
  })

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const { lat, lng } = e.lngLat
      onChange({ lat, lng })
    },
    [onChange]
  )

  const handleDragEnd = useCallback(
    (e: MarkerDragEvent) => {
      const { lat, lng } = e.lngLat
      onChange({ lat, lng })
    },
    [onChange]
  )

  if (!MAPBOX_TOKEN) {
    return (
      <div>
        {label && <label className="field-label">{label}</label>}
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-secondary-300 bg-secondary-50 p-8 text-center text-sm text-secondary-700 dark:border-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-300">
          <p>لا يوجد رمز Mapbox (VITE_MAPBOX_TOKEN). أضِف الإحداثيات يدويًا أدناه.</p>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              placeholder="خط العرض"
              value={value?.lat ?? ''}
              onChange={(e) => onChange({ lat: Number(e.target.value), lng: value?.lng ?? 0 })}
              className="w-32 rounded-lg border border-stone-300 px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-800"
            />
            <input
              type="number"
              step="any"
              placeholder="خط الطول"
              value={value?.lng ?? ''}
              onChange={(e) => onChange({ lat: value?.lat ?? 0, lng: Number(e.target.value) })}
              className="w-32 rounded-lg border border-stone-300 px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-800"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      <div
        className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700"
        style={{ height }}
      >
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={handleClick}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: '100%', height: '100%' }}
        >
          {value && (
            <Marker
              longitude={value.lng}
              latitude={value.lat}
              draggable
              onDragEnd={handleDragEnd}
              anchor="bottom"
            >
              <HiLocationMarker className="h-8 w-8 text-primary-600 drop-shadow" />
            </Marker>
          )}
        </Map>
      </div>
      <p className="mt-1 text-xs text-stone-400">
        اضغط على الخريطة لتحديد الموقع، أو اسحب العلامة لتعديله.
      </p>
      {value && (
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400" dir="ltr">
          {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}
