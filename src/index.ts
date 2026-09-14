import {env, stdin as input, stdout as output} from 'node:process'
import * as readline from 'node:readline/promises'

const weatherEndpoint: URL = new URL('https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly')
const postcodeEndpoint: URL = new URL('https://api.postcodes.io/postcodes')
const API_KEY: string = env.API_KEY ?? ""

const rl = readline.createInterface({input, output});

const postcode: string = await rl.question("Post code: ");

rl.close();

const fetchPostcodeData = async (postcode: string) => {
    try {
        postcodeEndpoint.pathname += `/${postcode}`;
        const response = await fetch(postcodeEndpoint);

        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const json = await response.json();
        return {
            "longitude": json.result.longitude,
            "latitude": json.result.latitude,
        }
    } catch (e) {
        console.error(e);
    }
}

const fetchWeather = async (geoData: any) => {
    try {
        const latitude: string = geoData.latitude;
        const longitude: string = geoData.longitude;

        if (!latitude || !longitude) {
            throw new Error("Invalid parameters");
        }

        weatherEndpoint.searchParams.set("latitude", latitude);
        weatherEndpoint.searchParams.set("longitude", longitude);
        const response = await fetch(weatherEndpoint, {
            headers: {
                apikey: API_KEY,
                accept: "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
        }
        return await response.json();
    } catch (e) {
        console.error(e);
    }
}

const outputWeather = (timeSeries: any) => {
    const now = new Date();
    const nextThreeHours = timeSeries
        .filter((entry: any) => new Date(entry.time) >= now)
        .slice(0, 3);

    for (const entry of nextThreeHours) {
        const time = new Date(entry.time).toLocaleString("en-GB", { "hour": "numeric", "minute": "2-digit" });
        let message: string = `${time}: ${entry.screenTemperature}°C`;

        const weatherCode = entry.significantWeatherCode;

        if (weatherCode >= 9) {
            message += " - Might be wet so bring an umbrella!";
        }

        console.log(message);
    }
}

const geoData = await fetchPostcodeData(postcode);
const weatherJson = await fetchWeather(geoData);
if (weatherJson) {
    const timeSeries = weatherJson.features[0].properties.timeSeries;
    outputWeather(timeSeries);
}


