import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('masterEmployees').aggregate([
    {
      '$lookup': {
        'from': 'masterCompanies',
        'localField': 'companyId',
        'foreignField': 'companyId',
        'as': 'masterCompanies'
      }
    },
    {
      '$addFields': {
        'companyName': {
          '$getField': {
            'field': 'companyName',
            'input': {
              '$arrayElemAt': ['$masterCompanies', 0]
            }
          }
        }
      }
    },
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
              '$arrayElemAt': ['$masterEmployees', 0]
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
              '$arrayElemAt': ['$masterEmployees', 0]
            }
          }
        }
      }
    },
    {
      '$project': {
        'masterCompanies': 0,
        'masterEmployees': 0
      }
    }
  ]).limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>ID</th>
        <th>User ID</th>
        <th>Display Name</th>
        <th>Company</th>
        <th>Language</th>
        <th>Time Zone</th>
        <th>Cancel Tag</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.empId}</td>
          <td>{entry.userId}</td>
          <td>{entry.displayName}</td>
          <td>{entry.companyName}</td>
          <td>{entry.language}</td>
          <td>{entry.timezone}</td>
          <td>{entry.cancelTag}</td>
          <td>{entry.createDate}</td>
          <td>{entry.createUser}</td>
          <td>{entry.updateDate}</td>
          <td>{entry.updateUser}</td>
        </tr>
      ))}
    </table>
  );
}
