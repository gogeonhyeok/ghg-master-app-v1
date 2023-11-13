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
            key: 'name',
            displayName: 'Name'
          },
          {
            key: 'headquarter',
            displayName: 'HQ'
          },
          {
            key: 'found',
            displayName: 'Found'
          },
        ]}
        searchModel={[
          {
            value: 'name',
            displayName: 'Name'
          }
        ]}
        db='ghg-portfolio-api-v1'
        collection='companies'
        baseUrl='/portfolio/company'
      />
    </>
  )
}