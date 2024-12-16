import React, { useState } from "react";
import LocationPicker from "./LocationPicker";
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
const HomePage = ({ apiBaseUrl ,darkMode}) => {
  const currentColors = darkMode ? darkModeColors : lightModeColors;
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    console.log("Location updated:", location);
  };

  return (
    <div className="p-5" style={{backgroundColor:currentColors.background,color:currentColors.text}}>
      <h2 className="text-2xl font-bold mb-4">Welcome to the User Dashboard</h2>

      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-4">Location Picker</h1>
        <LocationPicker
          apiBaseUrl={apiBaseUrl}
          apiKey="AIzaSyATwAQvAmj3kqExYa5-SVUAnkIEZlHxR-c"
          onLocationSelect={handleLocationSelect}
        />
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

export default HomePage;
