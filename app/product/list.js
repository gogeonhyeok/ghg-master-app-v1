'use client'
import { listItems } from './actions'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default () => {
  const [items, setItems] = useState([])
  useEffect(() => {
    listItems().then(response => setItems(response))
  }, [])

  const onAction = async (data) => {
    listItems(data).then(response => setItems(response))
  }
  let viewModel = [
    {
      header: 'Name',
      key: 'name'
    },
    {
      header: 'Description',
      key: 'description'
    },
    {
      header: 'Display Name',
      key: 'displayName'
    },
    {
      header: 'Price',
      key: 'price'
    },
    {
      header: 'Currency',
      key: 'currency'
    },
    {
      header: 'Quantity',
      key: 'quantity'
    },
  ]
  return (
    <>
      <form
        action={onAction}
        style={{
          paddingLeft: 24,
          display: 'flex',
          justifyContent: 'flex-end',
          marginRight: 24,
          marginTop: 24,
          gap: 16
        }}
      >
        <select name="searchType">
          <option value="name">Name</option>
          <option value="displayName">Display Name</option>
          <option value="description">Description</option>
        </select>
        <input name="searchText" />
        <button type="submit">Search</button>
        <Link href="/product/create">Create</Link>
      </form>
      <table className="table">
        <tr>
          {viewModel.map(item => <th>{item.header}</th>)}
        </tr>
        {items.map(entry => (
          <tr>
            {viewModel.map(item => <td>{entry[item.key]}</td>)}
          </tr>
        ))}
      </table>
      <ul style={{
        display: 'flex',
        gap: 24,
        justifyContent: 'flex-end',
        marginBottom: 16,
        marginRight: 24
      }}>
        <li><button>Prev</button></li>
        <li><button>1</button></li>
        <li><button>2</button></li>
        <li><button>3</button></li>
        <li><button>4</button></li>
        <li><button>5</button></li>
        <li><button>6</button></li>
        <li><button>7</button></li>
        <li><button>8</button></li>
        <li><button>9</button></li>
        <li><button>10</button></li>
        <li><button>Next</button></li>
      </ul>
    </>
  );
}
