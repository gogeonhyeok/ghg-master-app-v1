import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('masterWorkflows').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Type</th>
        <th>Contact</th>
        <th>From</th>
        <th>Thru</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map((entry) => (
        <tr>
          <td>{entry.workflowId}</td>
          <td>{entry.workflowName}</td>
          <td>{entry.workflowType}</td>
          <td>{entry.contactId}</td>
          <td>{entry.fromDate}</td>
          <td>{entry.thruDate}</td>
          <td>{entry.createDate}</td>
          <td>{entry.createUser}</td>
          <td>{entry.updateDate}</td>
          <td>{entry.updateUser}</td>
        </tr>
      ))}
    </table>
  );
}
