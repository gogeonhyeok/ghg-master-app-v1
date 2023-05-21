import { MongoClient } from 'mongodb';

export default async function ListContact() {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('contactSettings').find().toArray();
  return (
    <ul style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      padding: 24
    }}>
      {items.map((entry) => (
        <li>
          <h2>{entry.contactId}</h2>
          <p>{entry.parameterId}</p>
          <p>{entry.settingValue}</p>
        </li>
      ))}
    </ul>
  );
}
