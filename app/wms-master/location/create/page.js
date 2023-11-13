import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'locations',
  baseUrl: '/wms-master/location',
  listModel: [
    {
      key: 'centerNo',
      displayName: 'Center'
    },
    {
      key: 'locationNo',
      displayName: 'NO'
    },
    {
      key: 'locationType',
      displayName: 'Type'
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
