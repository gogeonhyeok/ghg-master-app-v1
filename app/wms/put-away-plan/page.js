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
            key: 'pwPlanNo',
            displayName: 'NO'
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
            displayName: 'Inven NO'
          },
          {
            key: 'qty',
            displayName: 'Qty'
          },
        ]}
        searchModel={[
          {
            value: 'centerNo',
            displayName: 'Center'
          }
        ]}
        db='ghg-master-api-v1'
        collection='putAwayPlans'
        baseUrl='/wms/put-away-plan'
      />
    </>
  )
}