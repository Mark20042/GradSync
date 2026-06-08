import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Maximize, Minimize } from "lucide-react";

// Nice custom logo for the marker
const customMarkerIcon = L.divIcon({
  html: `<div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; transform: translateY(-5px);">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" style="width: 100%; height: 100%; filter: drop-shadow(0 8px 8px rgba(0,0,0,0.4));">
             <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
           </svg>
         </div>`,
  className: "custom-leaflet-marker",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.flyTo([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={[position.lat, position.lng]} icon={customMarkerIcon}></Marker>
  );
};

const MapUpdater = ({ isExpanded }) => {
  const map = useMap();
  useEffect(() => {
    // Force Leaflet to update its size when the container expands/shrinks
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [isExpanded, map]);
  return null;
};

const MapLocationInput = ({ position, setPosition, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const defaultCenter = [10.3157, 123.8854]; // Default to Cebu City, Philippines
  const center = position && position.lat && position.lng ? [position.lat, position.lng] : defaultCenter;

  return (
    <div 
      className={
        isExpanded 
          ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8" 
          : `w-full overflow-hidden rounded-xl border border-gray-200 relative z-0 ${className || ''}`
      } 
      style={!isExpanded ? { height: "300px" } : {}}
    >
      <div className={isExpanded ? "w-full h-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl relative border-4 border-white" : "w-full h-full relative"}>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setIsExpanded(!isExpanded); }}
          className="absolute top-4 right-4 z-[400] bg-white p-2.5 rounded-xl shadow-lg hover:bg-gray-50 border border-gray-100 text-gray-700 transition-all hover:scale-105 active:scale-95"
          title={isExpanded ? "Minimize Map" : "Expand Map"}
        >
          {isExpanded ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>

        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater isExpanded={isExpanded} />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapLocationInput;
