import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('masterWmsCompanies').find().limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Region</th>
        <th>Group</th>
        <th>Type</th>
        <th>Code</th>
        <th>Country</th>
        <th>Language</th>
        <th>Currency</th>
        <th>Date Format</th>
        <th>Address 1</th>
        <th>Address 2</th>
        <th>Address 3</th>
        <th>Address 4</th>
        <th>Zip</th>
        <th>Contact Person</th>
        <th>Tel</th>
        <th>Fax</th>
        <th>Email</th>
        <th>Website</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.companyNo}</td>
          <td>{entry.companyName}</td>
          <td>{entry.regionNo}</td>
          <td>{entry.companyGroup}</td>
          <td>{entry.companyType}</td>
          <td>{entry.companyCode}</td>
          <td>{entry.countryNo}</td>
          <td>{entry.languageNo}</td>
          <td>{entry.currencyNo}</td>
          <td>{entry.dateFormat}</td>
          <td>{entry.addr1}</td>
          <td>{entry.addr2}</td>
          <td>{entry.addr3}</td>
          <td>{entry.addr4}</td>
          <td>{entry.zipCode}</td>
          <td>{entry.contactPerson}</td>
          <td>{entry.tel}</td>
          <td>{entry.fax}</td>
          <td>{entry.email}</td>
          <td>{entry.www}</td>
        </tr>
      ))}
    </table>
  );
}
