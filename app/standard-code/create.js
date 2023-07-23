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
  return (
    <form
      action={onAction}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4,
        margin: 24
      }}
    >
      <input name="codeId" placeholder="ID" />
      <input name="codeType" placeholder="Type" />
      <input name="codeDescription" placeholder="Description" />
      <input name="codeVariant" placeholder="Variant" />
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 16,
        marginRight: 24
      }}>
        <button type="submit">Submit</button>
        <Link href="/standard-code">Cancel</Link>
      </div>
    </form>
  );
}
