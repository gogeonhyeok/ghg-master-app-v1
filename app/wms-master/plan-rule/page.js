import List from './list';
import Link from 'next/link';

export default () => {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/plan-rule/create">Create</Link>
        <Link href="/">Home</Link>
      </nav>
      <List />
    </>
  );
}