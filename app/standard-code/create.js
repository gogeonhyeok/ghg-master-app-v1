'use client'

import { addItem } from './actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default () => {
  const router = useRouter()
  const onAction = async (data) => {
    await addItem(data)
    router.back()
  }
  const viewModel = [
    {
      name: 'codeId',
      placeholder: 'ID'
    },
    {
      name: 'codeType',
      placeholder: 'Type'
    },
    {
      name: 'codeDescription',
      placeholder: 'Description'
    },
    {
      name: 'codeVariant',
      placeholder: 'Variant'
    }
  ]
  return (
    <form
      action={onAction}
      className='form'
    >
      {viewModel.map(model => (<input name={model.name} placeholder={model.placeholder} />))}
      <div>
        <button type="submit">Submit</button>
        <Link href="/standard-code">Cancel</Link>
      </div>
    </form>
  );
}
