import { addItem } from "../../../actions";
import Create from "../../../../components/create"
const viewModel = {
  db: 'ghg-master-api-v1',
  collection: 'orders',
  listUrl: '/wms-master/workflow',
  listModel: [
    {
      name: 'userId',
      displayName: 'ID'
    },
    {
      name: 'userName',
      displayName: 'Name'
    },
    {
      name: 'userType',
      displayName: 'Type'
    },
    {
      name: 'languageNo',
      displayName: 'Lang'
    },
    {
      name: 'groupId',
      displayName: 'Group'
    },
    {
      name: 'companyNo',
      displayName: 'Company'
    },
    {
      name: 'employeeId',
      displayName: 'Employee ID'
    },
    {
      name: 'sex',
      displayName: 'Sex'
    },
    {
      name: 'email',
      displayName: 'Email'
    },
    {
      name: 'mobileNo',
      displayName: 'Mobile'
    },
    {
      name: 'defaultSystem',
      displayName: 'Default System'
    },
    {
      name: 'defaultContactId',
      displayName: 'Default Contact'
    },
    {
      name: 'defaultCenterNo',
      displayName: 'Default Center'
    },
    {
      name: 'defaultBranchNo',
      displayName: 'Default Branch'
    },
    {
      name: 'expiryDate',
      displayName: 'Expiry Date'
    },
    {
      name: 'chargeRate',
      displayName: 'Charge Rate'
    },
    {
      name: 'isMultiLogin',
      displayName: 'Multi Login'
    },
    {
      name: 'remarks',
      displayName: 'Remarks'
    },
    {
      name: 'cancelTag',
      displayName: 'Cancel Tag'
    },
    {
      name: 'createDate',
      displayName: 'Create Date'
    },
    {
      name: 'createUser',
      displayName: 'Create User'
    },
    {
      name: 'updateDate',
      displayName: 'Update Date'
    },
    {
      name: 'updateUser',
      displayName: 'Update User'
    }
  ],
  addItem
}
export default async () => {
  return (
    <>
      <Create viewModel={viewModel} />
    </>
  )
}
