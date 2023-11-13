import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'masterWmsCompanies',
  baseUrl: '/wms-master/wms-company',
  listModel: [
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
  ],
}
export default async () => {
  return (
    <>
      <Create viewModel={viewModel} />
    </>
  )
}
