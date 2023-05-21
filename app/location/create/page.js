import Create from '../create';
import Link from 'next/link';

export default function LocationCreate() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/location">List</Link>
        <Link href="/">Home</Link>

      </nav>
      <Create />
    </>
  );
}
