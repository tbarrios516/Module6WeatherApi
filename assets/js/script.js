const weatherApiKey = '4779d4ba00f611047e157dabd9dc7b14';
const weatherUrl = 'https://api.openweathermap.org/data/2.5/forecast';

async function getCoordinates(cityName) {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${weatherApiKey}`);
    const data = await response.json();
    if (data.length === 0) {
        throw new Error('City not found');
    }
    return { lat: data[0].lat, lon: data[0].lon };
}

async function fetchWeatherData(cityName) {
    try {
        const { lat, lon } = await getCoordinates(cityName);
        const response = await fetch(`${weatherUrl}?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`);
        const weatherData = await response.json();
        displayCurrentWeather(weatherData);
        displayForecast(weatherData);
        updateSearchHistory(cityName);
    } catch (error) {
        alert(error.message);
    }
}

function displayCurrentWeather(weatherData) {
    const currentWeather = weatherData.list[0];
    const currentWeatherHTML = `
        <h2>Current Weather in ${weatherData.city.name}</h2>
        <p>Temperature: ${currentWeather.main.temp}°C</p>
        <p>Humidity: ${currentWeather.main.humidity}%</p>
        <p>Wind Speed: ${currentWeather.wind.speed} m/s</p>
        <img src="http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png" alt="${currentWeather.weather[0].description}">
    `;
    document.getElementById('current-weather').innerHTML = currentWeatherHTML;
}

function displayForecast(weatherData) {
    let forecastHTML = '<h2>5-Day Forecast</h2>';
    weatherData.list.forEach((forecast, index) => {
        if (index % 8 === 0) {
            forecastHTML += `
                <div>
                    <p>${new Date(forecast.dt_txt).toLocaleDateString()}</p>
                    <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
                    <p>Temp: ${forecast.main.temp}°C</p>
                    <p>Wind: ${forecast.wind.speed} m/s</p>
                    <p>Humidity: ${forecast.main.humidity}%</p>
                </div>
            `;
        }
    });
    document.getElementById('forecast').innerHTML = forecastHTML;
}

function updateSearchHistory(city) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        renderSearchHistory();
    }
}

function renderSearchHistory() {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const searchHistoryHTML = searchHistory.map(city => `<button class="history-btn">${city}</button>`).join('');
    document.getElementById('search-history').innerHTML = searchHistoryHTML;

    document.querySelectorAll('.history-btn').forEach(button => {
        button.addEventListener('click', () => fetchWeatherData(button.textContent));
    });
}

document.getElementById('search-btn').addEventListener('click', () => {
    const cityInput = document.getElementById('city-input').value;
    if (cityInput) {
        fetchWeatherData(cityInput);
    } else {
        alert('Please enter a city name');
    }
});

document.getElementById('city-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const cityInput = document.getElementById('city-input').value;
        if (cityInput) {
            fetchWeatherData(cityInput);
        } else {
            alert('Please enter a city name');
        }
    }
});

renderSearchHistory();
