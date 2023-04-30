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
      </main>
    </div>
  );
}
