'use client'

import { addItem, listArticles } from './actions'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const viewModel = [
  {
    name: 'content',
    displayName: 'Content',
    displayType: 'textarea'
  },
  {
    name: 'createUser',
    displayName: 'CreateUser',
    displayType: 'input'
  },
]

export default () => {
  const [articles, setArticles] = useState([])
  useEffect(() => {
    listArticles().then(response => setArticles(response))
  }, [])

  const router = useRouter()
  const onAction = async (data) => {
    await addItem(data)
    router.push('/baozhi/comment')
  }

  return (
    <form
      action={onAction}
      className='form'
    >
      {viewModel.map(model => {
        switch(model.displayType) {
          case 'textarea':
            return (
              <label key={model.name}>
                {model.displayName}
                <textarea name={model.name} />
              </label>
            )
          default:
            return (
              <label key={model.name}>
                {model.displayName}
                <input name={model.name} />
              </label>
            )
        }
      })}
      <label>
        Article
        <select name="articleId">
          {articles.map(item => (<option key={item._id} value={item._id}>{item.subject}</option>))}
        </select>
      </label>
      <div>
        <button type="submit">Submit</button>
        <Link href="/baozhi/comment">Cancel</Link>
      </div>
    </form>
  );
}
