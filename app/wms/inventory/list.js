import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('inventories').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Contact</th>
        <th>Center</th>
        <th>Product</th>
        <th>Grade</th>
        <th>State</th>
        <th>Qty</th>
        <th>SKU</th>
        <th>SKU Qty</th>
        <th>PW Plan Qty</th>
        <th>PI Plan Qty</th>
        <th>Ownership</th>
        <th>Status</th>
        <th>GR Date</th>
        <th>Location</th>
        <th>GR No</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.invenNo}</td>
          <td>{entry.contactId}</td>
          <td>{entry.centerNo}</td>
          <td>{entry.productId}</td>
          <td>{entry.productGrade}</td>
          <td>{entry.productState}</td>
          <td>{entry.qty}</td>
          <td>{entry.skuId}</td>
          <td>{entry.skuQty}</td>
          <td>{entry.pwPlanQty}</td>
          <td>{entry.piPlanQty}</td>
          <td>{entry.invenOwnership}</td>
          <td>{entry.invenStatus}</td>
          <td>{entry.moveDate}</td>
          <td>{entry.locationId}</td>
          <td>{entry.grNo}</td>
          <td>{entry.createDate}</td>
          <td>{entry.createUser}</td>
          <td>{entry.updateDate}</td>
          <td>{entry.updateUser}</td>
        </tr>
      ))}
    </table>
  );
}
