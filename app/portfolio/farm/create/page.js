import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-portfolio-api-v1',
  collection: 'farms',
  baseUrl: '/portfolio/farm',
  listModel: [
    {
      key: 'name',
      displayName: 'Name'
    },
    {
      key: 'description',
      displayName: 'Description'
    },
    {
      key: 'address',
      displayName: 'Address'
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
