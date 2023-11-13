import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-portfolio-api-v1',
  collection: 'companies',
  baseUrl: '/portfolio/company',
  listModel: [
    {
      key: 'name',
      displayName: 'Name'
    },
    {
      key: 'headquarter',
      displayName: 'HQ'
    },
    {
      key: 'found',
      displayName: 'Found'
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
