import ListFarm from './list';
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
        // class="flex fixed w-full items-center justify-between px-6 h-16 bg-white text-gray-700 border-b border-gray-200 z-10"
      >
        <Link href="/farm/create">Create</Link>
        <Link href="/">Home</Link>
      </nav>
      <ListFarm />
    </>
  );
}