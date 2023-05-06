import ProductList from './list';
import Link from 'next/link';

export default function ProductPage() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/product/create">Create</Link>
        <Link href="/">Home</Link>
      </nav>
      <ProductList />
    </>
  )
}