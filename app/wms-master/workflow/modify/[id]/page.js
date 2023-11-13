import Modify from '../../../../../components/server-modify'
export default ({ params }) => {
  const viewModel = {
    id: params.id,
    db: 'ghg-master-api-v1',
    collection: 'masterWorkflows',
    baseUrl: '/wms-master/workflow',
    listModel: [
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
    ]
  }
  return (
    <>
      <Modify viewModel={viewModel} />
    </>
  )
}