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
            key: 'partyId',
            displayName: 'ID'
          },
          {
            key: 'partyNo',
            displayName: 'NO'
          },
          {
            key: 'partyName',
            displayName: 'Name'
          },
          {
            key: 'contactId',
            displayName: 'Contact'
          },
          {
            key: 'addr1',
            displayName: 'Addr1'
          },
          {
            key: 'addr2',
            displayName: 'Addr2'
          },
          {
            key: 'addr3',
            displayName: 'Addr3'
          },
          {
            key: 'addr4',
            displayName: 'Addr4'
          },
          {
            key: 'tel',
            displayName: 'Tel'
          },
          {
            key: 'country',
            displayName: 'Country'
          },
          {
            key: 'zipCode',
            displayName: 'ZIP'
          },
          {
            key: 'contactPerson',
            displayName: 'Contact Person'
          },
          {
            key: 'status',
            displayName: 'Status'
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
          },
        ]}
        searchModel={[
          {
            value: 'partyName',
            displayName: 'Name'
          }
        ]}
        db='ghg-master-api-v1'
        collection='masterParties'
        baseUrl='/wms-master/party'
      />
    </>
  )
}