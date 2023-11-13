import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-portfolio-api-v1',
  collection: 'products',
  baseUrl: '/portfolio/product',
  listModel: [
    {
      header: 'Name',
      key: 'name'
    },
    {
      header: 'Description',
      key: 'description'
    },
    {
      header: 'Display Name',
      key: 'displayName'
    },
    {
      header: 'Price',
      key: 'price'
    },
    {
      header: 'Currency',
      key: 'currency'
    },
    {
      header: 'Quantity',
      key: 'quantity'
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
