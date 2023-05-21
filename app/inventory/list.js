import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('inventories').find().toArray();
  return (
    <ul style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      margin: 24
    }}>
      {items.map((entry) => (
        <li>
          <h2>{entry.invenNo}</h2>
          <p>{entry.contactId}</p>
          <p>{entry.centerNo}</p>
          <p>{entry.productId}</p>
          <p>{entry.qty}</p>
        </li>
      ))}
    </ul>
  );
}
