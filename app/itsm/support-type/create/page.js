import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-itsm-api-v1',
  collection: 'supportTypes',
  baseUrl: '/itsm/support-type',
  listModel: [
    {
      key: 'supportTypeDescription',
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
