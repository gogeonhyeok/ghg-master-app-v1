export default () => {
  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      <input name="centerNo" placeholder="Center No" class="text-2xl shadow border p-2 rounded" />
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
