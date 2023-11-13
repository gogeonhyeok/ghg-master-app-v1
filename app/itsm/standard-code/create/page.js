import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-itsm-api-v1',
  collection: 'standardCodes',
  baseUrl: '/itsm/standard-code',
  listModel: [
    {
      key: 'codeType',
      displayName: 'Type'
    },
    {
      key: 'codeId',
      displayName: 'ID'
    },
    {
      key: 'codeDescription',
      displayName: 'Description'
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
