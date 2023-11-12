import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('orders').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>Order No</th>
        <th>Order Type</th>
        <th>Contact ID</th>
        <th>Center No</th>
        <th>ETA</th>
        <th>Due Date</th>
        <th>Receipt Date</th>
        <th>Urgent</th>
        <th>Ownership</th>
        <th>Collect Bill Amount</th>
        <th>Cancel Tag</th>
        <th>Create Date</th>
        <th>Create User</th>
      </tr>
      {items.map((entry) => (
        <tr>
          <td>{entry.contactOrdNo}</td>
          <td>{entry.contactOrdType}</td>
          <td>{entry.contactId}</td>
          <td>{entry.centerNo}</td>
          <td>{entry.eta}</td>
          <td>{entry.dueDate}</td>
          <td>{entry.ordReceiptDate}</td>
          <td>{entry.isUrgent}</td>
          <td>{entry.invenOwnership}</td>
          <td>{entry.collectBillAmount}</td>
          <td>{entry.cancelTag}</td>
          <td>{entry.createDate}</td>
          <td>{entry.createUser}</td>
        </tr>
      ))}
    </table>
  );
}
