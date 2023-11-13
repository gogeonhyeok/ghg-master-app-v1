import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterParties',
  baseUrl: '/wms-master/party',
  listModel: [
    {
      key: 'partyId',
      displayName: 'ID'
    },
    {
      key: 'partyNo',
      displayName: 'NO'
    },
    {
      key: 'partyName',
      displayName: 'Name'
    },
    {
      key: 'contactId',
      displayName: 'Contact'
    },
    {
      key: 'addr1',
      displayName: 'Addr1'
    },
    {
      key: 'addr2',
      displayName: 'Addr2'
    },
    {
      key: 'addr3',
      displayName: 'Addr3'
    },
    {
      key: 'addr4',
      displayName: 'Addr4'
    },
    {
      key: 'tel',
      displayName: 'Tel'
    },
    {
      key: 'country',
      displayName: 'Country'
    },
    {
      key: 'zipCode',
      displayName: 'ZIP'
    },
    {
      key: 'contactPerson',
      displayName: 'Contact Person'
    },
    {
      key: 'status',
      displayName: 'Status'
    },
  ],
}
export default async () => {
  return (
    <>
      <Create viewModel={viewModel} />
    </>
  )
}
