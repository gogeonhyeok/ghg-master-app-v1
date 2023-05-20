import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('centers').find().toArray();
  return (
    <ul>
      {items.map((entry) => (
        <li>
          <h2>{entry.centerNo}</h2>
          <p>{entry.centerName}</p>
          <p>{entry.centerType}</p>
          <p>{entry.addr1}</p>
          <p>{entry.addr2}</p>
          <p>{entry.addr3}</p>
          <p>{entry.addr4}</p>
          <p>{entry.tel}</p>
          <p>{entry.fax}</p>
          <p>{entry.country}</p>
          <p>{entry.province}</p>
          <p>{entry.city}</p>
          <p>{entry.zipCode}</p>
          <p>{entry.contactPerson}</p>
          <p>{entry.mainCenterNo}</p>
          <p>{entry.ownershipType}</p>
          <p>{entry.vendorContactId}</p>
          <p>{entry.serverTimeDiffHh}</p>
          <p>{entry.serverTimeDiffMm}</p>
          <p>{entry.relatedBranchNo}</p>
          <p>{entry.dfReceivingDock}</p>
          <p>{entry.dfPickingZone}</p>
          <p>{entry.dfCancelZone}</p>
          <p>{entry.dfShippingDock}</p>
          <p>{entry.volume}</p>
          <p>{entry.volumeUom}</p>
          <p>{entry.longitude}</p>
          <p>{entry.latitude}</p>
          <p>{entry.plantCode}</p>
          <p>{entry.storageLocation}</p>
          <p>{entry.status}</p>
          <p>{entry.createDate}</p>
          <p>{entry.createUser}</p>
          <p>{entry.updateDate}</p>
          <p>{entry.updateUser}</p>
          <p>{entry.timeZoneId}</p>
        </li>
      ))}
    </ul>
  );
}
