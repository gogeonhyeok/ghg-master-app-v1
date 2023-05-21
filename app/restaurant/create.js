export default async () => {
  async function onAction(data) {
    'use server';
    const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
    const database = client.db('ghg-master-api-v1');
    const result = await database.collection('restaurants').insertOne({
      centerNo: data.get('centerNo'),
      centerName: data.get('centerName'),
      centerType: data.get('centerType'),
      addr1: data.get('addr1'),
      addr2: data.get('addr2'),
      addr3: data.get('addr3'),
      addr4: data.get('addr4'),
      tel: data.get('tel'),
      fax: data.get('fax'),
      country: data.get('country'),
      province: data.get('province'),
      city: data.get('city'),
      zipCode: data.get('zipCode'),
      timeZone: data.get('timeZone'),
      contactPerson: data.get('contactPerson'),
      mainCenterNo: data.get('mainCenterNo'),
      ownershipType: data.get('ownershipType'),
      vendorContactId: data.get('vendorContactId'),
      volume: data.get('volume'),
      volumeUom: data.get('volumeUom'),
      longitude: data.get('longitude'),
      latitude: data.get('latitude'),
      plantCode: data.get('plantCode'),
      storageLocation: data.get('storageLocation'),
    });
  }
  return (
    <form
      action={onAction}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4
      }}
    >
      <input name="centerNo" placeholder="Center No" />
      <input name="centerName" placeholder="Center Name" />
      <input name="centerType" placeholder="Center Type" />
      <input name="addr1" placeholder="Address 1" />
      <input name="addr2" placeholder="Address 2" />
      <input name="addr3" placeholder="Address 3" />
      <input name="addr4" placeholder="Address 4" />
      <input name="tel" placeholder="Tel" />
      <input name="fax" placeholder="Fax" />
      <input name="country" placeholder="Country" />
      <input name="province" placeholder="Province" />
      <input name="city" placeholder="City" />
      <input name="zipCode" placeholder="Zip" />
      <input name="timeZone" placeholder="Time Zone" />
      <input name="contactPerson" placeholder="Contact Person" />
      <input name="mainCenterNo" placeholder="Main Center No" />
      <input name="ownershipType" placeholder="Ownership" />
      <input name="vendorContactId" placeholder="Vendor" />
      <input name="volume" placeholder="Volume" />
      <input name="volumeUom" placeholder="Voluem UOM" />
      <input name="longitude" placeholder="Longitude" />
      <input name="latitude" placeholder="Latitude" />
      <input name="plantCode" placeholder="Plant Code" />
      <input name="storageLocation" placeholder="Storage Location" />
      <button type="submit">Submit</button>
    </form>
  );
}
