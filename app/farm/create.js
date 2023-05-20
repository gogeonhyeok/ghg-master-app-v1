import { MongoClient } from 'mongodb';

export default  () => {
  async function onAction(data) {
    'use server';
    const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
    const database = client.db('ghg-master-api-v1');
    const result = await database.collection('farms').insertOne({
      name: data.get('name'),
      address: data.get('address')
    });
    console.log(result);
  }
  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
      action={onAction}
    >
      <input name="name" placeholder="Name" />
      <input name="address" placeholder="Address" />
      <button type="submit">Submit</button>
    </form>
  );
}
