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
        const name = model.key || model.name;
        switch(model.displayType) {
          case 'textarea':
            return (
              <label key={name}>
                {model.displayName}
                <textarea name={name} />
              </label>
            )
          case 'file':
            return (
              <label key={name}>
                {model.displayName}
                <input type="file" accept="image/*" capture="environment" name={name} />
              </label>
            )
          default:
            return (
              <label key={name}>
                {model.displayName}
                <input name={name} />
              </label>
            )
        }
      })}
    </form>
  );
}
