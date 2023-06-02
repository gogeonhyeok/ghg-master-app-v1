import { MongoClient } from 'mongodb';

export default async function ListContact() {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('contactCodes').find().toArray();
  return (
    <table className="table">
      <tr>
        <th>Contact ID</th>
        <th>Code Type</th>
        <th>Code ID</th>
        <th>Description</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.contactId}</td>
          <td>{entry.codeType}</td>
          <td>{entry.codeId}</td>
          <td>{entry.codeDesc}</td>
        </tr>
      ))}
    </table>
  );
}
