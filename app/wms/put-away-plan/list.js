import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('putAwayPlans').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Contact ID</th>
        <th>Center No</th>
        <th>Inventory No</th>
        <th>Qty</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.pwPlanNo}</td>
          <td>{entry.contactId}</td>
          <td>{entry.centerNo}</td>
          <td>{entry.invenNo}</td>
          <td>{entry.qty}</td>
        </tr>
      ))}
    </table>
  );
}
