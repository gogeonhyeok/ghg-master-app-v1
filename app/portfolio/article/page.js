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
            header: 'Subject',
            key: 'subject'
          },
          {
            header: 'Body',
            key: 'body'
          },
        ]}
        searchModel={[
          {
            value: 'subject',
            displayName: 'Subject'
          }
        ]}
        db='ghg-portfolio-api-v1'
        collection='articles'
        baseUrl='/portfolio/article'
      />
    </>
  )
}