import React, { useState } from "react";
import LocationPicker from "./LocationPicker";

const HomePage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    console.log("Location updated:", location);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome to the User Dashboard</h2>
      <p className="mb-6">This is the home page.</p>

      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-4">Location Picker</h1>
        <LocationPicker
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
