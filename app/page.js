import Link from 'next/link';

export default () => {
  return (
    <nav className="nav">
      <Link href="/menu">Menu</Link>
      <Link href="/farm">Farm</Link>
      <Link href="/restaurant">Restaurant</Link>
      <Link href="/hotel">Hotel</Link>
      <Link href="/company">Company</Link>
      <Link href="/product">Product</Link>
      <section>
        <h1>ITSM</h1>
        <Link href="/request">Request</Link>
        <Link href="/system">System</Link>
        <Link href="/standard-code">Standard Code</Link>
        <Link href="/support-type">Support Type</Link>
        <Link href="/request-type">Request Type</Link>
        <Link href="/role">Role</Link>
        <Link href="/itsm-company">Company</Link>
        <Link href="/employee">Employee</Link>
      </section>
      <section>
        <h1>WMS Master</h1>
        <Link href="/center">Center</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/wms-company">Company</Link>
        <Link href="/contact-code">Contact Code</Link>
        <Link href="/contact-setting">Contact Setting</Link>
        <Link href="/location">Location</Link>
        <Link href="/lot">Lot</Link>
        <Link href="/pallet">Pallet</Link>
        <Link href="/plan-rule">Plan Rule</Link>
        <Link href="/serial">Serial</Link>
        <Link href="/sku">SKU</Link>
        <Link href="/wms-user">User</Link>
        <Link href="/party">Party</Link>
        <Link href="/wms-product">Product</Link>
        <Link href="/order-type">Order Type</Link>
        <Link href="/workflow">Workflow</Link>
      </section>
      <section>
        <h1>WMS</h1>
        <Link href="/order">Order</Link>
        <Link href="/order-item">Order Item</Link>
        <Link href="/picking-plan">Picking Plan</Link>
        <Link href="/picking">Picking</Link>
        <Link href="/gi">GI (Good Issuing)</Link>
        <Link href="/gr">GR (Good Receiving)</Link>
        <Link href="/put-away-plan">Put-Away Plan</Link>
        <Link href="/put-away">Put-Away</Link>
        <Link href="/inventory">Inventory</Link>
      </section>
    </nav>
  );
}
