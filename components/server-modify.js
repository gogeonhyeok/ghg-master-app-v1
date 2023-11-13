import { listItemDetails } from '../app/actions'
import { redirect } from 'next/navigation'
import { MongoClient, ObjectId } from 'mongodb';
import Link from 'next/link'
import 'dotenv/config'

export default async ({ viewModel }) => {
  const itemDetails = await listItemDetails(viewModel.db, viewModel.collection, viewModel.id)
  async function modifyItem(formData) {
    'use server'
    const client = new MongoClient(process.env.MONGODB_URL)
    const updateData = Object.fromEntries(formData.entries())
    Object.keys(updateData).filter(key => key.includes("$ACTION")).forEach(key => delete updateData[key])
    try {
      Object.fromEntries(formData.entries())
      const database = client.db(viewModel.db)
      await database.collection(viewModel.collection).updateOne({
        _id: new ObjectId(viewModel.id)
      }, {
        $set: {
          ...updateData,
          updateDate: new Date()
        }
      });
      redirect(viewModel.baseUrl)
    } finally {
      client.close()
    }
  }

  return (
    <form
      action={modifyItem}
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
              <label key={model.key}>
                {model.displayName}
                <textarea name={model.key} defaultValue={itemDetails[model.key]} />
              </label>
            )
          default:
            return (
              <label key={model.key}>
                {model.displayName}
                <input name={model.key} defaultValue={itemDetails[model.key]} />
              </label>
            )
        }
      })}
    </form>
  );
}
