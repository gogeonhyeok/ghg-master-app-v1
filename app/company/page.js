import CompanyList from './list';
import Link from 'next/link';

export default function CompanyPage() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/company/create">Create</Link>
        <Link href="/">Home</Link>
      </nav>
      <CompanyList />
    </>
  )
}