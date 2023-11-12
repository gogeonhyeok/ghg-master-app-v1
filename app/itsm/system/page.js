import List from '../../../components/list'
import { listItems } from './actions'
import { modifyItemDetails } from '../../actions'

const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterSystems',
  modifyUrl: '/itsm/system/modify',
  detailUrl: '/itsm/system/detail',
  createUrl: '/itsm/system/create',
  searchModel: [
    {
      value: 'systemName',
      displayName: 'Name'
    }
  ],
  listModel: [
    {
      key: 'systemName',
      displayName: 'Name'
    },
    {
      key: 'parentSystemName',
      displayName: 'Parent System'
    },
    {
      key: 'updateDate',
      displayName: 'Update Date'
    },
    {
      key: 'updateUser',
      displayName: 'Update User'
    }
  ],
  listItems,
  modifyItemDetails
}

export default () => {
  return (
    <>
      <List viewModel={viewModel} />
    </>
  )
}