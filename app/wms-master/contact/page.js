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
            key: 'contactId',
            displayName: 'ID'
          },
          {
            key: 'contactName',
            displayName: 'Name'
          },
        ]}
        searchModel={[
          {
            value: 'contactId',
            displayName: 'ID'
          }
        ]}
        db='ghg-master-api-v1'
        collection='contacts'
        baseUrl='/wms-master/contact'
      />
    </>
  )
}