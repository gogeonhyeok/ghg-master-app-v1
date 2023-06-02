import { MongoClient } from 'mongodb';

export default async function ListContact() {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('contacts').find().toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Name</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.contactId}</td>
          <td>{entry.contactName}</td>
        </tr>
      ))}
    </table>
  );
}
