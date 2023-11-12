import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('putAways').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Center</th>
        <th>Contact</th>
        <th>Inventory</th>
        <th>Qty</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.pwNo}</td>
          <td>{entry.centerNo}</td>
          <td>{entry.contactId}</td>
          <td>{entry.invenNo}</td>
          <td>{entry.qty}</td>
        </tr>
      ))}
    </table>
  );
}
