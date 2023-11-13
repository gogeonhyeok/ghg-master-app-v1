import List from '../../../components/server-list'

export default async ({ searchParams }) => {
  const page = parseInt(searchParams.page)
  const searchData = {
    searchType: searchParams.searchType,
    searchText: searchParams.searchText
  }
  return (
    <>
      <List
        page={page}
        searchData={searchData}
        listModel={[
          {
            key: 'contactId',
            displayName: 'Contact'
          },
          {
            key: 'parameterId',
            displayName: 'Key'
          },
          {
            key: 'settingValue',
            displayName: 'Value'
          },
        ]}
        searchModel={[
          {
            value: 'contactId',
            displayName: 'Contact'
          }
        ]}
        db='ghg-master-api-v1'
        collection='contactSettings'
        baseUrl='/wms-master/contact-setting'
      />
    </>
  )
}