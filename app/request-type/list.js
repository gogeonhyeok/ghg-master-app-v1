import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('requestTypes').find().toArray();
  return (
    <table style={{
      tableLayout: 'fixed',
      width: '100%',
      margin: 24,
    }}>
      <tr style={{
        textAlign: 'left'
      }}>
        <th style={{
          padding: 4
        }}>ID</th>
        <th>Description</th>
        <th>Cancel Tag</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map((entry) => (
        <tr>
          <td style={{
            padding: 4
          }}>{entry.requestTypeId}</td>
          <td>{entry.requestTypeDescription}</td>
          <td>{entry.cancelTag}</td>
          <td>{entry.createDate}</td>
          <td>{entry.createUser}</td>
          <td>{entry.updateDate}</td>
          <td>{entry.updateUser}</td>
        </tr>
      ))}
    </table>
  );
}
