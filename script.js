const APIkey = "e9094a40197c32646b539fbb58b714eb"
var searchFormEl = document.querySelector("#citySearchForm");
var cityInputVal = document.querySelector("#inputCity");
var searchBtn = document.querySelector("#citySearch");
var usersCityListGroupEl = document.querySelector(".searchHistory");
var weatherContentDiv = document.querySelector("#weatherContent");
var cardDivEl = document.querySelector(".card");
var cardTitleEl = document.querySelector(".card-title");
var weatherIconEl = document.querySelector("#icon");
var uvIndexEl = document.querySelector("#uvIndex");
var openWeatherQueryUrl = "https://api.openweathermap.org/data/2.5/";
var existingEntries = JSON.parse(localStorage.getItem("cities"));

// App on load
window.onload = function initializeDashboard() {
    if (localStorage.getItem("cities") !== null) {
        for (var i = 0; i < existingEntries.length; i++) {
            createNewCityButton(existingEntries[i], usersCityListGroupEl);
        }
    }
};

// Search function
function handleSearch(event) {
    event.preventDefault();
    var cityInput = cityInputVal.value.trim();

    if (!cityInput) {
        errorMessage("You must enter a valid city name", searchFormEl, 3000);
        return;
    } else {
        getCurrentWeather(cityInput, apiKey);
        getForecast(cityInput, apiKey);
        cityInputVal.value = "";
        weatherContentDiv.classList.add("hide");
    }
}

// Event listener
searchBtn.addEventListener("click", handleSearch);

// Current date
var currentDate = new Date();
function getTodaysDate(date) {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();
    return [month, day, year].join("/");
}

// Format date
function formatDate(date) {
    var year = date.split("-")[0];
    var month = date.split("-")[1];
    var day = date.split("-")[2];
    if (month.charAt(0) === "0") {
        month = month.slice(1);
    }
    if (day.charAt(0) === "0") {
        day = day.slice(1);
    }
    return [month, day, year].join("/");
}

// Search history button
function createNewCityButton(cityName, location) {
    var cityBtnEl = document.createElement("button");
    cityBtnEl.setAttribute("type", "button");
    cityBtnEl.classList.add("list-group-item", "list-group-item-action");
    cityBtnEl.textContent = cityName;
    cityBtnEl.setAttribute("value", cityName);
    location.prepend(cityBtnEl);
    cityBtnEl.addEventListener("click", function () {
        var allCityBtns = document.querySelectorAll(".list-group-item");
        for (var i = 0; i < allCityBtns.length; i++) {
            allCityBtns[i].classList.remove("active");
        }
        getCurrentWeather(cityBtnEl.value, apiKey);
        getForecast(cityBtnEl.value, apiKey);
        cityBtnEl.classList.add("active");
    });
}

// Error message
function errorMessage(msg, location, duration) {
    var alertErrorDiv = document.createElement("div");
    alertErrorDiv.classList.add(
        "alert",
        "alert-danger",
        "text-center",
        "pt-2",
        "pb-0"
    );
    alertErrorDiv.innerHTML = "<p><strong>" + msg + "</strong></p>";

    setTimeout(function () {
        alertErrorDiv.parentElement.removeChild(alertErrorDiv);
    }, duration);

    location.prepend(alertErrorDiv);
}

// Get current weather and store city names
function getCurrentWeather(cityName, apiKey) {
    var url =
        openWeatherQueryUrl +
        "weather?q=" +
        cityName +
        "&appid=" +
        apiKey +
        "&units=imperial";

    fetch(url)
        .then(function (response) {
            if (!response.ok) {
                console.log("There is an issue. Status Code: " + response.status);
                errorMessage(
                    "No results for " +
                    cityName +
                    ". Please try again.",
                    weatherContentDiv,
                    4000
                );
                return;
            } else {
                return response.json();
            }
        })
        .then(function (weatherData) {
            console.log("Here is the object containing the current weather data");
            console.log(weatherData);
            console.log("------------------------------------------------");
            weatherContentDiv.classList.remove("hide");
            displayCurrentWeather(weatherData);

            var isNew = true;

            if (localStorage.getItem("cities") !== null) {
                for (var i = 0; i < existingEntries.length; i++) {
                    if (existingEntries[i] === weatherData.name) {
                        isNew = false;
                    }
                }
                if (isNew) {
                    existingEntries.push(weatherData.name);
                    localStorage.setItem("cities", JSON.stringify(existingEntries));
                    createNewCityButton(weatherData.name, usersCityListGroupEl);
                }
            } else {
                existingEntries = [];
                existingEntries.push(weatherData.name);
                localStorage.setItem("cities", JSON.stringify(existingEntries));
                createNewCityButton(weatherData.name, usersCityListGroupEl);
            }
        })
        .catch(function (error) {
            console.log("There is an error: " + error);
        });
}

