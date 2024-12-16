import React, { useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import PlacesAutocomplete, { geocodeByPlaceId } from 'react-google-places-autocomplete';

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


const LocationPicker = ({darkMode, onLocationSelect }) => {
  const apiKey = 'AIzaSyATwAQvAmj3kqExYa5-SVUAnkIEZlHxR-c';  // You can also pass this as a prop if needed
  const mapStyles = { height: '80vh', width: '100%' };
  const currentColors = darkMode ? lightModeColors : lightModeColors;


  const defaultCenter = { lat: 22.958746, lng: 72.472967 };
  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [error, setError] = useState('');

  // Handle place selection from the autocomplete input
  const handlePlaceSelect = async (place) => {
    console.log('Selected place:', place); // Check the structure of the place object for debugging
    setSelectedPlace(place);

    try {
      const results = await geocodeByPlaceId(place.value.place_id);
      const location = results[0].geometry.location;
      const lat = location.lat();
      const lng = location.lng();

      setCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
      setError('');
    } catch (err) {
      console.error('Error fetching location:', err); // Log the error for debugging
      setError('Failed to fetch location details.');
    }
  };

  // Handle "Done" button click
  const handleDoneClick = () => {
    if (onLocationSelect) {
      onLocationSelect({
        lat: markerPosition.lat,
        lng: markerPosition.lng,
        address: selectedPlace?.label || '', // If no address is selected, send an empty string
      });
    }
  };

  return (
    <div className="w-full h-screen flex flex-col" style={{backgroundColor:currentColors.background,color:currentColors.text}}>
      {/* Address Input */}
      <div className="p-4 bg-white shadow-md flex items-center justify-center">
        <div className="flex items-center w-full max-w-lg relative">
          <PlacesAutocomplete
            apiKey={apiKey}
            selectProps={{
              placeholder: 'Search for an address...',
              onChange: handlePlaceSelect,
              value: selectedPlace,
            }}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Map Section */}
      <div className="flex-grow">
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={14}
          center={center}
          onClick={(e) =>
            setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() })
          }
          // onLoad={(map) => console.log('Map loaded:', map)} // This ensures that the map is loaded
        >
          <Marker
            position={markerPosition}
            draggable
            onDragEnd={(e) =>
              setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            }
          />
        </GoogleMap>
      </div>

      {/* Done Button */}
      <div className="p-4 bg-white shadow-md flex justify-center">
        <button
          onClick={handleDoneClick}
          className="btn btn-success"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;
