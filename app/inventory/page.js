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
        <Link href="/inventory/create">Create</Link>
        <Link href="/">Home</Link>
      </nav>
      <List />
    </>
  );
}