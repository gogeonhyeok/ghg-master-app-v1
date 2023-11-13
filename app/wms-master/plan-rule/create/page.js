import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterWmsPlanRules',
  baseUrl: '/wms-master/plan-rule',
  listModel: [
    {
      key: 'planRuleId',
      displayName: 'ID'
    },
    {
      key: 'contactId',
      displayName: 'Contact'
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
