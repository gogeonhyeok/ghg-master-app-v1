import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('masterProducts').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Contact</th>
        <th>No</th>
        <th>Name</th>
        <th>Code</th>
        <th>Group</th>
        <th>Class</th>
        <th>Type</th>
        <th>Length</th>
        <th>Width</th>
        <th>Height</th>
        <th>Weight</th>
        <th>Volume</th>
        <th>Base Price</th>
        <th>Shelf Life</th>
        <th>SKU</th>
        <th>Use SKU Barcode</th>
        <th>Status</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.productId}</td>
          <td>{entry.contactId}</td>
          <td>{entry.productNo}</td>
          <td>{entry.productName}</td>
          <td>{entry.productCode}</td>
          <td>{entry.productGroup}</td>
          <td>{entry.productClass}</td>
          <td>{entry.productType}</td>
          <td>{entry.length}</td>
          <td>{entry.width}</td>
          <td>{entry.height}</td>
          <td>{entry.weight}</td>
          <td>{entry.volume}</td>
          <td>{entry.basePrice}</td>
          <td>{entry.shelfLife}</td>
          <td>{entry.dfSkuId}</td>
          <td>{entry.isUseSkuBarcode}</td>
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
