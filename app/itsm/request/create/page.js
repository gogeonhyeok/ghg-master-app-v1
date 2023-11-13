import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-itsm-api-v1',
  collection: 'requestTypes',
  baseUrl: '/itsm/request-type',
  listModel: [
    {
      key: 'requestId',
      displayName: 'ID'
    },
    {
      key: 'subject',
      displayName: 'Subject'
    },
    {
      key: 'content',
      displayName: 'Content'
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
