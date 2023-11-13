import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'contactSettings',
  baseUrl: '/wms-master/contact-setting',
  listModel: [
    {
      key: 'contactId',
      displayName: 'Contact'
    },
    {
      key: 'parameterId',
      displayName: 'Key'
    },
    {
      key: 'settingValue',
      displayName: 'Value'
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
