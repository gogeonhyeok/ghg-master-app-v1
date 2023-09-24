import '../styles/globals.css'
import SideBar from '../components/sidebar'
import Link from 'next/link'

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Main</title>
      </head>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 4
        }}>
          <SideBar entry={[
            {
              href: '/',
              displayName: 'Home'
            }, {
              href: '/baozhi/article',
              displayName: 'Article',
              groupName: 'BaoZhi'
            }, {
              href: '/baozhi/comment',
              displayName: 'Comment',
              groupName: 'BaoZhi'
            }, {
              href: '/farm',
              displayName: 'Farm',
              groupName: 'Portfolio'
            }, {
              href: '/restaurant',
              displayName: 'Restaurant',
              groupName: 'Portfolio'
            }, {
              href: '/hotel',
              displayName: 'Hotel',
              groupName: 'Portfolio'
            }, {
              href: '/company',
              displayName: 'Company',
              groupName: 'Portfolio'
            }, {
              href: '/article',
              displayName: 'Article',
              groupName: 'Portfolio'
            }, {
              href: '/portfolio/product',
              displayName: 'Product',
              groupName: 'Portfolio'
            }, {
              href: '/request',
              displayName: 'Request',
              groupName: 'ITSM'
            }, {
              href: '/system',
              displayName: 'System',
              groupName: 'ITSM'
            }, {
              href: '/standard-code',
              displayName: 'Standard Code',
              groupName: 'ITSM'
            }, {
              href: '/support-type',
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
              href: '/department',
              displayName: 'Department',
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
            }, {
              href: '/flight',
              displayName: 'Flight',
              groupName: 'GDS'
            }, {
              href: '/airport',
              displayName: 'Airport',
              groupName: 'GDS'
            }, {
              href: '/partner',
              displayName: 'Partner',
              groupName: 'PFS'
            }, {
              href: '/payment-method',
              displayName: 'Payment Method',
              groupName: 'PFS'
            }, {
              href: '/user',
              displayName: 'User',
              groupName: 'Setting'
            }, {
              href: '/menu',
              displayName: 'Menu',
              groupName: 'Setting'
            },
          ]} />
          <div style={{
            marginLeft: 300,
            overflowX: 'scroll',
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
          }}>
            <nav
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 24,
                margin: 24
              }}
            >
              <Link href="/">Login</Link>
              <Link href="/">Setting</Link>
            </nav>
            <hr style={{ borderTop: '1px solid #bbb' }} />
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}