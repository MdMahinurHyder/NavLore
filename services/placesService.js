// services/placesService.js

const GOOGLE_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

export const fetchPlaceData = async (placeName, lat, lng) => {
  try {
    // Step 1: Text Search to get the place_id
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName)}&location=${lat},${lng}&key=${AIzaSyC5kjLTppCRCgdfJBPvlAnboDsEE7ZN1Vw}`;
    const searchRes = await fetch(searchUrl).then(r => r.json());
    
    if (searchRes.results && searchRes.results.length > 0) {
      const placeId = searchRes.results[0].place_id;
      
      // Step 2: Get Details and Reviews using the retrieved place_id
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${AIzaSyC5kjLTppCRCgdfJBPvlAnboDsEE7ZN1Vw}`;
      const detailsRes = await fetch(detailsUrl).then(r => r.json());
      
      return detailsRes.result; // Returns {name, rating, reviews}
    }
  } catch (error) {
    console.error("Error fetching place data:", error);
  }
  return null;
};