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
            key: 'requestId',
            displayName: 'ID'
          },
          {
            key: 'subject',
            displayName: 'Subject'
          },
          {
            key: 'content',
            displayName: 'Content'
          },
          {
            key: 'updateDate',
            displayName: 'Update Date'
          },
          {
            key: 'updateUser',
            displayName: 'Update User'
          }
        ]}
        searchModel={[
          {
            value: 'requestId',
            displayName: 'ID'
          }
        ]}
        db='ghg-itsm-api-v1'
        collection='requests'
        baseUrl='/itsm/request'
      />
    </>
  )
}