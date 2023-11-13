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
            key: "id",
            displayName: "ID"
          },
          {
            key: "cancelTag",
            displayName: "Cancel Tag"
          },
          {
            key: "updateDate",
            displayName: "Update Date"
          },
          {
            key: "updateUser",
            displayName: "Update User"
          }
        ]}
        searchModel={[
          {
            value: 'id',
            displayName: 'ID'
          }
        ]}
        db='ghg-itsm-api-v1'
        collection='departments'
        baseUrl='/itsm/department'
      />
    </>
  )
}