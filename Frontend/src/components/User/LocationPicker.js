import React, { useState, useRef, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, LocateFixed } from 'lucide-react';

const LocationPicker = ({ apiKey, onLocationSelect }) => {
    const [address, setAddress] = useState('');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [mapError, setMapError] = useState(null);
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const markerRef = useRef(null);

    // Initialize Google Maps
    useEffect(() => {
        const initMap = async () => {
            try {
                const loader = new Loader({
                    apiKey: apiKey,
                    version: 'weekly',  // Ensure that you're using the latest version
                    libraries: ['places'],
                });

                const google = await loader.load();
                const defaultLocation = { lat: 37.7749, lng: -122.4194 };

                googleMapRef.current = new google.maps.Map(mapRef.current, {
                    center: currentLocation || defaultLocation,
                    zoom: 13,
                });

                // Check if AdvancedMarkerElement is available
                const AdvancedMarkerElement = google.maps.marker && google.maps.marker.AdvancedMarkerElement;
                if (!AdvancedMarkerElement) {
                    throw new Error('AdvancedMarkerElement is not available in the current Google Maps version.');
                }

                markerRef.current = new AdvancedMarkerElement({
                    map: googleMapRef.current,
                    position: currentLocation || defaultLocation,
                    title: "Selected Location",
                });
                
                const autocomplete = new google.maps.places.Autocomplete(
                    document.getElementById('address-input'),
                    { types: ['address'] }
                );

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.geometry) {
                        const location = place.geometry.location;
                        const lat = location.lat();
                        const lng = location.lng();

                        googleMapRef.current.setCenter(location);
                        markerRef.current.position = location;

                        setCurrentLocation({ lat: lat, lng: lng });
                        setAddress(place.formatted_address || '');

                        onLocationSelect({
                            lat: lat,
                            lng: lng,
                            address: place.formatted_address,
                        });
                    }
                });
            } catch (error) {
                console.error("Error during Google Maps initialization:", error);
                setMapError('Failed to load Google Maps. Please check your API key and internet connection.');
            }
        };

        initMap();
    }, [apiKey, currentLocation]);

    // Detect current location
    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({
                        lat: latitude,
                        lng: longitude,
                    });

                    try {
                        const loader = new Loader({
                            apiKey: apiKey,
                            version: 'weekly',  // Use the latest version
                            libraries: ['places', 'marker'],  // Include 'marker' library
                        })                        
                        

                        const google = await loader.load();
                        const geocoder = new google.maps.Geocoder();

                        geocoder.geocode(
                            { location: { lat: latitude, lng: longitude } },
                            (results, status) => {
                                if (status === 'OK' && results[0]) {
                                    const formattedAddress = results[0].formatted_address;
                                    setAddress(formattedAddress);
                                    onLocationSelect({
                                        lat: latitude,
                                        lng: longitude,
                                        address: formattedAddress,
                                    });
                                }
                            }
                        );
                    } catch (error) {
                        setMapError('Failed to load Google Maps Geocoder.');
                        console.error(error);
                    }
                },
                (error) => {
                    setMapError('Location detection failed. Please enter address manually.');
                    console.error(error);
                }
            );
        } else {
            setMapError('Geolocation is not supported by this browser.');
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto p-4 bg-white shadow-lg rounded-lg">
            <div className="mb-4">
                <label
                    htmlFor="address-input"
                    className="block text-sm font-medium text-gray-700"
                >
                    Enter Address
                </label>
                <div className="flex items-center">
                    <input
                        id="address-input"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your address"
                        className="flex-grow p-2 border rounded-l-md"
                    />
                    <button
                        onClick={handleDetectLocation}
                        className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
                        title="Detect My Location"
                    >
                        <LocateFixed className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {mapError && (
                <div className="text-red-500 mb-4">
                    {mapError}
                </div>
            )}

            <div
                ref={mapRef}
                className="w-full h-64 rounded-md"
            />

            {currentLocation && (
                <div className="mt-4 text-sm text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                        Latitude: {currentLocation.lat.toFixed(4)},
                        Longitude: {currentLocation.lng.toFixed(4)}
                    </span>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
