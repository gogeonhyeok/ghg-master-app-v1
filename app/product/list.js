import { MongoClient } from 'mongodb';

export default async function ProductList() {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('products').find().toArray();
  return (
    <>
      <ul>
        {items.map((entry) => (
          <li>
            <h2>{entry.displayName}</h2>
            <p>{entry.description}</p>
            <p>{entry.price}</p>
            <p>{entry.currency}</p>
            <p>{entry.quantity}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
