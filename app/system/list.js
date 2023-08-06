'use client'
import { listItems } from './actions'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default () => {
  const [items, setItems] = useState([])
  useEffect(() => {
    listItems().then(response => setItems(response))
  }, [])

  const onAction = async (data) => {
    listItems(data).then(response => setItems(response))
  }
  const viewModel = [
    {
      key: 'systemName',
      displayName: 'Name'
    },
    {
      key: 'parentSystemName',
      displayName: 'Parent System'
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
  ]
  return (
    <>
      <form
        action={onAction}
        style={{
          paddingLeft: 24,
          display: 'flex',
          justifyContent: 'flex-end',
          marginRight: 24,
          marginTop: 24,
          gap: 16
        }}
      >
        <select name="searchType">
          <option value="systemName">Name</option>
        </select>
        <input name="searchText" />
        <button type="submit">Search</button>
        <Link href="/system/create">Create</Link>
        <Link href="/system/create">Prev</Link>
        <Link href="/system/create">Next</Link>
      </form>
      <table className="table">
        <tr>
          {viewModel.map(item => <th>{item.displayName}</th>)}
          <th>Actions</th>
        </tr>
        {items.map(entry => (
          <tr>
            {viewModel.map(item => <td>{entry[item.key]}</td>)}
            <td>Details</td>
          </tr>
        ))}
      </table>
    </>
  );
}