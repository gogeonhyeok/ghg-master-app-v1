'use server'

import { MongoClient } from 'mongodb';

export async function addItem(data) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  await database.collection('masterSystems').insertOne({
    systemName: data.get('systemName'),
    parentSystemId: data.get('parentSystemId'),
  });
}

export async function listItems(data) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  let stages = [
    {
      '$lookup': {
        'from': 'masterSystems',
        'localField': 'parentSystemId',
        'foreignField': 'systemId',
        'as': 'masterSystems'
      }
    },
    {
      '$addFields': {
        'parentSystemName': {
          '$getField': {
            'field': 'systemName',
            'input': {
              '$arrayElemAt': ['$masterSystems', 0]
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
        'masterSystems': 0,
        'masterEmployees': 0
      }
    }
  ]

  if(data !== undefined && data instanceof FormData && data.has('searchType') && data.has('searchText') && data.get('searchText') !== '') {
    stages.unshift({
      '$match': {
        [data.get('searchType')]: data.get('searchText')
      }
    })
  }
  let items = await database.collection('masterSystems').aggregate(stages).limit(100).toArray();
  return JSON.parse(JSON.stringify(items))
}