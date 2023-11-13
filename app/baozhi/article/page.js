import List from '../../../components/list';
import { listItems, modifyItemDetails } from '../../actions';

const viewModel = {
  db: 'ghg-baozhi-api-v1',
  collection: 'articles',
  modifyUrl: '/baozhi/article/modify',
  createUrl: '/baozhi/article/create',
  detailUrl: '/baozhi/article/detail',
  searchModel: [
    {
      value: 'subject',
      displayName: 'Subject'
    }
  ],
  listModel: [
    {
      key: 'subject',
      displayName: 'Subject'
    },
    {
      key: 'createDate',
      displayName: 'Create Date'
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