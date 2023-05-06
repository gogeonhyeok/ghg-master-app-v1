import ListContact from './list';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/contact/create">Create</Link>
        <Link href="/">Home</Link>
      </nav>
      <ListContact />
    </>
  );
}