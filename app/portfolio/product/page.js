import List from '../../../components/server-list'

export default async ({ searchParams }) => {
  const page = parseInt(searchParams.page)
  const searchData = {
    searchType: searchParams.searchType,
    searchText: searchParams.searchText
  }
  return (
    <>
      <List
        page={page}
        searchData={searchData}
        listModel={[
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
        ]}
        searchModel={[
          {
            value: 'name',
            displayName: 'Name'
          }
        ]}
        db='ghg-portfolio-api-v1'
        collection='products'
        baseUrl='/portfolio/product'
      />
    </>
  )
}