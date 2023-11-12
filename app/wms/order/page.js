import { listItems, modifyItemDetails } from '../../actions';
import List from '../../../components/list';

const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'orders',
  modifyUrl: '/wms/order/modify',
  detailUrl: '/wms/order/detail',
  createUrl: '/wms/order/create',
  searchModel: [
    {
      value: 'contactOrdNo',
      displayName: 'Order No'
    }
  ],
  listModel: [
    {
      key: 'contactOrdNo',
      displayName: 'Order No'
    },
    {
      key: 'contactOrdType',
      displayName: 'Order Type'
    },
    {
      key: 'contactId',
      displayName: 'Contact'
    },
    {
      key: 'centerNo',
      displayName: 'Center'
    },
    {
      key: 'eta',
      displayName: 'ETA'
    },
    {
      key: 'dueDate',
      displayName: 'Due Date'
    },
    {
      key: 'ordReceiptDate',
      displayName: 'Receipt Date'
    },
    {
      key: 'isUrgent',
      displayName: 'Urgent'
    },
    {
      key: 'invenOwnership',
      displayName: 'Ownership'
    },
    {
      key: 'collectBillAmount',
      displayName: 'Collect Bill Amount'
    },
    {
      key: 'cancelTag',
      displayName: 'Cancel Tag'
    },
    {
      key: 'createDate',
      displayName: 'Create Date'
    },
    {
      key: 'createUser',
      displayName: 'Create User'
    },
  ],
  listItems,
  modifyItemDetails
}

export default async () => {
  return (
    <>
      <List viewModel={viewModel} />
    </>
  );
}
