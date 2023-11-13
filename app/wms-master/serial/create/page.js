import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterWmsSerials',
  baseUrl: '/wms-master/serial',
  listModel: [
    {
      key: 'serialId',
      displayName: 'ID'
    },
    {
      key: 'contactId',
      displayName: 'Contact'
    },
    {
      key: 'createDate',
      displayName: 'Create Date'
    },
    {
      key: 'createUser',
      displayName: 'Create User'
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
