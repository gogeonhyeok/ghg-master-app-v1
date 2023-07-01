import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('masterSkus').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Contact</th>
        <th>Description</th>
        <th>Type</th>
        <th>Width</th>
        <th>Length</th>
        <th>Height</th>
        <th>Status</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map((entry) => (
        <tr>
          <td>{entry.skuId}</td>
          <td>{entry.contactId}</td>
          <td>{entry.skuDesc}</td>
          <td>{entry.skuType}</td>
          <td>{entry.width}</td>
          <td>{entry.length}</td>
          <td>{entry.height}</td>
          <td>{entry.status}</td>
          <td>{entry.createDate}</td>
          <td>{entry.createUser}</td>
        </tr>
      ))}
    </table>
  );
}
