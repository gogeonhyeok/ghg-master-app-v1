import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('masterContactOrdTypes').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>Contact</th>
        <th>Order Type</th>
        <th>Description</th>
        <th>Create Type</th>
        <th>Status</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map((entry) => (
        <tr>
          <td>{entry.contactId}</td>
          <td>{entry.contactOrdType}</td>
          <td>{entry.description}</td>
          <td>{entry.createType}</td>
          <td>{entry.status}</td>
          <td>{entry.createDate}</td>
          <td>{entry.createUser}</td>
          <td>{entry.updateDate}</td>
          <td>{entry.updateUser}</td>
        </tr>
      ))}
    </table>
  );
}
