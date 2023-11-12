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
      key: 'role',
      displayName: 'Name'
    },
    {
      key: 'roleDesc',
      displayName: 'Description'
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
            <option value="role">Name</option>
            <option value="roleDesc">Description</option>
          </select>
          <input name="searchText" />
          <button type="submit">Search</button>
        </form>
        <Link href="/role/create">Create</Link>
        <button onClick={onPrev}>Prev</button>
        <button onClick={onNext}>Next</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            {viewModel.map(model => <th key={model.key}>{model.displayName}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(entry => (
            <tr key={entry._id}>
              {viewModel.map(model => <td key={entry._id + model.key}>{entry[model.key]}</td>)}
              <td>Modify</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
