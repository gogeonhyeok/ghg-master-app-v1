'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default ({ viewModel }) => {
  const [itemDetails, setItemDetails] = useState({ subject: '', content: '' })
  useEffect(() => {
    viewModel.listItemDetails(viewModel.db, viewModel.collection, viewModel.id).then(response => setItemDetails(response))
  }, [])

  const router = useRouter()
  const onDelete = async (id) => {
    await viewModel.modifyItemDetails(viewModel.db, viewModel.collection, id, { cancelTag: true })
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
        <Link href={viewModel.listUrl}>List</Link>
        <Link href={`${viewModel.modifyUrl}/${viewModel.id}`}>Modify</Link>
        <button onClick={() => onDelete(viewModel.id)}>Delete</button>
      </div>
      <dl style={{
        margin: 24
      }}>
        {viewModel.listModel.map(model => (
          <section key={model._id}>
            <dt>{model.displayName}</dt>
            <dd>{itemDetails[model.name]}</dd>
          </section>
        ))}
      </dl>
    </>
  );
}
