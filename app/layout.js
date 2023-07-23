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
          <SideBar />
          <div style={{
            marginLeft: 300,
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
              <Link href="/">Menu</Link>
            </nav>
            <hr style={{ borderTop: '1px solid #bbb' }} />
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}