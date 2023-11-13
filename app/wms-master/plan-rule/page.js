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
            key: 'planRuleId',
            displayName: 'ID'
          },
          {
            key: 'contactId',
            displayName: 'Contact'
          },
          {
            key: 'createDate',
            displayName: 'Create Date'
          },
          {
            key: 'createUser',
            displayName: 'Create User'
          },
        ]}
        searchModel={[
          {
            value: 'contactId',
            displayName: 'Contact'
          }
        ]}
        db='ghg-master-api-v1'
        collection='masterWmsPlanRules'
        baseUrl='/wms-master/plan-rule'
      />
    </>
  )
}