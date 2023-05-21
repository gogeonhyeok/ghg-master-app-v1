import List from './list';
import Link from 'next/link';

export default function CenterPage() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 24,
          margin: 24
        }}
      >
        <Link href="/center/create">Create</Link>
        <Link href="/">Home</Link>
      </nav>
      <List />
    </>
  )
}