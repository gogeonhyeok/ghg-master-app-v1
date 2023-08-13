'use client'

import { addItem } from './actions'
import { useRouter } from 'next/navigation'
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

export default () => {
  const router = useRouter()
  const onAction = async (data) => {
    await addItem(data)
    router.push('/baozhi/article')
  }

  return (
    <form
      action={onAction}
      className='form'
    >
      <div>
        <button type="submit">Submit</button>
        <Link href="/baozhi/article">Cancel</Link>
      </div>
      {viewModel.map(model => {
        switch(model.displayType) {
          case 'textarea':
            return (
              <label key={model.name}>
                {model.displayName}
                <textarea name={model.name} />
              </label>
            )
          default:
            return (
              <label key={model.name}>
                {model.displayName}
                <input name={model.name} />
              </label>
            )
        }
      })}
    </form>
  );
}
