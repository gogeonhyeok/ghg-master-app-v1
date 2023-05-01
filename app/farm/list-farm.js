export default async function ListFarm() {
  const response = await fetch(
    'https://data.mongodb-api.com/app/data-efhph/endpoint/data/v1/action/find',
    {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
        'api-key':
          'EkYheuKC7iqVZ1H2FejbfNLjSj9RHDw26HWMm8Z31Cpo3nJlK6Q8jAa7gUpX4Ow7',
      },
      body: JSON.stringify({
        dataSource: 'Cluster0',
        database: 'ghg-master-api-v1',
        collection: 'farms',
        filter: {},
        sort: {
          completedAt: 1,
        },
      }),
    }
  );

  const items = await response.json();
  
  return (
    <>
      <ul>
        {items.documents.map((entry) => (
          <li>
            <h2>{entry.name}</h2>
            <p>{entry.description}</p>
            <p>{entry.address}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
