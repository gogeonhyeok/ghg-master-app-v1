'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const viewModel = [
  {
    name: 'subject',
    displayName: 'Subject',
    displayType: 'input'
  },
  {
    name: 'content',
    displayName: 'Content',
    displayType: 'textarea'
  },
]

export default ({ viewModel }) => {
  const [itemDetails, setItemDetails] = useState({})
  useEffect(() => {
    viewModel.listItemDetails(viewModel.db, viewModel.collection, viewModel.id).then(response => setItemDetails(response))
  }, [])

  const router = useRouter()
  const onAction = async (data) => {
    await viewModel.modifyItemDetails(viewModel.db, viewModel.collection, viewModel.id, data)
    router.back()
  }

  return (
    <form
      action={onAction}
      className='form'
    >
      <div>
        <button type="submit">Submit</button>
        <Link href={viewModel.listUrl}>Cancel</Link>
      </div>
      {viewModel.listModel.map(model => {
        switch(model.displayType) {
          case 'textarea':
            return (
              <label key={model.name}>
                {model.displayName}
                <textarea name={model.name} value={itemDetails[model.name]} onChange={e => setItemDetails({...itemDetails, [model.name]: e.target.value})} />
              </label>
            )
          default:
            return (
              <label key={model.name}>
                {model.displayName}
                <input name={model.name} value={itemDetails[model.name]} onChange={e => setItemDetails({...itemDetails, [model.name]: e.target.value})} />
              </label>
            )
        }
      })}
    </form>
  );
}
