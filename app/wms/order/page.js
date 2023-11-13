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
            key: 'contactOrdNo',
            displayName: 'Order No'
          },
          {
            key: 'contactOrdType',
            displayName: 'Order Type'
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
            key: 'eta',
            displayName: 'ETA'
          },
          {
            key: 'dueDate',
            displayName: 'Due Date'
          },
          {
            key: 'ordReceiptDate',
            displayName: 'Receipt Date'
          },
          {
            key: 'isUrgent',
            displayName: 'Urgent'
          },
          {
            key: 'invenOwnership',
            displayName: 'Ownership'
          },
          {
            key: 'collectBillAmount',
            displayName: 'Collect Bill Amount'
          },
          {
            key: 'cancelTag',
            displayName: 'Cancel Tag'
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
            value: 'contactOrdNo',
            displayName: 'Order No'
          }
        ]}
        db='ghg-master-api-v1'
        collection='orders'
        baseUrl='/wms/order'
      />
    </>
  )
}