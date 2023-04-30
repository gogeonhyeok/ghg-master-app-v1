import styles from '../styles/Home.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Master</h1>
        <Link href="/farm">Farm</Link>
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
      </main>
    </div>
  );
}
