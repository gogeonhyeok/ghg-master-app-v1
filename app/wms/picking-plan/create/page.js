import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'pickingPlans',
  baseUrl: '/wms/picking-plan',
  listModel: [
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
  ],
}
export default async () => {
  return (
    <>
      <Create viewModel={viewModel} />
    </>
  )
}
