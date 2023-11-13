import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-portfolio-api-v1',
  collection: 'hotels',
  baseUrl: '/portfolio/hotel',
  listModel: [
    {
      key: 'name',
      displayName: 'Name'
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
