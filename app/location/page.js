import ListLocation from './list';
import Link from 'next/link';

export default function LocationPage() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/location/create">Create</Link>
        <Link href="/">Home</Link>
      </nav>
      <ListLocation />
    </>
  );
}