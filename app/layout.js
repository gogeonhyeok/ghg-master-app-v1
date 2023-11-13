import '../styles/globals.css'
import SideBar from '../components/sidebar'
import Link from 'next/link'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'

const client = new MongoClient(process.env.MONGODB_URL)
const database = client.db('ghg-settings-api-v1')
let items = await database.collection('menus').find().toArray()
const sidebar = JSON.parse(JSON.stringify(items))
export default async function Layout({ children }) {
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