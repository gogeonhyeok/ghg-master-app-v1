import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('centers').find().toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Type</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.centerNo}</td>
          <td>{entry.centerName}</td>
          <td>{entry.centerType}</td>
        </tr>
      ))}
    </table>
  );
}
