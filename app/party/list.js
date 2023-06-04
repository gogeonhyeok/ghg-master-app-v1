import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('masterParties').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>No</th>
        <th>Name</th>
        <th>Contact</th>
        <th>Address 1</th>
        <th>Address 2</th>
        <th>Address 3</th>
        <th>Address 4</th>
        <th>Tel</th>
        <th>Country</th>
        <th>Zip</th>
        <th>Contact Person</th>
        <th>Status</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.partyId}</td>
          <td>{entry.partyNo}</td>
          <td>{entry.partyName}</td>
          <td>{entry.contactId}</td>
          <td>{entry.addr1}</td>
          <td>{entry.addr2}</td>
          <td>{entry.addr3}</td>
          <td>{entry.addr4}</td>
          <td>{entry.tel}</td>
          <td>{entry.country}</td>
          <td>{entry.zipCode}</td>
          <td>{entry.contactPerson}</td>
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
