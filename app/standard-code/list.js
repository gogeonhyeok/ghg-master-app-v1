import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('masterStandardCodes').aggregate([
    {
      '$lookup': {
        'from': 'masterEmployees',
        'localField': 'createUser',
        'foreignField': 'empId',
        'as': 'masterEmployees'
      }
    },
    {
      '$addFields': {
        'createUser': {
          '$getField': {
            'field': 'displayName',
            'input': {
              '$arrayElemAt': [
                '$masterEmployees',
                0
              ]
            }
          }
        }
      }
    },
    {
      '$lookup': {
        'from': 'masterEmployees',
        'localField': 'updateUser',
        'foreignField': 'empId',
        'as': 'masterEmployees'
      }
    },
    {
      '$addFields': {
        'updateUser': {
          '$getField': {
            'field': 'displayName',
            'input': {
              '$arrayElemAt': [
                '$masterEmployees',
                0
              ]
            }
          }
        }
      }
    },
    {
      '$project': {
        'masterEmployees': 0
      }
    }
  ]).limit(100).toArray();
  return (
    <table style={{
      tableLayout: 'fixed',
      width: '100%',
      margin: 24
    }}>
      <tr style={{
        textAlign: 'left'
      }}>
        <th style={{
          padding: 4
        }}>Type</th>
        <th>ID</th>
        <th>Description</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td style={{
            padding: 4
          }}>{entry.codeType}</td>
          <td>{entry.codeId}</td>
          <td>{entry.codeDescription}</td>
          <td>{entry.createDate}</td>
          <td>{entry.createUser}</td>
          <td>{entry.updateDate}</td>
          <td>{entry.updateUser}</td>
        </tr>
      ))}
    </table>
  );
}
