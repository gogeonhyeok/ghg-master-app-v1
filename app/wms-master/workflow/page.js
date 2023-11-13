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
            key: 'workflowId',
            displayName: 'ID'
          },
          {
            key: 'workflowName',
            displayName: 'Name'
          },
          {
            key: 'workflowType',
            displayName: 'Type'
          },
          {
            key: 'contactId',
            displayName: 'Contact'
          },
          {
            key: 'fromDate',
            displayName: 'From'
          },
          {
            key: 'thruDate',
            displayName: 'Thru'
          },
          {
            key: 'createDate',
            displayName: 'Create Date'
          },
          {
            key: 'createUser',
            displayName: 'Create User'
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
            value: 'workflowName',
            displayName: 'Name'
          }
        ]}
        db='ghg-master-api-v1'
        collection='masterWorkflows'
        baseUrl='/wms-master/workflow'
      />
    </>
  )
}