// Display current Weather
function displayCurrentWeather(resultObj) {
    cardTitleEl.textContent =
        resultObj.name + " (" + getTodaysDate(currentDate) + ") ";

    weatherIconEl.setAttribute(
        "src",
        "https://openweathermap.org/img/wn/" + resultObj.weather[0].icon + "@2x.png"
    );
    weatherIconEl.setAttribute("alt", resultObj.weather[0].description);
    cardTitleEl.append(weatherIconEl);

    var tempEl = document.querySelector("#temp");
    var humidityEl = document.querySelector("#humidity");
    var windSpeedEl = document.querySelector("#windSpeed");

    if (resultObj.main.temp) {
        tempEl.textContent = resultObj.main.temp + " °F";
    } else {
        tempEl.textContent = "No temperature for this city.";
    }

    if (resultObj.main.humidity) {
        humidityEl.textContent = resultObj.main.humidity + "%";
    } else {
        humidityEl.textContent = "No humidity for this city.";
    }

    if (resultObj.wind.speed) {
        windSpeedEl.textContent = resultObj.wind.speed + " MPH";
    } else {
        windSpeedEl.textContent = "No wind speed for this city.";
    }
};

// 5 day forecast
function getForecast(cityName, apiKey) {
    var url =
        openWeatherQueryUrl +
        "forecast?q=" +
        cityName +
        "&appid=" +
        apiKey +
        "&units=imperial";

    fetch(url)
        .then(function (response) {
            if (!response.ok) {
                console.log("There is an issue. Status Code: " + response.status);
                return;
            } else {
                return response.json();
            }
        })
        .then(function (forecastData) {
            console.log("Here is the object containing the forcast data");
            console.log(forecastData);
            var ourForecastObject = [];

            for (var i = 0; i < forecastData.list.length; i++) {
                if (i % 8 === 0) {
                    ourForecastObject.push({
                        date: forecastData.list[i].dt_txt.split(" ")[0],
                        icon: forecastData.list[i].weather[0].icon,
                        iconAlt: forecastData.list[i].weather[0].description,
                        temp: forecastData.list[i].main.temp,
                        wind: forecastData.list[i].wind.speed,
                        humidity: forecastData.list[i].main.humidity,
                    });
                }
            }

            for (var i = 0; i < ourForecastObject.length; i++) {
                var dateTitle = document.querySelectorAll(".date-title");
                var iconEl = document.querySelectorAll("#forecastIcon");
                var tempSpan = document.querySelectorAll("#tempForecast");
                var windSpan = document.querySelectorAll("#windForecast");
                var humiditySpan = document.querySelectorAll("#humidityForecast");

                dateTitle[i].textContent = formatDate(ourForecastObject[i].date);
                iconEl[i].setAttribute(
                    "src",
                    "https://openweathermap.org/img/wn/" +
                    ourForecastObject[i].icon +
                    "@2x.png"
                );
                iconEl[i].setAttribute("alt", ourForecastObject[i].iconAlt);
                tempSpan[i].textContent = ourForecastObject[i].temp + " °F";
                windSpan[i].textContent = ourForecastObject[i].wind + " MPH";
                humiditySpan[i].textContent = ourForecastObject[i].humidity + "%";
            }

            console.log(ourForecastObject);
            console.log("------------------------------------------------");
        })
        .catch(function (error) {
            console.log("There is an error: " + error);
        });
}