import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('pickingPlans').find().limit(100).toArray();
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
        }}>ID</th>
        <th>Contact ID</th>
        <th>Center No</th>
        <th>Inventory No</th>
        <th>Qty</th>
        <th>Plan Date</th>
        <th>Plan Rule</th>
        <th>SI No</th>
        <th>Previous Process</th>
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
          }}>{entry.piPlanNo}</td>
          <td>{entry.contactId}</td>
          <td>{entry.centerNo}</td>
          <td>{entry.invenNo}</td>
          <td>{entry.qty}</td>
          <td>{entry.planDate}</td>
          <td>{entry.planRule}</td>
          <td>{entry.siNo}</td>
          <td>{entry.prevProcessId}</td>
          <td>{entry.cancelTag}</td>
          <td>{entry.createDate}</td>
          <td>{entry.createUser}</td>
          <td>{entry.updateDate}</td>
          <td>{entry.updateUser}</td>
        </tr>
      ))}
    </table>
    // <ul style={{
    //   display: 'flex',
    //   flexDirection: 'column',
    //   gap: 24,
    //   margin: 24
    // }}>
    //   {items.map((entry) => (
    //     <li>
    //       <h2>{entry.piPlanNo}</h2>
    //       <p>{entry.contactId}</p>
    //       <p>{entry.centerNo}</p>
    //       <p>{entry.invenNo}</p>
    //       <p>{entry.qty}</p>
    //     </li>
    //   ))}
    // </ul>
  );
}
