import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'centers',
  baseUrl: '/wms-master/center',
  listModel: [
    {
      key: 'centerNo',
      displayName: 'NO'
    },
    {
      key: 'centerName',
      displayName: 'Name'
    },
    {
      key: 'centerType',
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
