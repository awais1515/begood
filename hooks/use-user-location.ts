
"use client";

import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      // Don't set an error for permission denied, as it's a common user choice.
      // The feature will just gracefully not appear.
      if (error.code !== error.PERMISSION_DENIED) {
        setError('Unable to get your location. Distance features may be unavailable.');
      }
      console.warn(`Geolocation error: ${error.code}`);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 600000 // Can use a cached position up to 10 minutes old
    });
  }, []);

  return { userLocation, error };
}
