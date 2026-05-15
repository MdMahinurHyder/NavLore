// @ts-nocheck
import { useEffect, useRef, useState } from 'react';

export default function MapScreen() {
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const [destination, setDestination] = useState(null); 
  const [routeInfo, setRouteInfo] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  const [routesData, setRoutesData] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  
  const mapInstance = useRef(null);
  const directionsSvc = useRef(null);
  const polylinesRef = useRef([]); 

  const API_KEY = 'provide your api here';

  // Initialize map and handle inputs
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    
    script.onload = () => {
      if (!mapRef.current) return;

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 23.8103, lng: 90.4125 }, 
        zoom: 13,
        disableDefaultUI: true 
      });

      directionsSvc.current = new window.google.maps.DirectionsService();

      if (searchInputRef.current) {
        const searchBox = new window.google.maps.places.SearchBox(searchInputRef.current);
        mapInstance.current.controls[window.google.maps.ControlPosition.TOP_CENTER].push(searchInputRef.current);

        searchBox.addListener("places_changed", () => {
          const places = searchBox.getPlaces();
          if (places.length === 0) return;
          const place = places[0];
          
          setDestination({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng(), name: place.name });
          clearRoutes();
          mapInstance.current.setCenter(place.geometry.location);
          mapInstance.current.setZoom(15);
        });
      }

      if (navigator.geolocation) {
        navigator.geolocation.watchPosition((pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }, (err) => console.warn(err), { enableHighAccuracy: true });
      }

      mapInstance.current.addListener("click", (e) => {
        if (e.placeId) e.stop(); 
        setDestination({ lat: e.latLng.lat(), lng: e.latLng.lng(), name: "Dropped Pin" });
        clearRoutes();
      });
    };
    
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const clearRoutes = () => {
    setRouteInfo(null);
    setRoutesData(null);
    polylinesRef.current.forEach(line => line.setMap(null));
    polylinesRef.current = [];
  };

  const handleClearPin = () => {
      setDestination(null);
      clearRoutes();
      if(searchInputRef.current) searchInputRef.current.value = "";
  };

  const handleGetDirections = () => {
    if (!userLocation || !directionsSvc.current) return;
    
    directionsSvc.current.route({
      origin: userLocation,
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: 'DRIVING',
      provideRouteAlternatives: true 
    }, (result, status) => {
      if (status === 'OK') {
        clearRoutes();
        setRoutesData(result.routes);
        setSelectedRouteIndex(0); 
      }
    });
  };

  const cycleRoute = () => {
    if (routesData && routesData.length > 1) {
      setSelectedRouteIndex((prevIndex) => (prevIndex + 1) % routesData.length);
    }
  };

  // Render routes when route data updates
  useEffect(() => {
    if (!routesData || !mapInstance.current) return;

    polylinesRef.current.forEach(line => line.setMap(null));
    polylinesRef.current = [];

    routesData.forEach((route, index) => {
      const isSelected = index === selectedRouteIndex;
      const polyline = new window.google.maps.Polyline({
        path: route.overview_path,
        strokeColor: isSelected ? '#4A90E2' : '#999999', 
        strokeWidth: isSelected ? 6 : 4,
        zIndex: isSelected ? 2 : 1,
        map: mapInstance.current,
        clickable: false
      });

      polylinesRef.current.push(polyline);
    });

    setRouteInfo({
      duration: routesData[selectedRouteIndex].legs[0].duration.text,
      distance: routesData[selectedRouteIndex].legs[0].distance.text
    });

  }, [routesData, selectedRouteIndex]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <input 
        ref={searchInputRef} 
        type="text" 
        placeholder="Search for a place..." 
        style={webSearchStyle} 
      />

      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {destination && (
        <div style={webCardStyle}>
          <button onClick={handleClearPin} style={webCloseBtnStyle}>✕</button>

          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{destination.name}</div>
          {!routeInfo ? (
             <button onClick={handleGetDirections} style={webBtnStyle}>Get Directions</button>
          ) : (
             <div style={{ backgroundColor: '#2A2A2A', padding: '10px', borderRadius: '8px' }}>
                <div style={{ color: '#4CAF50', fontSize: '22px', fontWeight: 'bold' }}>{routeInfo.duration}</div>
                <div style={{ color: '#A0A0A0', fontSize: '14px', marginTop: '4px' }}>({routeInfo.distance})</div>
                
                {routesData && routesData.length > 1 && (
                  <button onClick={cycleRoute} style={webSwitchRouteBtnStyle}>
                    ↹ Switch Route ({selectedRouteIndex + 1}/{routesData.length})
                  </button>
                )}
                
                <button onClick={clearRoutes} style={{...webBtnStyle, backgroundColor: '#E53935', marginTop: '10px', padding: '8px', fontSize: '14px'}}>Clear Route</button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

const webSearchStyle = { marginTop: '20px', width: '300px', padding: '12px 15px', borderRadius: '8px', border: 'none', fontSize: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', outline: 'none' };
const webCardStyle = { position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1E1E1E', color: '#FFF', padding: '20px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', textAlign: 'center', border: '1px solid #333', minWidth: '280px', zIndex: 100 };
const webBtnStyle = { backgroundColor: '#4A90E2', color: '#FFF', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%' };
const webCloseBtnStyle = { position: 'absolute', top: '10px', right: '10px', background: 'transparent', color: '#FFF', border: 'none', fontSize: '18px', cursor: 'pointer' };
const webSwitchRouteBtnStyle = { backgroundColor: '#4A90E2', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };