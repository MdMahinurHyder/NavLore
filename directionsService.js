const GOOGLE_API_KEY = 'YOUR_API_KEY';

export const fetchRoute = async (origin, destination, alternatives = true) => {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&alternatives=${alternatives}&key=${GOOGLE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === 'OK') {
    // Returns the polyline string for each route found
    return data.routes.map(route => route.overview_polyline.points);
  }
  return [];
};