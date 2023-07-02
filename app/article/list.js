import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('articles').find().toArray();
  return (
    <table className="table">
      <tr>
        <th>Subject</th>
        <th>Body</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.subject}</td>
          <td>{entry.body}</td>
        </tr>
      ))}
    </table>
  );
}
