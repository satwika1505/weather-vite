export const getWeather = async (city) => {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no&alerts=no`;
  
  const res = await fetch(url);
  return res.json();
};
