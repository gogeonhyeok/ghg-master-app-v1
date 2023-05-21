import List from './list';
import Link from 'next/link';

export default () => {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 24,
          margin: 24
        }}
      >
        <Link href="/">Home</Link>
        <Link href="/request/create">Create</Link>
      </nav>
      <List />
    </>
  )
}