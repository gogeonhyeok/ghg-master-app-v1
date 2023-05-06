import styles from '../styles/Home.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <nav style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      padding: 24
    }}>
      <Link href="/farm">Farm</Link>
      <Link href="/menu">Menu</Link>
      <Link href="/user">User</Link>
      <Link href="/company">Company</Link>
      <Link href="/center">Center</Link>
      <Link href="/contact">Contact</Link>
      <Link href="/product">Product</Link>
      <Link href="/contact-code">Contact Code</Link>
      <Link href="/contact-setting">Contact Setting</Link>
      <Link href="/location">Location</Link>
      <Link href="/lot">Lot</Link>
      <Link href="/pallet">Pallet</Link>
      <Link href="/plan-rule">Plan Rule</Link>
      <Link href="/serial">Serial</Link>
      <Link href="/sku">SKU</Link>
      <Link href="/picking-plan">Picking Plan</Link>
      <Link href="/picking">Picking</Link>
      <Link href="/gi">GI (Good Issuing)</Link>
      <Link href="/gr">GR (Good Receiving)</Link>
      <Link href="/put-away-plan">Put-Away Plan</Link>
      <Link href="/put-away">Put-Away</Link>
      <Link href="/inventory">Inventory</Link>
    </nav>
  );
}
