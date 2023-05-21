import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('planRules').find().toArray();
  return (
    <ul>
      {items.map((entry) => (
        <li>
          <h2>{entry.locationId}</h2>
          <p>{entry.centerId}</p>
        </li>
      ))}
    </ul>
  );
}
