const weatherEndpoint: URL = new URL('https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly')
const postcodeEndpoint: URL = new URL('https://api.postcodes.io/postcodes')

interface LocationInfo {
    placeName: string;
    latitude: number;
    longitude: number;
}

interface ForecastEntry {
    time: string;
    temperature: number;
    weatherCode: number;
}

interface ForecastResult {
    placeName: string;
    forecasts: ForecastEntry[];
}

const fetchLocationData = async (postcode: string): Promise<LocationInfo> => {
    const endpoint = new URL(postcodeEndpoint);
    endpoint.pathname += `/${encodeURIComponent(postcode)}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
        const json = await response.json();
        throw new Error(`Postcode lookup failed: ${json.error}`);
    }
    const json = await response.json();
    return {
        placeName: json.result.bua || json.result.admin_ward,
        latitude: json.result.latitude,
        longitude: json.result.longitude,
    };
}

const fetchWeather = async (location: LocationInfo, apiKey: string): Promise<any> => {
    const endpoint = new URL(weatherEndpoint);
    endpoint.searchParams.set("latitude", String(location.latitude));
    endpoint.searchParams.set("longitude", String(location.longitude));
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

const getNextThreeHours = (timeSeries: any[]): ForecastEntry[] => {
    const now = new Date();
    return timeSeries
        .filter((entry: any) => new Date(entry.time) >= now)
        .slice(0, 3)
        .map((entry: any) => ({
            time: entry.time,
            temperature: entry.screenTemperature,
            weatherCode: entry.significantWeatherCode
        }));
}

export const getForecastForPostcode = async (postcode: string, apiKey: string): Promise<ForecastResult> => {
    const location = await fetchLocationData(postcode);
    const weatherJson = await fetchWeather(location, apiKey);
    const timeSeries = weatherJson.features[0].properties.timeSeries;
    return {
        placeName: location.placeName,
        forecasts: getNextThreeHours(timeSeries)
    }
}
