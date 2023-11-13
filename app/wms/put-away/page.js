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
            key: 'pwNo',
            displayName: 'ID'
          },
          {
            key: 'centerNo',
            displayName: 'Center'
          },
          {
            key: 'contactId',
            displayName: 'Contact'
          },
          {
            key: 'invenNo',
            displayName: 'Inven'
          },
          {
            key: 'qty',
            displayName: 'QTY'
          },
        ]}
        searchModel={[
          {
            value: 'centerNo',
            displayName: 'Center'
          }
        ]}
        db='ghg-master-api-v1'
        collection='putAways'
        baseUrl='/wms/put-away'
      />
    </>
  )
}