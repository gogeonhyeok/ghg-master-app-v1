'use client'
import { listItems, modifyItemDetails } from './actions'
import { useEffect, useState } from 'react'
import Link from 'next/link'

let viewModel = [
  {
    key: 'article',
    displayName: 'Article'
  },
  {
    key: 'content',
    displayName: 'Content'
  },
  {
    key: 'createUser',
    displayName: 'Create User'
  },
  {
    key: 'createDate',
    displayName: 'Create Date'
  },
]

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

  const onDelete = async (id) => {
    modifyItemDetails(id, {cancelFlag: true})
    listItems().then(response => setItems(response))
  }

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
            <option value="subject">Subject</option>
            <option value="content">Content</option>
          </select>
          <input name="searchText" />
          <button type="submit">Search</button>
        </form>
        <Link href="/baozhi/comment/create">Create</Link>
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
              <td>
                <ul>
                  <li><Link href={"/baozhi/comment/modify/" + entry._id}>Modify</Link></li>
                  <li><button onClick={() => onDelete(entry._id)}>Delete</button></li>
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
