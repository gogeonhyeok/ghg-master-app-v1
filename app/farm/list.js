import { MongoClient } from 'mongodb';

export default async function ListFarm() {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('farms').find().toArray();
  return (
    <ul style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      padding: 24
    }}
    >
      {items.map((entry) => (
        <li>
          <h2>{entry.name}</h2>
          <p>{entry.description}</p>
          <p>{entry.address}</p>
        </li>
      ))}
    </ul>
  );
}
