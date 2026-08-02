import { useState } from 'react';
import Link from 'next/link';
import styles from './Menu.module.css';

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={styles.navbar}>
      <button className={styles.hamburger} onClick={toggleMenu}>
        ☰
      </button>
      {isOpen && (
        <ul className={styles.navList}>
          <li className={styles.navItem}><Link href="/checkout">Checkout Page</Link></li>
          <li className={styles.navItem}><Link href="/singapore-airlines">Singapore Airlines Landing Page</Link></li>
          <li className={styles.navItem}><Link href="/currency-exchange">Currency Exchange Rates Page</Link></li>
          <li className={styles.navItem}><Link href="/checkout-integration">Checkout Integration Sample</Link></li>
          <li className={styles.navItem}><Link href="/nearby-restaurants">Nearby Restaurants</Link></li>
        </ul>
      )}
    </nav>
  );
};

export default Menu;
