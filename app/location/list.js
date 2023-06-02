import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('locations').find().limit(100).toArray();
  return (
    <table className='table'>
      <tr>
        <th>Center No</th>
        <th>Location No</th>
        <th>Location Type</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.centerNo}</td>
          <td>{entry.locationNo}</td>
          <td>{entry.locationType}</td>
        </tr>
      ))}
    </table>
  );
}
