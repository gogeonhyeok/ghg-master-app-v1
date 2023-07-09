import List from './list';
import Link from 'next/link';

export default () => {
  return (
    <>
      <nav className="navbar">
        <Link href="/">Home</Link>
        <Link href="/request/create">Create</Link>
      </nav>
      <List />
    </>
  )
}