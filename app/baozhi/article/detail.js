'use client'

import { modifyItemDetails, listItemDetails } from './actions'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const viewModel = [
  {
    name: 'subject',
    displayName: 'Subject'
  },
  {
    name: 'content',
    displayName: 'Content'
  },
  {
    name: 'createDate',
    displayName: 'Create Date'
  },
  {
    name: 'updateDate',
    displayName: 'Update Date'
  }
]

export default ({ id }) => {
  const [itemDetails, setItemDetails] = useState({subject: '', content: ''})
  useEffect(() => {
    listItemDetails(id).then(response => setItemDetails(response))
  }, [])

  const router = useRouter()
  const onDelete = async (id) => {
    await modifyItemDetails(id, {cancelTag: true})
    router.back()
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
        <Link href="/baozhi/article">List</Link>
        <Link href={"/baozhi/article/modify/" + id}>Modify</Link>
        <button onClick={() => onDelete(id)}>Delete</button>
      </div>
      <dl style={{
        margin: 24
      }}>
        {viewModel.map(model => (<><dt>{model.displayName}</dt><dd>{itemDetails[model.name]}</dd></>))}
      </dl>
    </>
  );
}
