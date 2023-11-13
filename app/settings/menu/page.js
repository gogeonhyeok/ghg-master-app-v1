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
            key: 'href',
            displayName: 'HREF'
          },
          {
            key: 'displayName',
            displayName: 'Name'
          },
          {
            key: 'groupName',
            displayName: 'Group'
          },
        ]}
        searchModel={[
          {
            value: 'name',
            displayName: 'Name'
          }
        ]}
        db='ghg-settings-api-v1'
        collection='menus'
        baseUrl='/settings/menu'
      />
    </>
  )
}