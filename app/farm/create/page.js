import CreateFarm from '../create';
import Link from 'next/link';

export default function FarmCreate() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/farm">List</Link>
        <Link href="/">Home</Link>

      </nav>
      <CreateFarm />
    </>
  );
}
