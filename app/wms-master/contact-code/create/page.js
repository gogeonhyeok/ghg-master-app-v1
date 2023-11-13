import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterContactCodes',
  baseUrl: '/wms-master/contact-code',
  listModel: [
    {
      key: 'contactId',
      displayName: 'Contact'
    },
    {
      key: 'codeType',
      displayName: 'Type'
    },
    {
      key: 'codeId',
      displayName: 'ID'
    },
    {
      key: 'codeDesc',
      displayName: 'Desc'
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
