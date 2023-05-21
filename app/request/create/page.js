import Link from 'next/link';
import Create from '../create';
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
        <Link href="/center">List</Link>
      </nav>
      <Create />
    </>
  );
}
