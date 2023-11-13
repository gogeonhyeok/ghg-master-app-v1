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
            key: 'userId',
            displayName: 'ID'
          },
          {
            key: 'userName',
            displayName: 'Name'
          },
          {
            key: 'userType',
            displayName: 'Type'
          },
          {
            key: 'languageNo',
            displayName: 'Lang'
          },
          {
            key: 'groupId',
            displayName: 'Group'
          },
          {
            key: 'companyNo',
            displayName: 'Company'
          },
          {
            key: 'employeeId',
            displayName: 'Employee ID'
          },
          {
            key: 'sex',
            displayName: 'Sex'
          },
          {
            key: 'email',
            displayName: 'Email'
          },
          {
            key: 'mobileNo',
            displayName: 'Mobile'
          },
          {
            key: 'defaultSystem',
            displayName: 'Default System'
          },
          {
            key: 'defaultContactId',
            displayName: 'Default Contact'
          },
          {
            key: 'defaultCenterNo',
            displayName: 'Default Center'
          },
          {
            key: 'defaultBranchNo',
            displayName: 'Default Branch'
          },
          {
            key: 'expiryDate',
            displayName: 'Expiry Date'
          },
          {
            key: 'chargeRate',
            displayName: 'Charge Rate'
          },
          {
            key: 'isMultiLogin',
            displayName: 'Multi Login'
          },
          {
            key: 'remarks',
            displayName: 'Remarks'
          },
          {
            key: 'cancelTag',
            displayName: 'Cancel Tag'
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
          }
        ]}
        searchModel={[
          {
            value: 'userId',
            displayName: 'ID'
          }
        ]}
        db='ghg-master-api-v1'
        collection='masterWmsUsers'
        baseUrl='/wms-master/wms-user'
      />
    </>
  )
}