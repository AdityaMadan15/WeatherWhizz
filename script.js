const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "e797ef7acfe3673c559715e2350f13dd";

const createWeatherCard = (cityName, weatheritem, index) => {
    if (index === 0) {
        return `<div class="details">
            <h2>${cityName} (${weatheritem.dt_txt.split(" ")[0]})</h2>
            <h4>Temperature: ${(weatheritem.main.temp).toFixed(2)}°C</h4>
            <h4>Wind: ${weatheritem.wind.speed} m/s</h4>
            <h4>Humidity: ${weatheritem.main.humidity}%</h4>
        </div>
        <div class="icon">
            <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@4x.png" alt="weather-icon">
            <h4>${weatheritem.weather[0].description}</h4>
        </div>`;
    } else {
        return `<li class="card">
            <h3>${weatheritem.dt_txt.split(" ")[0]}</h3>
            <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" alt="weather-icon">
            <h4>Temp: ${(weatheritem.main.temp).toFixed(2)}°C</h4>
            <h4>Wind: ${weatheritem.wind.speed} m/s</h4>
            <h4>Humidity: ${weatheritem.main.humidity}%</h4>
        </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Ensure the array has exactly 6 elements
            while (fiveDaysForecast.length < 6) {
                fiveDaysForecast.push({
                    dt_txt: "N/A",
                    main: { temp: 0, humidity: 0 },
                    wind: { speed: 0 },
                    weather: [{ icon: "01d", description: "No Data" }]
                }); // Placeholder values
            }

            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            fiveDaysForecast.forEach((weatheritem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatheritem, index));
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatheritem, index));
                }
            });

            console.log(fiveDaysForecast);  // Log the filtered five days forecast
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                    if (data.length > 0) {
                        const { name } = data[0];
                        getWeatherDetails(name, latitude , longitude);
                    } else {
                        alert("No city found for your coordinates!");
                    }
                })
                .catch(() => {
                    alert("An error occurred while fetching the city!");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    );
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key == "Enter"&& getCityCoordinates());


