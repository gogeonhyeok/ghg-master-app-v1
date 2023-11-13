import Create from "../../../../components/server-create"
const viewModel = {
  db: 'ghg-itsm-api-v1',
  collection: 'companies',
  baseUrl: '/itsm/company',
  listModel: [
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
  ],
}
export default async () => {
  return (
    <>
      <Create viewModel={viewModel} />
    </>
  )
}
