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
            key: 'piPlanNo',
            displayName: 'ID'
          },
          {
            key: 'contactId',
            displayName: 'Contact'
          },
          {
            key: 'centerNo',
            displayName: 'Center'
          },
          {
            key: 'invenNo',
            displayName: 'Inven'
          },
          {
            key: 'qty',
            displayName: 'Qty'
          },
          {
            key: 'planDate',
            displayName: 'Plan Date'
          },
          {
            key: 'planRule',
            displayName: 'Plan Rule'
          },
          {
            key: 'siNo',
            displayName: 'SI'
          },
          {
            key: 'prevProcessId',
            displayName: 'Prev Process'
          },
          {
            key: 'cancelTag',
            displayName: 'Cancel'
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
          },
        ]}
        searchModel={[
          {
            value: 'centerNo',
            displayName: 'Center'
          }
        ]}
        db='ghg-master-api-v1'
        collection='pickingPlans'
        baseUrl='/wms/picking-plan'
      />
    </>
  )
}