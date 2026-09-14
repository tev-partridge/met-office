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
        const json = await response.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        console.log("Fetched Weather");
    }
}

await fetchWeather(latitude, longitude);