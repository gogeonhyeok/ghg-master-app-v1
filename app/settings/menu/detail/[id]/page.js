import Detail from '../../../../../components/detail';
import { listItemDetails } from '../../../../actions';

export default async props => {
  const params = await props.params;
  const viewModel = {
    id: params.id,
    db: 'ghg-settings-api-v1',
    collection: 'menus',
    listUrl: '/settings/menu',
    modifyUrl: '/settings/menu/modify',
    listModel: [
      {
        name: 'href',
        displayName: 'HREF'
      },
      {
        name: 'displayName',
        displayName: 'Name'
      },
      {
        name: 'groupName',
        displayName: 'Group'
      }
    ],
    listItemDetails: listItemDetails
  }
  return (
    <>
      <Detail viewModel={viewModel}/>
    </>
  );
};
