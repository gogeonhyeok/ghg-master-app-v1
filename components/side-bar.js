import Link from 'next/link';

export default () => {
  let viewModel = [
    {
      href: '/menu',
      displayName: 'Menu'
    },
    {
      href: '/farm',
      displayName: 'Farm'
    },
    {
      href: '/restaurant',
      displayName: 'Restaurant'
    },
    {
      href: '/hotel',
      displayName: 'Hotel'
    },
    {
      href: '/company',
      displayName: 'Company'
    },
    {
      href: '/product',
      displayName: 'Product'
    },
    {
      href: '/article',
      displayName: 'Article'
    },
    {
      href: '/request',
      displayName: 'Request',
      groupName: 'ITSM'
    },
    {
      href: '/system',
      displayName: 'System',
      groupName: 'ITSM'
    },
    {
      href: 'standard-code',
      displayName: 'Standard Code',
      groupName: 'ITSM'
    },
    {
      href: 'support-type',
      displayName: 'Support Type',
      groupName: 'ITSM'
    },
    {
      href: '/request-type',
      displayName: 'Request Type',
      groupName: 'ITSM'
    },
    {
      href: '/role',
      displayName: 'Role',
      groupName: 'ITSM'
    },
    {
      href: '/itsm-company',
      displayName: 'Company',
      groupName: 'ITSM'
    },
    {
      href: '/employee',
      displayName: 'Employee',
      groupName: 'ITSM'
    },
    {
      href: '/center',
      displayName: 'Center',
      groupName: 'WMS'
    }, {
      href: '/contact',
      displayName: 'Contact',
      groupName: 'WMS'
    }, {
      href: '/wms-company',
      displayName: 'Company',
      groupName: 'WMS'
    }, {
      href: '/contact-code',
      displayName: 'Contact Code',
      groupName: 'WMS'
    }, {
      href: '/contact-setting',
      displayName: 'Contact Setting',
      groupName: 'WMS'
    }, {
      href: '/location',
      displayName: 'Location',
      groupName: 'WMS'
    }, {
      href: '/lot',
      displayName: 'Lot',
      groupName: 'WMS'
    }, {
      href: '/pallet',
      displayName: 'Pallet',
      groupName: 'WMS'
    }, {
      href: '/plan-rule',
      displayName: 'Plan Rule',
      groupName: 'WMS'
    }, {
      href: '/serial',
      displayName: 'Serial',
      groupName: 'WMS'
    }, {
      href: '/sku',
      displayName: 'SKU',
      groupName: 'WMS'
    }, {
      href: '/wms-user',
      displayName: 'User',
      groupName: 'WMS'
    }, {
      href: '/party',
      displayName: 'Party',
      groupName: 'WMS'
    }, {
      href: '/wms',
      displayName: 'Product',
      groupName: 'WMS'
    }, {
      href: '/order-type',
      displayName: 'Order Type',
      groupName: 'WMS'
    }, {
      href: '/workflow',
      displayName: 'Workflow',
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
