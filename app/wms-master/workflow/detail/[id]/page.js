import Detail from '../../../../../components/server-detail'
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
    ]
  }
  return (
    <>
      <Detail viewModel={viewModel} />
    </>
  )
}