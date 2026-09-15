import React, {useState} from 'react';
import "./App.css"

async function getForecast(postcode: string) {
  const response = await fetch(`/api/forecast?postcode=${encodeURIComponent(postcode)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch forecast: ${response.status}`);
  }
  const data = await response.json();
  return data.entries;
}
function App(): React.ReactElement {
  const [postcode, setPostcode] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [placeName, setPlaceName] = useState<string>("");
  async function formHandler(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault(); // to stop the form refreshing the page when it submits
    const data = await getForecast(postcode);
    setTableData(data.forecasts);
    setPlaceName(data.placeName);
  }
  function updatePostcode(data: React.ChangeEvent<HTMLInputElement>): void {
    setPostcode(data.target.value)
  }
  return <>
    <h1> Met Office Weather </h1>
    <form action="" onSubmit={formHandler}>
      <input type="text" id="postcodeInput" onChange={updatePostcode} placeholder="Enter postcode"/>
      <input type="submit" value="Search" id="postcodeSubmit" />
    </form>
    {placeName && <h2 className="place-name">{placeName}</h2>}
    <div className="forecast">
      {tableData.map((item: any, index: number) => (
          <React.Fragment key={index}>
            <div className="forecast-time">{(new Date(item.time)).toLocaleString("en-GB", {"hour": "numeric", "minute": "numeric"})}</div>
            <div className="forecast-temp">{item.temperature}&deg;</div>
            <div className="forecast-umbrella">{item.umbrella ? "☂️" : ""}</div>
          </React.Fragment>
      ))}
    </div>
  </>;
}
export default App;