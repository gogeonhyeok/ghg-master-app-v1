import FarmList from './list';
import Link from 'next/link';

export default function FarmPage() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/farm/create">Create</Link>
        <Link href="/">Home</Link>
      </nav>
      <FarmList />
    </>
  );
}