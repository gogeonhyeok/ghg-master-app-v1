import '../styles/globals.css'
import SideBar from '../components/sidebar'
import Link from 'next/link'
import { promises as fs } from 'fs'

export default async function Layout({ children }) {
  const sidebar = await fs.readFile(process.cwd() + '/app/sidebar.json', 'utf8').then(res => JSON.parse(res));

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
          <SideBar entry={sidebar} />
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