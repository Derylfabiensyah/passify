import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin } from 'lucide-react';
import { formatCleanLocation } from '../../pages/TenantPortal';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function DestinationMap({ destination }) {
  if (!destination) return null;

  // Use destination lat/long if available, fallback to central Indonesia (approximate)
  const defaultLat = -6.200000;
  const defaultLng = 106.816666;
  
  // Try parsing lat/lng from destination or default to Jakarta
  const lat = destination.latitude ? parseFloat(destination.latitude) : defaultLat;
  const lng = destination.longitude ? parseFloat(destination.longitude) : defaultLng;
  const position = [lat, lng];

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-xs border border-white/80 h-full flex flex-col">
      <div className="p-4 sm:p-6 border-b border-black/[0.07] bg-white/40 shrink-0">
        <div className="flex items-center gap-2 text-emerald-800 mb-1">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
          <h2 className="text-lg sm:text-xl font-bold text-[#14281a]">Lokasi Wisata</h2>
        </div>
        <p className="text-xs sm:text-sm font-medium text-[#2f382a] mt-2 leading-relaxed">
          {formatCleanLocation(destination)}
        </p>
      </div>
      <div className="flex-1 min-h-[250px] sm:min-h-[350px] w-full relative z-0">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <strong>{destination.name}</strong><br />
              {formatCleanLocation(destination)}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
