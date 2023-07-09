import '../styles/globals.css'
import SideBar from '../components/side-bar'

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Next.jsx</title>
      </head>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 4
        }}>
          <SideBar />
          <div>
          {children}
          </div>
        </div>
      </body>
    </html>
  )
}