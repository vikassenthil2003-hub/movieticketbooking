import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix for default Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Theatre Pins
const createVerifiedTheatreIcon = () =>
  L.divIcon({
    className: 'custom-cinema-pin-verified',
    html: `<div style="background: linear-gradient(135deg, #10B981, #059669); width: 34px; height: 34px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 16px rgba(16, 185, 129, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">🎬</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });

const createUnverifiedTheatreIcon = () =>
  L.divIcon({
    className: 'custom-cinema-pin-unverified',
    html: `<div style="background: linear-gradient(135deg, #F59E0B, #D97706); width: 32px; height: 32px; border-radius: 50%; border: 2.5px solid #FFFFFF; box-shadow: 0 0 14px rgba(245, 158, 11, 0.7); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">🏛️</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

// Custom User Location Pin
const createUserIcon = () =>
  L.divIcon({
    className: 'custom-user-pin',
    html: `<div style="background: linear-gradient(135deg, #06B6D4, #3B82F6); width: 32px; height: 32px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 16px rgba(6, 182, 212, 0.9); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 15px;">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

// Map View Re-centering component
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const TheatreMap = ({
  theatres = [],
  center = [13.0827, 80.2707],
  userLocation = null,
  userLabel = '',
  zoom = 11,
}) => {
  const mapCenter =
    userLocation && userLocation[0] && userLocation[1]
      ? userLocation
      : theatres.length > 0 && theatres[0]?.location?.coordinates
      ? [theatres[0].location.coordinates[1], theatres[0].location.coordinates[0]]
      : center;

  return (
    <div className="w-full h-[450px] sm:h-[540px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <RecenterMap center={mapCenter} />

        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User's Reference Point Marker */}
        {userLocation && userLocation[0] && userLocation[1] && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup className="cineverse-leaflet-popup">
              <div className="p-1 min-w-[170px] text-slate-900">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                  Your Location
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                  {userLabel || 'Tamil Nadu Reference Point'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  GPS: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Cinema Hall Markers */}
        {theatres.map((th) => {
          if (!th.location?.coordinates || th.location.coordinates.length < 2) return null;
          const lat = th.location.coordinates[1];
          const lng = th.location.coordinates[0];
          const isVerified = th.verificationStatus === 'verified';

          return (
            <Marker
              key={th._id}
              position={[lat, lng]}
              icon={isVerified ? createVerifiedTheatreIcon() : createUnverifiedTheatreIcon()}
            >
              <Popup className="cineverse-leaflet-popup">
                <div className="p-1 min-w-[220px] text-slate-900">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isVerified ? 'Verified Cinema' : 'Imported Record'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {th.district ? `${th.district} Dist` : 'Tamil Nadu'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{th.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {th.address}, {th.city}
                    {th.pinCode ? ` — ${th.pinCode}` : ''}
                  </p>

                  {th.distanceKm !== undefined && (
                    <div className="text-[11px] font-bold text-teal-700 mt-1">
                      {th.distanceKm} km away
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{th.rating || '4.5'}</span>
                    </div>

                    <Link
                      to={`/theatres/${th._id}`}
                      className="text-xs font-bold text-violet-700 hover:text-violet-900 underline"
                    >
                      View Shows &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default TheatreMap;
