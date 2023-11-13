'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default ({ viewModel }) => {
  const router = useRouter()
  const onAction = async (data) => {
    await viewModel.addItem(viewModel.db, viewModel.collection, data)
    router.push(viewModel.listUrl)
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
