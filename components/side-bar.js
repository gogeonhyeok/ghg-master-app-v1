import Link from 'next/link';

export default () => {
  let viewModel = [
    {
      href: '/',
      displayName: 'Home'
    }, {
      href: '/menu',
      displayName: 'Menu'
    }, {
      href: '/farm',
      displayName: 'Farm'
    }, {
      href: '/restaurant',
      displayName: 'Restaurant'
    }, {
      href: '/hotel',
      displayName: 'Hotel'
    }, {
      href: '/company',
      displayName: 'Company'
    }, {
      href: '/product',
      displayName: 'Product'
    }, {
      href: '/article',
      displayName: 'Article'
    }, {
      href: '/request',
      displayName: 'Request',
      groupName: 'ITSM'
    }, {
      href: '/system',
      displayName: 'System',
      groupName: 'ITSM'
    }, {
      href: 'standard-code',
      displayName: 'Standard Code',
      groupName: 'ITSM'
    }, {
      href: 'support-type',
      displayName: 'Support Type',
      groupName: 'ITSM'
    }, {
      href: '/request-type',
      displayName: 'Request Type',
      groupName: 'ITSM'
    }, {
      href: '/role',
      displayName: 'Role',
      groupName: 'ITSM'
    }, {
      href: '/itsm-company',
      displayName: 'Company',
      groupName: 'ITSM'
    }, {
      href: '/employee',
      displayName: 'Employee',
      groupName: 'ITSM'
    }, {
      href: '/center',
      displayName: 'Center',
      groupName: 'WMS Master'
    }, {
      href: '/contact',
      displayName: 'Contact',
      groupName: 'WMS Master'
    }, {
      href: '/wms-company',
      displayName: 'Company',
      groupName: 'WMS Master'
    }, {
      href: '/contact-code',
      displayName: 'Contact Code',
      groupName: 'WMS Master'
    }, {
      href: '/contact-setting',
      displayName: 'Contact Setting',
      groupName: 'WMS Master'
    }, {
      href: '/location',
      displayName: 'Location',
      groupName: 'WMS Master'
    }, {
      href: '/lot',
      displayName: 'Lot',
      groupName: 'WMS Master'
    }, {
      href: '/pallet',
      displayName: 'Pallet',
      groupName: 'WMS Master'
    }, {
      href: '/plan-rule',
      displayName: 'Plan Rule',
      groupName: 'WMS Master'
    }, {
      href: '/serial',
      displayName: 'Serial',
      groupName: 'WMS Master'
    }, {
      href: '/sku',
      displayName: 'SKU',
      groupName: 'WMS Master'
    }, {
      href: '/wms-user',
      displayName: 'User',
      groupName: 'WMS Master'
    }, {
      href: '/party',
      displayName: 'Party',
      groupName: 'WMS Master'
    }, {
      href: '/wms-user',
      displayName: 'Product',
      groupName: 'WMS Master'
    }, {
      href: '/order-type',
      displayName: 'Order Type',
      groupName: 'WMS Master'
    }, {
      href: '/workflow',
      displayName: 'Workflow',
      groupName: 'WMS Master'
    }, {
      href: '/order',
      displayName: 'Order',
      groupName: 'WMS'
    }, {
      href: '/picking-plan',
      displayName: 'Picking Plan',
      groupName: 'WMS'
    }, {
      href: '/picking',
      displayName: 'Picking',
      groupName: 'WMS'
    }, {
      href: '/gi',
      displayName: 'GI (Good Issuing)',
      groupName: 'WMS'
    }, {
      href: '/gr',
      displayName: 'GR (Good Receiving)',
      groupName: 'WMS'
    }, {
      href: '/put-away-plan',
      displayName: 'Put-Away Plan',
      groupName: 'WMS'
    }, {
      href: '/put-away',
      displayName: 'Put-Away',
      groupName: 'WMS'
    }, {
      href: '/inventory',
      displayName: 'Inventory',
      groupName: 'WMS'
    },
  ];
  const groupBy = viewModel.reduce((prev, curr) => {
    const { groupName } = curr
    prev[groupName] = prev[groupName] ?? []
    prev[groupName].push(curr)
    return prev
  }, {});
  return (
    <nav className="nav">
      {
        Object.keys(groupBy).map(groupName => {
          if (groupName !== 'undefined') {
            return (
              <section>
                <hr style={{ borderTop: '1px solid #bbb' }} />
                <h1>{groupName}</h1>
                {groupBy[groupName].map(model => (
                  <Link href={model.href}>{model.displayName}</Link>
                ))}
              </section>
            )
          } else {
            return (
              groupBy[groupName].map(model => (
                <Link href={model.href}>{model.displayName}</Link>
              ))
            )
          }
        })
      }
    </nav>
  );
}
