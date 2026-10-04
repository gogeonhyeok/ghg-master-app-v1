import { redirect } from 'next/navigation'
import { MongoClient } from 'mongodb';
import Link from 'next/link'
import 'dotenv/config'


export default ({ viewModel }) => {
  async function addItem(formData) {
    'use server'
    const client = new MongoClient(process.env.MONGODB_URL)
    try {
      const database = client.db(viewModel.db)
      await database.collection(viewModel.collection).insertOne({
        ...Object.fromEntries(formData.entries()),
        createDate: new Date()
      })
      redirect(viewModel.baseUrl)
    } finally {
      client.close()
    }
  }

  return (
    <form
      action={addItem}
      className='form'
    >
      <div>
        <button type="submit">Submit</button>
        <Link href={viewModel.baseUrl}>Cancel</Link>
      </div>
      {viewModel.listModel.map(model => {
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
    </form>
  );
}
