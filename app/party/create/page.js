import Create from '../create';
import Link from 'next/link';

export default async () => {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/company">Back</Link>
        <Link href="/">Home</Link>

      </nav>
      <Create />
    </>
  );
}
