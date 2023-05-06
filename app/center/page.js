import ListCenter from './list';
import Link from 'next/link';

export default function CenterPage() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/center/create">Create</Link>
        <Link href="/">Home</Link>
      </nav>
      <ListCenter />
    </>
  )
}