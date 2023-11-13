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
            key: 'codeType',
            displayName: 'Type'
          },
          {
            key: 'codeId',
            displayName: 'ID'
          },
          {
            key: 'codeDescription',
            displayName: 'Description'
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
            value: 'codeType',
            displayName: 'Type'
          }
        ]}
        db='ghg-itsm-api-v1'
        collection='standardCodes'
        baseUrl='/itsm/standard-code'
      />
    </>
  )
}