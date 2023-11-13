import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterWorkflows',
  baseUrl: '/wms-master/workflow',
  listModel: [
    {
      name: 'workflowId',
      displayName: 'ID',
    },
    {
      name: 'workflowName',
      displayName: 'Name',
    },
    {
      name: 'workflowType',
      displayName: 'Type',
    },
    {
      name: 'contactId',
      displayName: 'Contact',
    },
    {
      name: 'fromDate',
      displayName: 'From',
    },
    {
      name: 'thruDate',
      displayName: 'Thru',
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
