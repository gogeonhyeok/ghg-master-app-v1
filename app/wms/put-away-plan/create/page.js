import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'putAwayPlans',
  baseUrl: '/wms/put-away-plan',
  listModel: [
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
      displayName: 'Inven'
    },
    {
      key: 'qty',
      displayName: 'Qty'
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
