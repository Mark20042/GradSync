import React, { useState } from "react";
import { MapPin, LocateFixed, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const LocationDetectInput = ({
  label,
  id,
  placeholder = "City, Country",
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  name
}) => {
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use OpenStreetMap Nominatim for free reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) throw new Error("Failed to fetch location");
          
          const data = await response.json();
          if (data && data.address) {
            // Try to build a more comprehensive address
            const localArea = data.address.village || data.address.suburb || data.address.neighbourhood || data.address.hamlet || data.address.residential;
            const cityTown = data.address.city || data.address.town || data.address.municipality || data.address.county;
            const stateProv = data.address.state || data.address.region || data.address.province;
            const country = data.address.country;
            
            // Combine and remove any duplicates (sometimes city and state are the same)
            const parts = [localArea, cityTown, stateProv, country].filter((val, index, self) => val && self.indexOf(val) === index);
            const fullAddress = parts.join(", ") || data.display_name;
            
            // Trigger onChange manually
            if (onChange) {
               // Create a synthetic event object
               onChange({ target: { name: name || id, value: fullAddress } });
            }
            toast.success("Location detected!");
          } else {
            toast.error("Could not resolve location address.");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to detect location address");
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error("Location access denied or unavailable.");
        setIsDetecting(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>
        <input
          id={id}
          name={name || id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled || isDetecting}
          className={`w-full pl-10 pr-12 py-2.5 border rounded-lg text-base transition-colors duration-200 disabled:bg-gray-50 disabled:text-gray-500 ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={disabled || isDetecting}
            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Detect Current Location"
          >
            {isDetecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LocateFixed className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center space-x-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : (
        helperText && <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default LocationDetectInput;
