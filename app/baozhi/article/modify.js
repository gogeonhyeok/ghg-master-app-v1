'use client'

import { modifyItemDetails, listItemDetails } from './actions'
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

export default ({ id }) => {
  const [itemDetails, setItemDetails] = useState({subject: '', content: ''})
  useEffect(() => {
    listItemDetails(id).then(response => setItemDetails(response))
  }, [])

  const router = useRouter()
  const onAction = async (data) => {
    await modifyItemDetails(id, data)
    router.back()
  }

  return (
    <form
      action={onAction}
      className='form'
    >
      {viewModel.map(model => {
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
      <div>
        <button type="submit">Submit</button>
        <Link href="/baozhi/article">Cancel</Link>
      </div>
    </form>
  );
}
