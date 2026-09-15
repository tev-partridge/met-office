const weatherEndpoint: URL = new URL('https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly')
const postcodeEndpoint: URL = new URL('https://api.postcodes.io/postcodes')

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface ForecastEntry {
    time: string;
    temperature: number;
    umbrella: boolean;
}

export const fetchCoordinates = async (postcode: string): Promise<Coordinates> => {
    const endpoint = new URL(postcodeEndpoint);
    endpoint.pathname += `/${encodeURIComponent(postcode)}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error(`Postcode lookup failed: ${response.statusText}`);
    }
    const json = await response.json();
    return {
        latitude: json.result.latitude,
        longitude: json.result.longitude,
    };
}

export const fetchWeather = async (coordinates: Coordinates, apiKey: string): Promise<any> => {
    const endpoint = new URL(weatherEndpoint);
    endpoint.searchParams.set("latitude", String(coordinates.latitude));
    endpoint.searchParams.set("longitude", String(coordinates.longitude));
    const response = await fetch(endpoint, {
        headers: {
            apikey: apiKey,
            accept: "application/json",
        },
    });
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
    }
    return await response.json();
}

export const getNextThreeHours = (timeSeries: any[]): ForecastEntry[] => {
    const now = new Date();
    return timeSeries
        .filter((entry: any) => new Date(entry.time) >= now)
        .slice(0, 3)
        .map((entry: any) => ({
            time: entry.time,
            temperature: entry.screenTemperature,
            umbrella: entry.significantWeatherCode >= 9,
        }));
}

export const getForecastForPostcode = async (postcode: string, apiKey: string): Promise<ForecastEntry[]> => {
    const coordinates = await fetchCoordinates(postcode);
    const weatherJson = await fetchWeather(coordinates, apiKey);
    const timeSeries = weatherJson.features[0].properties.timeSeries;
    return getNextThreeHours(timeSeries);
}
