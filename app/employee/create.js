import { MongoClient } from 'mongodb';

export default async () => {
  async function onAction(data) {
    'use server';
    const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
    const database = client.db('ghg-master-api-v1');
    const result = await database.collection('companies').insertOne({
      name: data.get('name'),
      headquarter: data.get('headquarter'),
      description: data.get('description')
    });
  }

  return (
    <form
      action={onAction}
      style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      <input name="name" placeholder="Name" />
      <input name="headquarter" placeholder="HQ" />
      <input name="description" placeholder="Description" />
      <button type="submit">Submit</button>
    </form>
  );
}
