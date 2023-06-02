import { MongoClient } from 'mongodb';

export default async function ListContact() {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('contactSettings').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>Contact ID</th>
        <th>Setting ID</th>
        <th>Setting Value</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.contactId}</td>
          <td>{entry.parameterId}</td>
          <td>{entry.settingValue}</td>
        </tr>
      ))}
    </table>
  );
}
