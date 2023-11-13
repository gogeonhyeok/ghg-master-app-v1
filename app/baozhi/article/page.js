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
            key: 'subject',
            displayName: 'Subject'
          },
          {
            key: 'createDate',
            displayName: 'Create Date'
          }
        ]}
        searchModel={[
          {
            value: 'subject',
            displayName: 'Subject'
          }
        ]}
        db='ghg-baozhi-api-v1'
        collection='articles'
        baseUrl='/baozhi/article'
      />
    </>
  )
}