import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-itsm-api-v1',
  collection: 'departments',
  baseUrl: '/itsm/department',
  listModel: [
    {
      key: 'subject',
      displayName: 'Subject'
    },
    {
      key: 'content',
      displayName: 'Content',
      displaytype: 'textarea'
    }
  ],
}
export default async () => {
  return (
    <>
      <Create viewModel={viewModel} />
    </>
  )
}
