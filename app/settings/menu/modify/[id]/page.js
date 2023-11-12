'use client'

import Modify from '../../../../../components/modify';
import { listItemDetails, modifyItemDetails } from '../../../../actions';

export default ({ params }) => {
  const viewModel = {
    id: params.id,
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
      }
    ],
    modifyItemDetails: modifyItemDetails,
    listItemDetails: listItemDetails
  }
  return (
    <>
      <Modify viewModel={viewModel}/>
    </>
  );
}
