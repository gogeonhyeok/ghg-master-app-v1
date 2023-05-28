import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('masterSystems').aggregate([
    {
      '$lookup': {
        'from': 'masterSystems',
        'localField': 'parentSystemId',
        'foreignField': 'systemId',
        'as': 'parentSystem'
      }
    }
  ]).toArray();
  return (
    <table style={{
      tableLayout: 'fixed',
      width: '100%',
      margin: 24
    }}>
      <tr style={{
        textAlign: 'left'
      }}>
        <th style={{
          padding: 4
        }}>Name</th>
        <th>Parent System</th>
        <th>Cancel Tag</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td style={{
            padding: 4
          }}>{entry.systemName}</td>
          <td>{entry.parentSystem[0] == undefined ? '' : entry.parentSystem[0].systemName}</td>
          <td>{entry.createDate}</td>
          <td>{entry.createUser}</td>
          <td>{entry.updateDate}</td>
          <td>{entry.updateUser}</td>
        </tr>
      ))}
    </table>
  );
}
