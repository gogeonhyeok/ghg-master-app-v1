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
      <input name="name" placeholder="Name" />
      <input name="description" placeholder="Description" />
      <input name="displayName" placeholder="Display Name" />
      <input name="price" placeholder="Price" />
      <input name="currency" placeholder="Currency" />
      <input name="quantity" placeholder="Quantity" />
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 16,
        marginRight: 24
      }}>
        <button type="submit">Submit</button>
        <Link href="/product">Cancel</Link>
      </div>
    </form>
  );
}
