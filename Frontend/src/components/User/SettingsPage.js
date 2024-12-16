import React, { useState } from "react";
import LocationPicker from "./LocationPicker";
import { LoadScript } from '@react-google-maps/api';

const apiKey = 'AIzaSyATwAQvAmj3kqExYa5-SVUAnkIEZlHxR-c';

const darkModeColors = {
  background: "#18283e",
  text: "#e0e0e0",
  border: "#fff",
  icon: "#fff",
};

const lightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#000",
  icon: "#000",
};

const SettingsPage = ({ apiBaseUrl, darkMode }) => {
  const currentColors = darkMode ? darkModeColors : lightModeColors;

  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    console.log("Location updated:", location);
  };

  return (
    <div className="p-4" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      <h2>Settings</h2>
      <h4>Location Picker</h4>
      <div>
        {/* LoadScript is only included here now */}
        <LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
          <LocationPicker onLocationSelect={handleLocationSelect} darkMode={darkMode} apiBaseUrl={apiBaseUrl} />
        </LoadScript>
      </div>

      {selectedLocation && (
        <div className="bg-gray-100 p-4 rounded-md">
          <h2 className="text-lg font-medium">Selected Location:</h2>
          <p>Address: {selectedLocation.address}</p>
          <p>Latitude: {selectedLocation.lat}</p>
          <p>Longitude: {selectedLocation.lng}</p>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
