import Detail from '../../../../../components/server-detail'
export default ({ params }) => {
  const viewModel = {
    id: params.id,
    db: 'ghg-baozhi-api-v1',
    collection: 'articles',
    baseUrl: '/baozhi/article',
    listModel: [
      {
        key: 'subject',
        displayName: 'Subject'
      },
      {
        key: 'content',
        displayName: 'Content',
        displayType: 'textarea'
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
  return (
    <>
      <Detail viewModel={viewModel} />
    </>
  )
}