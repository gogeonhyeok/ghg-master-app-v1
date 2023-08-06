'use server'

import { MongoClient } from 'mongodb';

export async function addItem(data) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  await database.collection('requestHeaders').insertOne({
    content: data.get('content'),
    subject: data.get('subject'),
    priority: data.get('priority'),
    requestId: data.get('requestId'),
    requestTo: data.get('requestTo'),
    createDate: data.get('createDate'),
    createUser: data.get('createUser'),
    lastStatus: data.get('lastStatus'),
    updateDate: data.get('updateDate'),
    updateUser: data.get('updateUser'),
    lastReplied: data.get('lastReplied'),
    responseTime: data.get('responseTime'),
    requestTypeId: data.get('requestTypeId'),
    resolutionTime: data.get('resolutionTime'),
    responseTimeReply: data.get('responseTimeReply'),
    responseTimeAssign: data.get('responseTimeAssign'),
    userResolutionTime: data.get('userResolutionTime'),
    expectedResolutionTime: data.get('expectedResolutionTime')
  });
}

export async function getStandardCodes(codeType) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  let items = await database.collection('masterStandardCodes').find({codeType: codeType}).toArray()
  return JSON.parse(JSON.stringify(items))
}

export async function getRequestTypes() {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  let items = await database.collection('requestTypes').find().toArray()
  return JSON.parse(JSON.stringify(items))
}

export async function getCompanies() {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  let items = await database.collection('masterCompanies').find().toArray()
  return JSON.parse(JSON.stringify(items))
}

export async function getSystems() {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  let items = await database.collection('masterSystems').find().toArray()
  return JSON.parse(JSON.stringify(items))
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

  let items = await database.collection('requestHeaders')
      .aggregate(stages)
      .skip(curr !== undefined && size !== undefined ? curr * size : 0)
      .limit(size !== undefined ? size : 100)
      .toArray();
  return JSON.parse(JSON.stringify(items))
}