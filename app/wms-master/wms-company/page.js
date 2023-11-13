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
            key: 'companyNo',
            displayName: 'No'
          },
          {
            key: 'companyName',
            displayName: 'Name'
          },
          {
            key: 'regionNo',
            displayName: 'Region'
          },
          {
            key: 'companyGroup',
            displayName: 'Group'
          },
          {
            key: 'companyType',
            displayName: 'Type'
          },
          {
            key: 'companyCode',
            displayName: 'Code'
          },
          {
            key: 'countryNo',
            displayName: 'Country'
          },
          {
            key: 'languageNo',
            displayName: 'Lang'
          },
          {
            key: 'currencyNo',
            displayName: 'Currency'
          },
          {
            key: 'dateFormat',
            displayName: 'Date Format'
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
            key: 'zipCode',
            displayName: 'ZIP'
          },
          {
            key: 'contactPerson',
            displayName: 'Contact Person'
          },
          {
            key: 'tel',
            displayName: 'Tel'
          },
          {
            key: 'fax',
            displayName: 'Fax'
          },
          {
            key: 'email',
            displayName: 'Email'
          },
          {
            key: 'www',
            displayName: 'WWW'
          },
        ]}
        searchModel={[
          {
            value: 'companyNo',
            displayName: 'No'
          }
        ]}
        db='ghg-master-api-v1'
        collection='masterWmsCompanies'
        baseUrl='/wms-master/wms-product'
      />
    </>
  )
}