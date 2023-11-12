

import Create from '../../../../components/create';
import { addItem } from '../../../actions';
export default () => {
  const viewModel = {
    db: 'ghg-settings-api-v1',
    collection: 'menus',
    listUrl: '/settings/menu',
    listModel: [
      {
        name: 'href',
        displayName: 'HREF',
        displayType: 'input'
      },
      {
        name: 'displayName',
        displayName: 'Name',
        displayType: 'input'
      },
      {
        name: 'groupName',
        displayName: 'Group',
        displayType: 'input'
      },
    ],
    addItem: addItem
  }
  return (
    <>
      <Create viewModel={viewModel} />
    </>
  );
}
