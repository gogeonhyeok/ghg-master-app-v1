import List from '../../../components/list';
import { listItems, modifyItemDetails } from '../../actions';

const viewModel = {
  db: 'ghg-settings-api-v1',
  collection: 'menus',
  modifyUrl: '/settings/menu/modify',
  detailUrl: '/settings/menu/detail',
  createUrl: '/settings/menu/create',
  searchModel: [
    {
      value: 'name',
      displayName: 'Name'
    }
  ],
  listModel: [
    {
      key: 'href',
      displayName: 'HREF'
    },
    {
      key: 'displayName',
      displayName: 'Name'
    },
    {
      key: 'groupName',
      displayName: 'Group'
    },
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