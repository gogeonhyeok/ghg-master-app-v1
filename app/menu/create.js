import { MongoClient } from 'mongodb';

export default () => {
  const onAction = async (data) => {
    'use server'
    const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
    const database = client.db('ghg-master-api-v1');
    const result = await database.collection('menus').insertOne({
      name: data.get('name')
    });
  }
  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
      action={onAction}
    >
      <input name="name" placeholder="Name" class="text-2xl shadow border p-2 rounded" />
      <button type="submit">Submit</button>
    </form>
  );
}
