import {env, stdin as input, stdout as output} from 'node:process'
import * as readline from 'node:readline/promises'

const endpointURL: URL = new URL('https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly')
const API_KEY: string = env.API_KEY ?? ""

const rl = readline.createInterface({input, output});

const latitude: string = await rl.question("Enter latitude: ");
const longitude: string = await rl.question("Enter longitude: ");

rl.close();

const fetchWeather = async (latitude: string, longitude: string) => {
    try {
        endpointURL.searchParams.set("latitude", latitude);
        endpointURL.searchParams.set("longitude", longitude);
        const response = await fetch(endpointURL, {
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

const weatherJson = await fetchWeather(latitude, longitude);

const timeSeries = weatherJson.features[0].properties.timeSeries;

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
