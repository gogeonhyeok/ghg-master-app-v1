import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('masterWmsUsers').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Type</th>
        <th>Language</th>
        <th>Group</th>
        <th>Company</th>
        <th>Employee ID</th>
        <th>Sex</th>
        <th>Email</th>
        <th>Mobile</th>
        <th>System</th>
        <th>Contact</th>
        <th>Center</th>
        <th>Branch</th>
        <th>Expiry Date</th>
        <th>Charge Rate</th>
        <th>Multi Login</th>
        <th>Remarks</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.userId}</td>
          <td>{entry.userName}</td>
          <td>{entry.userType}</td>
          <td>{entry.languageNo}</td>
          <td>{entry.groupId}</td>
          <td>{entry.companyNo}</td>
          <td>{entry.employeeId}</td>
          <td>{entry.sex}</td>
          <td>{entry.email}</td>
          <td>{entry.mobileNo}</td>
          <td>{entry.defaultSystem}</td>
          <td>{entry.defaultContactId}</td>
          <td>{entry.defaultCenterNo}</td>
          <td>{entry.defaultBranchNo}</td>
          <td>{entry.expiryDate}</td>
          <td>{entry.chargeRate}</td>
          <td>{entry.isMultiLogin}</td>
          <td>{entry.remarks}</td>
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
