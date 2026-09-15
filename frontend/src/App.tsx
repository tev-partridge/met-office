import React, {useState} from 'react';
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
  async function formHandler(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault(); // to stop the form refreshing the page when it submits
    const data = await getForecast(postcode);
    setTableData(data);
  }
  function updatePostcode(data: React.ChangeEvent<HTMLInputElement>): void {
    setPostcode(data.target.value)
  }
  return <>
    <h1> Met Office Weather </h1>
    <form action="" onSubmit={formHandler}>
      <label htmlFor="postcodeInput"> Postcode: </label>
      <input type="text" id="postcodeInput" onChange={updatePostcode}/>
      <input type="submit" value="Submit"/>
    </form>
    <table>
      <tbody>
        {tableData.map((item: any, index: number) => (
            <tr key={index}>
              <td>{item.time}</td>
              <td>{item.temperature}</td>
              <td>{item.umbrella}</td>
            </tr>
        ))}
      </tbody>
    </table>
  </>;
}
export default App;