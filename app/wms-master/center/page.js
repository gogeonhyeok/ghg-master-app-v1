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
        ]}
        searchModel={[
          {
            value: 'centerNo',
            displayName: 'NO'
          }
        ]}
        db='ghg-master-api-v1'
        collection='centers'
        baseUrl='/wms-master/center'
      />
    </>
  )
}