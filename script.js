$(document).ready(function () {

    var searchInput = $("#search-input");

    var APIKey = "d56db9b98323f0058762bd9dc0966b5f";

    var currentCity = "";
    var storedCities = [];
    var numberOfDays = 5;

    var navWeatherIcon = $("#nav-weather-icon");

    // Initializing The App // 
    init();

    // Render Weather Data When Search Button Clicked // 
    $("#search-btn").on("click", function () {

        renderWeatherData(searchInput.val());

        var city = $("#search-input").val();
        if (city != '') {

        } else {
            $("#error").html('Field cannot be empty');
        }

        //  Empty Search Field //
        searchInput.val("");

    });

    // Render Weather Data When the Enter Button Is Pressed //
    $('.click_on_enterkey').on('keyup', function (event) {
        if (event.keyCode == 13) {
            $(this).click();
            renderWeatherData(searchInput.val());

            var city = $("#search-input").val();
            if (city != '') {

            } else {
                $("#error").html('Field cannot be empty');
            }
            
            //  Empty Search Field //
            searchInput.val("");

        }
    });

    // Display Weather Data When Saved City is Clicked // 
    $(document).on("click", ".city-button", function () {

        var cityName = $(this).data("city");

        renderWeatherData(cityName);

    })


    function init() {
        renderCities();
    }


    function renderCities() {

        // Get The List of Cities // 
        var citiesList = $("#cities-list");

        // Clear Cities List // 
        citiesList.html("");

        // Get The List of Cities From Local Storage //
        if (localStorage.getItem("cities")) {
            storedCities = JSON.parse(localStorage.getItem("cities"));
        }

        if (storedCities) {

            storedCities.forEach(city => {
                // Creates a New List Item For Stored Cities //
                var li = $("<li>");

                // Calls And Sets The Bootstrap Classes //
                li.attr("class", "city-button list-group-item d-flex justify-content-between align-items-center");
                li.attr("data-city", city);

                // Updates The City Name In The Sidebar And Adds an Icon //
                li.html(city + "<i class='fa fa-building'></i>");

                // Appends The Name of City to HTML Element We Have //
                citiesList.append(li);

            });

        }
    }

    function renderWeatherData(cityName) {

        // Build The queryURL Here With The API Key and City Name //
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?units=imperial&q=" + cityName + "&appid=" + APIKey;

        // AJAX Function Calls The OpenWeather API // 
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (response) {

            // Pulls The Latitude and Longitude //
            var lat = response.coord.lat;
            var lon = response.coord.lon;

            currentCity = response.name;

            // Stores City In The Array //
            if (!storedCities.includes(currentCity)) {
                storedCities.push(currentCity);
                localStorage.setItem("cities", JSON.stringify(storedCities));
            }
            // Displays The Updated List of Cities // 
            renderCities();

            var queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=" + APIKey;

            $.ajax({
                url: queryURL2,
                method: 'GET'
            }).then(function (oneCallResponse) {

                console.log(oneCallResponse);

                // Gets The Weather Data //
                var weatherSection = $("#weather-data");

                // Clears Out The HTML //
                weatherSection.html("");

                // Displays Todays Weather //
                var weatherDiv = $("<div>");
                weatherDiv.attr("class", "row m-3");

                // This Section Parses The UV Index //
                var uvIndex = oneCallResponse.current.uvi;
                var conditions = "secondary";

                switch (true) {
                    case uvIndex <= 5: conditions = "success";
                        break;
                    case uvIndex > 5 && uvIndex <= 7: conditions = "warning";
                        break;
                    case uvIndex > 7: conditions = "danger";
                        break;
                    default: conditions = "secondary"
                }


                // Updates The Weather Section Here With The Weather and Date for Today //
                weatherDiv.html("<div class='card w-100 mb-4'><div class='card-body'><h2 class='card-title'>" + currentCity + " " + convertDate(oneCallResponse.current.dt) + "</h2> <p class='card-text'>Temperature: " + oneCallResponse.current.temp + " °F</p> <p class='card-text'>Humidity: " + oneCallResponse.current.humidity + "%</p><p class='card-text'>Wind Speed: " + oneCallResponse.current.wind_speed + " MPH</p> <p class='card-text'>UV Index: <button type='button' class='btn btn-" + conditions + "'>" + uvIndex + "</button></p></div></div>");

                weatherSection.append(weatherDiv);

                // Updates The Icon On The Header //
                navWeatherIcon.attr("src", "https://openweathermap.org/img/wn/" + oneCallResponse.current.weather[0].icon + ".png");

                // Displays The Title of The Forecast //
                var forecastTitle = $("<h2>");
                forecastTitle.attr("class", "row m-3");
                forecastTitle.text("5-Day Forecast");

                weatherSection.append(forecastTitle);

                // Displays Forecast Cards For  The 5 days //
                var forecastDiv = $("<div>");
                forecastDiv.attr("class", "row m-3");

                // Displays Daily Forecast  //
                var dailyForecast = oneCallResponse.daily;

                for (var i = 1; i < numberOfDays + 1; i++) {

                    // Creates a New Div For Each Day //
                    var forecastCard = $("<div>");

                    var forecastDate = convertDate(dailyForecast[i].dt);

                    var iconURL = "https://openweathermap.org/img/wn/" + dailyForecast[i].weather[0].icon + "@2x.png";

                    forecastCard.html("<div class='card bg-custom forecast-card m-2'> <div class='card-body'> <h5 class='card-title'>" + forecastDate + "</h5> <img src='" + iconURL + "' alt='weather-icon'><p class='card-text'> Temp: " + dailyForecast[i].temp.day + " °F </p> <p class='card-text'>Humidity: " + dailyForecast[i].humidity + "%</p> </div> </div>");

                    forecastDiv.append(forecastCard);

                }

                weatherSection.append(forecastDiv);


            })

        });

    }

    function convertDate(timestamp) {

        // Set Date //
        var date = new Date(timestamp * 1000);

        // Set Month //
        var month = date.getMonth() + 1;

        // Set Day //
        var day = date.getDate();

        // Set Year //
        var year = date.getFullYear();

        return month + "/" + day + "/" + year;

    }




});