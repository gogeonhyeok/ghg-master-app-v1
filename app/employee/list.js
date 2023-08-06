'use client'
import { listItems } from './actions'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default () => {
  const [items, setItems] = useState([])
  const [index, setIndex] = useState(1)
  const [formData, setFormData] = useState({})
  useEffect(() => {
    listItems().then(response => setItems(response))
  }, [])

  const onAction = async (data) => {
    setFormData(data)
    listItems(formData).then(response => setItems(response))
  }

  const onPrev = async () => {
    setIndex(index > 0 ? index - 1 : 0)
    listItems(formData, index, 100).then(response => setItems(response))
  }

  const onNext = async () => {
    setIndex(index + 1)
    listItems(formData, index, 100).then(response => setItems(response))
  }
  let viewModel = [
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
      key: "createDate",
      displayName: "Create Date"
    },
    {
      key: "createUser",
      displayName: "Create User"
    },
    {
      key: "updateDate",
      displayName: "Update Date"
    },
    {
      key: "updateUser",
      displayName: "Update User"
    }
  ]
  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignContent: 'center',
        marginRight: 24,
        marginTop: 24,
        gap: 16
      }}>
        <form
          action={onAction}
          style={{
            paddingLeft: 24,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 16
          }}
        >
          <select name="searchType">
            <option value="userId">User ID</option>
            <option value="displayName">Display Name</option>
          </select>
          <input name="searchText" />
          <button type="submit">Search</button>
        </form>
        <Link href="/standard-code/create">Create</Link>
        <button onClick={onPrev}>Prev</button>
        <button onClick={onNext}>Next</button>
      </div>
      <table className="table">
        <tr>
          {viewModel.map(item => <th>{item.displayName}</th>)}
        </tr>
        {items.map(entry => (
          <tr>
            {viewModel.map(item => <td>{entry[item.key]}</td>)}
          </tr>
        ))}
      </table>
    </>
  );
}
