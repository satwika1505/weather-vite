import './style.css';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';

document.addEventListener("DOMContentLoaded", () => {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  document.body.insertAdjacentHTML("afterbegin", renderHeader());
  document.body.insertAdjacentHTML("beforeend", renderFooter());

  const cityInput = document.getElementById("cityInput");
  const getWeatherBtn = document.getElementById("getWeatherBtn");
  const weatherInfo = document.querySelector(".weather-info");
  const spinner = document.getElementById("spinner");
  const forecastCarousel = document.getElementById("forecast-carousel");
  const forecastTitle = document.getElementById("forecast-title");
  const hourlyForecastSection = document.getElementById("hourly-forecast");
  const hourlyContainer = document.getElementById("hourly-container");
  const backgroundContainer = document.getElementById("weather-background");
  const themeBtn = document.getElementById("toggle-theme");

  // Dark Theme Toggle
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    themeBtn.textContent = document.body.classList.contains("dark-theme")
      ? "☀️ Toggle Theme"
      : "🌙 Toggle Theme";
    backgroundContainer.style.filter = document.body.classList.contains("dark-theme")
      ? "brightness(0.7)"
      : "brightness(1)";
  });

  // Get Weather Button Click
   getWeatherBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  const allowedPattern = /^[a-zA-Z\s]{3,30}$/;
  const bannedWords = [
    "mars", "jupiter", "earth", "milky way", "galaxy", "universe",
    "asia", "africa", "europe", "antarctica", "australia", "usa",
    "north america", "south america", "world", "cosmos", "solar system",
    "planet", "continent", "country", "state", "beach", "desert", "forest", "ocean", "sea", "mountain", "island", "valley", "city", "river", "lake"
  ];

  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  if (!allowedPattern.test(city)) {
    alert("Please enter a valid city name only (no numbers or special characters).");
    return;
  }

  if (bannedWords.includes(city.toLowerCase())) {
    alert("Please enter a real city or town name — not a general place.");
    return;
  }

  getWeather(city);
});

  // Enter Key Press
  cityInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") getWeatherBtn.click();
  });

  async function getWeather(city) {
    spinner.style.display = "block";
    [weatherInfo, forecastTitle, forecastCarousel, hourlyForecastSection].forEach(el => el.style.display = "none");

    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no&alerts=no`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("City not found.");
      const data = await response.json();
      spinner.style.display = "none";
      [weatherInfo, forecastTitle, forecastCarousel].forEach(el => el.style.display = "block");
      forecastCarousel.style.display = "flex";

      displayCurrentWeather(data);
      displayForecast(data);
      setWeatherBackground(data.current.condition.text);
      updateGreeting();
      hourlyForecastSection.style.display = "none";
    } catch (error) {
      spinner.style.display = "none";
      alert(error.message);
    }
  }

  function displayCurrentWeather({ location, current }) {
    document.getElementById("temp").textContent = `${current.temp_c}°C`;
    document.getElementById("condition").textContent = current.condition.text;
    document.getElementById("emoji").textContent = getWeatherEmoji(current.condition.text);
    document.getElementById("humidity").textContent = `Humidity: ${current.humidity}%`;
    document.getElementById("wind").textContent = `Wind: ${current.wind_kph} kph`;
    document.getElementById("latitude").textContent = `Latitude: ${location.lat}`;
    document.getElementById("longitude").textContent = `Longitude: ${location.lon}`;
    document.getElementById("emoji").style.display = "block";
  }

  function displayForecast({ forecast }) {
    for (let i = 0; i < 3; i++) {
      const day = forecast.forecastday[i];
      document.getElementById(`day${i}`).textContent = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
      document.getElementById(`icon${i}`).src = `https:${day.day.condition.icon}`;
      document.getElementById(`temp${i}`).textContent = `${day.day.avgtemp_c}°C`;
      document.getElementById(`desc${i}`).textContent = day.day.condition.text;
    }
  }

  async function showHourlyForecast(dayIndex) {
    const city = cityInput.value.trim();
    if (!city) return;
    spinner.style.display = "block";
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no&alerts=no`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Could not fetch hourly data.");
      const data = await response.json();
      const forecastDay = data.forecast.forecastday[dayIndex];
      hourlyContainer.innerHTML = "";
      forecastDay.hour.forEach(hour => {
        hourlyContainer.innerHTML += `
          <div class="hourly-card">
            <p>${new Date(hour.time).toLocaleTimeString("en-US", { hour: "numeric", hour12: true })}</p>
            <img src="https:${hour.condition.icon}" alt="Icon" />
            <p>${hour.temp_c}°C</p>
          </div>`;
      });
      spinner.style.display = "none";
      hourlyForecastSection.style.display = "block";
    } catch (error) {
      spinner.style.display = "none";
      alert(error.message);
    }
  }

  function getWeatherEmoji(condition) {
    const text = condition.toLowerCase();
    if (text.includes("sunny") || text.includes("clear")) return "☀️";
    if (text.includes("cloudy") || text.includes("overcast")) return "☁️";
    if (text.includes("rain") || text.includes("drizzle")) return "🌧️";
    if (text.includes("snow") || text.includes("ice")) return "❄️";
    if (text.includes("thunder")) return "⛈️";
    if (text.includes("mist") || text.includes("fog")) return "🌫️";
    return "🌍";
  }

  function setInitialBackground() {
    document.body.className = "initial";
    backgroundContainer.innerHTML = "";
    for (let i = 0; i < 7; i++) {
      const cloud = document.createElement("div");
      cloud.className = "cloud";
      cloud.style.width = `${120 + Math.random() * 150}px`;
      cloud.style.height = `${70 + Math.random() * 60}px`;
      cloud.style.top = `${Math.random() * 50}%`;
      cloud.style.animationDuration = `${25 + Math.random() * 30}s`;
      cloud.style.animationDelay = `-${Math.random() * 25}s`;
      backgroundContainer.appendChild(cloud);
    }
  }

  function setWeatherBackground(condition) {
    const body = document.body;
    backgroundContainer.innerHTML = "";
    body.className = "";

    const text = condition.toLowerCase();
    if (text.includes("sunny") || text.includes("clear")) {
      body.classList.add("sunny");
      backgroundContainer.innerHTML = '<div class="sun"></div>';
    } else if (text.includes("cloudy") || text.includes("overcast")) {
      body.classList.add("cloudy");
      for (let i = 0; i < 5; i++) {
        const cloud = document.createElement("div");
        cloud.className = "cloud";
        cloud.style.width = `${100 + Math.random() * 150}px`;
        cloud.style.height = `${60 + Math.random() * 60}px`;
        cloud.style.top = `${Math.random() * 40}%`;
        cloud.style.animationDuration = `${20 + Math.random() * 30}s`;
        cloud.style.animationDelay = `-${Math.random() * 20}s`;
        backgroundContainer.appendChild(cloud);
      }
    } else if (text.includes("rain") || text.includes("drizzle")) {
      body.classList.add("rainy");
      for (let i = 0; i < 100; i++) {
        const drop = document.createElement("div");
        drop.className = "raindrop";
        drop.style.left = `${Math.random() * 100}vw`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        backgroundContainer.appendChild(drop);
      }
    } else if (text.includes("snow") || text.includes("ice")) {
      body.classList.add("snowy");
      for (let i = 0; i < 150; i++) {
        const flake = document.createElement("div");
        flake.className = "snowflake";
        flake.style.left = `${Math.random() * 100}vw`;
        flake.style.opacity = `${Math.random()}`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        flake.style.animationDuration = `${5 + Math.random() * 10}s`;
        backgroundContainer.appendChild(flake);
      }
    } else if (text.includes("mist") || text.includes("fog")) {
      body.classList.add("misty");
    } else {
      setInitialBackground();
    }
  }

  function updateGreeting() {
    const greetingEl = document.getElementById("weather-greeting");
    if (!greetingEl) return;

    const hour = new Date().getHours();
    let greeting = "Hello!";
    if (hour >= 5 && hour < 12) greeting = "Good Morning!";
    else if (hour >= 12 && hour < 17) greeting = "Good Afternoon!";
    else if (hour >= 17 && hour < 21) greeting = "Good Evening!";
    else greeting = "Good Night!";

    greetingEl.textContent = greeting;
  }

  document.body.addEventListener("mousemove", e => {
    const weatherBg = document.getElementById("weather-background");
    if (!weatherBg) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    weatherBg.style.transform = `translate(${x}px, ${y}px)`;
  });

  window.showHourlyForecast = showHourlyForecast;

  // Initialize
  setInitialBackground();
  updateGreeting();
});
