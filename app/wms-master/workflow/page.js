import List from '../../components/list';
import { listItems, modifyItemDetails } from '../actions';

const viewModel = {
  db:"ghg-master-api-v1",
  collection:"wmsMasterWorkflows",
  modifyUrl: '/workflow/modify',
  detailUrl: '/workflow/detail',
  createUrl: '/workflow/create',
  searchModel: [
    {
      value: 'workflowName',
      displayName: 'Name'
    }
  ],
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

export default () => {
  return (
    <>
      <List
        viewModel={viewModel}
        listItems={listItems}
        modifyItemDetails={modifyItemDetails}
      />
    </>
  )
}