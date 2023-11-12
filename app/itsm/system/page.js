import List from '../../components/list'
import { listItems } from './actions'
import { modifyItemDetails } from '../actions'

const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterSystems',
  modifyUrl: '/wms-product/modify',
  detailUrl: '/wms-product/detail',
  createUrl: '/wms-product/create',
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
]}

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