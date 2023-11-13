import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-portfolio-api-v1',
  collection: 'companies',
  baseUrl: '/portfolio/company',
  listModel: [
    {
      header: 'Subject',
      key: 'subject'
    },
    {
      header: 'Body',
      key: 'body'
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
