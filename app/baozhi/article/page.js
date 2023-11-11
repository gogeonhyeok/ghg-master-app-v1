import List from '../../../components/list';
import { listItems, modifyItemDetails } from './actions';

export default () => {
  return (
    <>
      <List
        viewModel={[
          {
            key: 'subject',
            displayName: 'Subject'
          },
          {
            key: 'createDate',
            displayName: 'Create Date'
          }
        ]}
        searchModel={[
          {
            value: 'subject',
            displayName: 'Subject'
          },
          {
            value: 'content',
            displayName: 'Content'
          }
        ]}
        listItems={listItems}
        modifyItemDetails={modifyItemDetails}
        modifyUrl='/baozhi/article/modify'
        detailUrl='/baozhi/article/detail'
        createUrl='/baozhi/article/create'
      />
    </>
  )
}