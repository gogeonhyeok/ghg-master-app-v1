import { MongoClient } from 'mongodb';

export default async () => {
  async function onAction(data) {
    'use server';
    const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
    const database = client.db('ghg-master-api-v1');
    const result = await database.collection('articles').insertOne({
      subject: data.get('subject'),
      body: data.get('body'),
    });
  }
  return (
    <form
      action={onAction}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4
      }}
    >
      <input name="subject" placeholder="Subject" />
      <input name="body" placeholder="Body" />
      <button type="submit">Submit</button>
    </form>
  );
}
