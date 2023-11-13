import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterContacts',
  baseUrl: '/wms-master/contact',
  listModel: [
    {
      key: 'contactId',
      displayName: 'ID'
    },
    {
      key: 'contactName',
      displayName: 'Name'
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
