'use client'

import { addItem } from './actions'
import { useRouter } from 'next/navigation'

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
      <input name="subject" placeholder="Subject" />
      <input name="body" placeholder="Body" />
      <button type="submit">Submit</button>
    </form>
  );
}
