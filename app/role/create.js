'use client'

import { addItem } from './actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const viewModel = [
  {
    key: 'role',
    displayName: 'Name'
  },
  {
    key: 'roleDesc',
    displayName: 'Description'
  },
]

export default () => {
  const router = useRouter()
  const onAction = async (data) => {
    await addItem(data)
    router.back()
  }

  return (
    <form
      action={onAction}
      className='form'
    >
      {viewModel.map(model => (<input key={model.key} name={model.key} placeholder={model.displayName} />))}
      <div>
        <button type="submit">Submit</button>
        <Link href="/role">Cancel</Link>
      </div>
    </form>
  );
}
