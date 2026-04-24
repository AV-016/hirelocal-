'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { locationApi } from '@/lib/api'

// Fix for leaflet default marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapPickerProps {
  onLocationSelect: (pincode: string, address: string) => void
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Use a default center (e.g., Delhi)
  const defaultCenter: [number, number] = [28.6139, 77.209]

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng)
      },
    })

    return position === null ? null : (
      <Marker position={position} />
    )
  }

  useEffect(() => {
    // Try to get user's current location
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition(new L.LatLng(pos.coords.latitude, pos.coords.longitude))
        },
        () => {
          // If permission denied or error, stay at default
        }
      )
    }
  }, [])

  useEffect(() => {
    if (!position) return

    async function fetchAddress() {
      if (!position) return
      try {
        const data = await locationApi.reverse(position.lat, position.lng)
        const pincode = data.address?.postcode || ''
        const address = data.display_name || ''
        onLocationSelect(pincode, address)
      } catch (err) {
        console.error('Reverse geocoding failed:', err)
      }
    }

    fetchAddress()
  }, [position, onLocationSelect])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return

    try {
      setIsSearching(true)
      const data = await locationApi.search(searchQuery)

      if (data && data.length > 0) {
        const first = data[0]
        const newPos = new L.LatLng(parseFloat(first.lat), parseFloat(first.lon))
        setPosition(newPos)
        
        // Focus the map on the search result
        // Note: This requires the map instance, which we can get via useMapEvents or a ref
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for your area..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </form>

      <div className="h-[300px] w-full overflow-hidden rounded-lg border border-border">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Click on the map to pin your exact location.
      </p>
    </div>
  )
}
