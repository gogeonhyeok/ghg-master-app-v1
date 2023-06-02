import { MongoClient } from 'mongodb';

export default async function ListFarm() {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('farms').find().toArray();
  return (
    <table className="table">
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Address</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.name}</td>
          <td>{entry.description}</td>
          <td>{entry.address}</td>
        </tr>
      ))}
    </table>
  );
}
