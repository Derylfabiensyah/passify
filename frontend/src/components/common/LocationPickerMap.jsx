import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';

// Fix for default Leaflet icon paths in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper component to handle click-to-place and recenter
function MapClickHandler({ position, onChange }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onChange(lat, lng);
    },
  });

  useEffect(() => {
    if (position && Array.isArray(position) && position[0] != null && position[1] != null) {
      map.flyTo(position, map.getZoom(), { animate: true, duration: 0.8 });
    }
  }, [position, map]);

  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  address = '',
  onChange,
  height = '280px',
  readOnly = false,
}) {
  // Default coordinates: Curug Cikanteh / Jawa Barat (-7.1738, 106.5292) or Jakarta
  const defaultLat = -7.1738;
  const defaultLng = 106.5292;

  const currentLat = latitude != null && !isNaN(Number(latitude)) ? Number(latitude) : defaultLat;
  const currentLng = longitude != null && !isNaN(Number(longitude)) ? Number(longitude) : defaultLng;

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const markerRef = useRef(null);

  const handlePositionChange = (lat, lng) => {
    if (readOnly) return;
    const roundedLat = parseFloat(Number(lat).toFixed(6));
    const roundedLng = parseFloat(Number(lng).toFixed(6));

    if (onChange) {
      onChange({
        latitude: roundedLat,
        longitude: roundedLng,
      });
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=id&limit=1`,
        {
          headers: {
            'Accept-Language': 'id,en',
          },
        }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        handlePositionChange(newLat, newLng);

        // If address wasn't filled or is empty, suggest the display name
        if (onChange) {
          onChange({
            latitude: parseFloat(newLat.toFixed(6)),
            longitude: parseFloat(newLng.toFixed(6)),
            suggestedAddress: item.display_name,
          });
        }
      } else {
        setSearchError('Lokasi tidak ditemukan. Coba gunakan nama kota atau kecamatan.');
      }
    } catch (err) {
      setSearchError('Gagal mencari lokasi. Silakan klik langsung pada peta.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi lokasi otomatis.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        handlePositionChange(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setIsLocating(false);
        alert('Gagal mengambil lokasi perangkat: ' + err.message);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2.5">
      {!readOnly && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search bar inside map header */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari lokasi di peta (contoh: Sukabumi, Ciwidey, Lembang)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              className="w-full pl-8 pr-20 py-2 text-xs rounded-xl border border-gray-200 bg-white/90 shadow-2xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-1.5 top-1 px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Cari'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white/90 hover:bg-white border border-gray-200 text-[#14281a] rounded-xl text-xs font-bold shadow-2xs transition-all shrink-0 cursor-pointer"
            title="Gunakan Lokasi GPS Saat Ini"
          >
            {isLocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
            ) : (
              <Navigation className="h-3.5 w-3.5 text-emerald-700" />
            )}
            <span className="hidden sm:inline">Lokasi Saya</span>
          </button>
        </div>
      )}

      {searchError && (
        <p className="text-[11px] text-amber-600 font-medium px-1">{searchError}</p>
      )}

      {/* Leaflet Map Wrapper */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-gray-200/90 shadow-2xs bg-gray-100 isolate"
        style={{ height }}
      >
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            position={[currentLat, currentLng]}
            onChange={handlePositionChange}
          />

          <Marker
            ref={markerRef}
            position={[currentLat, currentLng]}
            draggable={!readOnly}
            eventHandlers={{
              dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                  const latlng = marker.getLatLng();
                  handlePositionChange(latlng.lat, latlng.lng);
                }
              },
            }}
          >
            <Popup>
              <div className="text-xs">
                <strong className="block font-bold text-[#14281a]">Titik Destinasi Wisata</strong>
                <span className="text-gray-600 text-[11px]">
                  {address || `${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`}
                </span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating coordinate pill on map */}
        <div className="absolute bottom-2.5 left-2.5 z-[400] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-black/10 shadow-xs text-[10px] font-bold text-[#14281a] flex items-center gap-1.5 pointer-events-none">
          <MapPin className="h-3 w-3 text-emerald-700" />
          <span>
            {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </span>
        </div>

        {!readOnly && (
          <div className="absolute top-2.5 right-2.5 z-[400] bg-black/65 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] text-white font-medium shadow-xs pointer-events-none">
            💡 Klik atau geser pin untuk atur titik lokasi
          </div>
        )}
      </div>
    </div>
  );
}
