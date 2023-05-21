import Link from 'next/link';

export default () => {
  return (
    <nav style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      padding: 24
    }}>
      
      <Link href="/menu">Menu</Link>
      <Link href="/farm">Farm</Link>
      <Link href="/restaurant">Restaurant</Link>
      <Link href="/hotel">Hotel</Link>
      <section>
        <h1>ITSM</h1>
        <ul style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          padding: 24
        }}>
          <li><Link href="/request">Request</Link></li>
          <li><Link href="/system">System</Link></li>
          <li><Link href="/standard-code">Standard Code</Link></li>
          <li><Link href="/support-type">Support Type</Link></li>
        </ul>
      </section>
      <section>
        <h1>WMS Master</h1>
        <ul style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          padding: 24
        }}>
          <li><Link href="/company">Company</Link></li>
          <li><Link href="/center">Center</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li><Link href="/product">Product</Link></li>
          <li><Link href="/contact-code">Contact Code</Link></li>
          <li><Link href="/contact-setting">Contact Setting</Link></li>
          <li><Link href="/location">Location</Link></li>
          <li><Link href="/lot">Lot</Link></li>
          <li><Link href="/pallet">Pallet</Link></li>
          <li><Link href="/plan-rule">Plan Rule</Link></li>
          <li><Link href="/serial">Serial</Link></li>
          <li><Link href="/sku">SKU</Link></li>
        </ul>
      </section>
      <section>
        <h1>WMS Transactions</h1>
        <ul style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          padding: 24
        }}>
          <li><Link href="/order">Order</Link></li>
          <li><Link href="/picking-plan">Picking Plan</Link></li>
          <li><Link href="/picking">Picking</Link></li>
          <li><Link href="/gi">GI (Good Issuing)</Link></li>
          <li><Link href="/gr">GR (Good Receiving)</Link></li>
          <li><Link href="/put-away-plan">Put-Away Plan</Link></li>
          <li><Link href="/put-away">Put-Away</Link></li>
          <li><Link href="/inventory">Inventory</Link></li>
        </ul>
      </section>
    </nav>
  );
}
