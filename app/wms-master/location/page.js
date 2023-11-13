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
        ]}
        searchModel={[
          {
            value: 'locationNo',
            displayName: 'NO'
          }
        ]}
        db='ghg-master-api-v1'
        collection='locations'
        baseUrl='/wms-master/location'
      />
    </>
  )
}