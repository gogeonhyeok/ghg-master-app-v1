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
            key: "empId",
            displayName: "ID"
          },
          {
            key: "userId",
            displayName: "User ID"
          },
          {
            key: "displayName",
            displayName: "Display Name"
          },
          {
            key: "companyName",
            displayName: "Company"
          },
          {
            key: "language",
            displayName: "Language"
          },
          {
            key: "timezone",
            displayName: "TimeZone"
          },
          {
            key: "cancelTag",
            displayName: "Cancel Tag"
          },
          {
            key: "updateDate",
            displayName: "Update Date"
          },
          {
            key: "updateUser",
            displayName: "Update User"
          }
        ]}
        searchModel={[
          {
            value: 'empId',
            displayName: 'ID'
          }
        ]}
        db='ghg-itsm-api-v1'
        collection='employees'
        baseUrl='/itsm/employee'
      />
    </>
  )
}