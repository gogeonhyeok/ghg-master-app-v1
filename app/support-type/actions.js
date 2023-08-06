'use server'

import { MongoClient } from 'mongodb';

export async function addItem(data) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  await database.collection('requestSupportTypes').insertOne({
    codeId: data.get('codeId'),
    codeType: data.get('codeType'),
    codeDescription: data.get('codeDescription'),
    codeVariant: data.get('codeVariant'),
  });
}

export async function listItems(data, curr, size) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  let stages = [
    {
      '$addFields': {
        'updateDate': {
          '$ifNull': [
            '$updateDate',
            '$createDate'
          ]
        },
        'updateUser': {
          '$ifNull': [
            '$updateUser',
            '$createUser'
          ]
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
  ]

  if(data !== undefined && data instanceof FormData && data.has('searchType') && data.has('searchText') && data.get('searchText') !== '') {
    stages.unshift({
      '$match': {
        [data.get('searchType')]: data.get('searchText')
      }
    })
  }
  let items = await database.collection('requestSupportTypes')
      .aggregate(stages)
      .skip(curr !== undefined && size !== undefined ? curr * size : 0)
      .limit(size !== undefined ? size : 100)
      .toArray();
  return JSON.parse(JSON.stringify(items))
}