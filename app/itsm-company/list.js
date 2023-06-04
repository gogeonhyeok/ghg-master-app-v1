import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('masterCompanies').aggregate([
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
    <table className="table">
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Code</th>
        <th>Address 1</th>
        <th>Address 2</th>
        <th>Address 3</th>
        <th>Country</th>
        <th>Parent</th>
        <th>Fax</th>
        <th>Tel</th>
        <th>Zip</th>
        <th>Create User</th>
        <th>Create Date</th>
        <th>Update User</th>
        <th>Update Date</th>
      </tr>
      {items.map(entry => (
        <tr>
          <td>{entry.companyId}</td>
          <td>{entry.companyName}</td>
          <td>{entry.companyCode}</td>
          <td>{entry.addressCity}</td>
          <td>{entry.addressStreet}</td>
          <td>{entry.addressEtc}</td>
          <td>{entry.countryCode}</td>
          <td>{entry.parentCompanyId}</td>
          <td>{entry.faxNo}</td>
          <td>{entry.telNo}</td>
          <td>{entry.zipCode}</td>
          <td>{entry.createUser}</td>
          <td>{entry.createDate}</td>
          <td>{entry.updateUser}</td>
          <td>{entry.updateDate}</td>
        </tr>
      ))}
    </table>
  );
}
