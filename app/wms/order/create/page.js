import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'orders',
  baseUrl: '/wms/order',
  listModel: [
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
  ],
}
export default async () => {
  return (
    <>
      <Create viewModel={viewModel} />
    </>
  )
}
