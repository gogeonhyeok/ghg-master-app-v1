'use client'
import { useEffect, useState } from 'react'
import Table from './table'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default ({ viewModel, listItems, modifyItemDetails}) => {
  const [items, setItems] = useState([])
  const [index, setIndex] = useState(1)
  const [formData, setFormData] = useState({})
  const router = useRouter()
  useEffect(() => {
    listItems(viewModel.db, viewModel.collection).then(response => setItems(response))
  }, [])

  const onAction = async (data) => {
    setFormData(data)
    listItems(viewModel.db, viewModel.collection, formData).then(response => setItems(response))
  }

  const onPrev = async () => {
    setIndex(index > 0 ? index - 1 : 0)
    listItems(viewModel.db, viewModel.collection, formData, index, 100).then(response => setItems(response))
  }

  const onNext = async () => {
    setIndex(index + 1)
    listItems(viewModel.db, viewModel.collection, formData, index, 100).then(response => setItems(response))
  }

  const onDelete = async (id) => {
    modifyItemDetails(id, { cancelFlag: true })
    listItems(viewModel.db, viewModel.collection).then(response => setItems(response))
  }

  const onModify = async (id) => {
    router.push(`${viewModel.modifyUrl}/${id}`)
  }

  const onDetail = async (id) => {
    router.push(`${viewModel.detailUrl}/${id}`)
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
            {viewModel.searchModel.map(entry => (
              <option key={entry.value} value={entry.value}>{entry.displayName}</option>
            ))}
          </select>
          <input name="searchText" />
          <button type="submit">Search</button>
        </form>
        <Link href={viewModel.createUrl}>Create</Link>
        <button onClick={onPrev}>Prev</button>
        <button onClick={onNext}>Next</button>
      </div>
      <Table
        viewModel={viewModel.listModel}
        dataSource={items}
        onModify={onModify}
        onDelete={onDelete}
        onDetail={onDetail}
      />
    </>
  )
}