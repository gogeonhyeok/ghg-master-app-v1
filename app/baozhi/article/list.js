'use client'
import { listItems, modifyItemDetails } from './actions'
import { useEffect, useState } from 'react'
import Table from '../../../components/table'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

let viewModel = [
  {
    key: 'subject',
    displayName: 'Subject'
  },
  {
    key: 'createDate',
    displayName: 'Create Date'
  }
]

export default () => {
  const [items, setItems] = useState([])
  const [index, setIndex] = useState(1)
  const [formData, setFormData] = useState({})
  const router = useRouter()
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

  const onModify = async (id) => {
    router.push('/baozhi/article/modify/' + id)
  }

  const onDetail = async (id) => {
    router.push('/baozhi/article/detail/' + id)
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
        <Link href="/baozhi/article/create">Create</Link>
        <button onClick={onPrev}>Prev</button>
        <button onClick={onNext}>Next</button>
      </div>
      <Table
        viewModel={viewModel}
        dataSource={items}
        onModify={onModify}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    </>
  );
}
