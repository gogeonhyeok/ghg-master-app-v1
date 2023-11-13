import Modify from '../../../../../components/server-modify'
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
    ]
  }
  return (
    <>
      <Modify viewModel={viewModel} />
    </>
  )
}