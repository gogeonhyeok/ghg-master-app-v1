import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-itsm-api-v1',
  collection: 'requestTypes',
  baseUrl: '/itsm/request-type',
  listModel: [
    {
      key: 'requestTypeDescription',
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
