import Link from 'next/link'
import { listItems } from '../app/actions'
import Table from './server-table'

export default async ({ page, searchData, listModel, searchModel, db, collection, baseUrl }) => {
  const items = await listItems(db, collection, searchData, page > 0 ? page : 0, 100)
  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignContent: 'center',
        marginRight: 24,
        marginTop: 24,
        gap: 16
      }}>
        <form
          style={{
            paddingLeft: 24,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 16
          }}
        >
          <select name="searchType">
            {searchModel.map(entry => (
              <option key={entry.value} value={entry.value}>{entry.displayName}</option>
            ))}
          </select>
          <input name="searchText" />
          <button type="submit">Search</button>
        </form>
        <Link href={`${baseUrl}/create`}>Create</Link>
        <Link href={`${baseUrl}?page=${parseInt(page) > 0 ? parseInt(page) - 1 : 0}`}>Prev</Link>
        <Link href={`${baseUrl}?page=${parseInt(page) > 0 ? parseInt(page) + 1 : 1}`}>Next</Link>
      </div>
      <Table
        viewModel={listModel}
        dataSource={items}
        detailUrl='${baseUrl}/detail'
      />
    </>
  )
}