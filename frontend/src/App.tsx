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
  async function formHandler(event: React.SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    try {
      const data = await getForecast(postcode);
      setTableData(data.forecasts);
      setPlaceName(data.placeName);
    } catch (error) {
      console.error(error);
      setTableData([]);
      setPlaceName("");
    }
  }
  function updatePostcode(data: React.ChangeEvent<HTMLInputElement>): void {
    setPostcode(data.target.value)
  }
  return <>
    <h1> What is the weather like{placeName ? <span className="place-name"> in {placeName}?</span> : <span>?</span>}</h1>
    <form action="" onSubmit={formHandler}>
      <input type="text" id="postcodeInput" onChange={updatePostcode} placeholder="Enter postcode"/>
      <input type="submit" value="Search" id="postcodeSubmit" />
    </form>
    {tableData.length > 0 && (
      <div className="forecast">
        {tableData.map((item: any, index: number) => {
          const t = Math.max(0, Math.min(1, item.temperature / 30));
          const hot = {r: 235, g: 52, b: 52};
          const cold = {r: 83, g: 177, b: 253};
          const tempColor = `rgb(${Math.round(cold.r + (hot.r - cold.r) * t)}, ${Math.round(cold.g + (hot.g - cold.g) * t)}, ${Math.round(cold.b + (hot.b - cold.b) * t)})`;
          return (
            <React.Fragment key={index}>
              <div className="forecast-time">{(new Date(item.time)).toLocaleString("en-GB", {"hour": "numeric", "minute": "numeric"})}</div>
              <div className="forecast-temp" style={{color: tempColor}}>{Math.round(item.temperature)}&deg;</div>
            </React.Fragment>
          );
        })}
      </div>
    )}
  </>;
}
export default App;