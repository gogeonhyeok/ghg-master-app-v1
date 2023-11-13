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
            key: 'companyName',
            displayName: 'Name'
          },
          {
            key: 'companyCode',
            displayName: 'Code'
          },
          {
            key: 'addressCity',
            displayName: 'City'
          },
          {
            key: 'addressStreet',
            displayName: 'Street'
          },
          {
            key: 'addressEtc',
            displayName: 'Etc'
          },
          {
            key: 'countryCode',
            displayName: 'Country'
          },
          {
            key: 'parentCompanyId',
            displayName: 'Parent'
          },
          {
            key: 'faxNo',
            displayName: 'Fax'
          },
          {
            key: 'telNo',
            displayName: 'Tel'
          },
          {
            key: 'zipCode',
            displayName: 'Zip'
          },
          {
            key: 'updateUser',
            displayName: 'Update User'
          },
          {
            key: 'updateDate',
            displayName: 'Update Date'
          }
        ]}
        searchModel={[
          {
            value: 'companyName',
            displayName: 'Name'
          }
        ]}
        db='ghg-itsm-api-v1'
        collection='companies'
        baseUrl='/itsm/itsm-company'
      />
    </>
  )
}