'use server'

import { MongoClient, ObjectId } from 'mongodb';

export async function addItem(data) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority")
  const database = client.db('ghg-baozhi-api-v1')
  await database.collection('comments').insertOne({
    ...Object.fromEntries(data.entries()),
    articleId: new ObjectId(data.get('articleId')),
    createDate: new Date()
  })
}

export async function listItems(data, curr, size) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority")
  const database = client.db('ghg-baozhi-api-v1')
  let stages = [
    {
      '$lookup': {
        'from': 'articles', 
        'localField': 'articleId', 
        'foreignField': '_id', 
        'as': 'article'
      }
    }, {
      '$addFields': {
        'article': {
          '$getField': {
            'field': 'subject', 
            'input': {
              '$arrayElemAt': [
                '$article', 0
              ]
            }
          }
        }
      }
    }
  ]

  if (data !== undefined && data instanceof FormData && data.has('searchType') && data.has('searchText') && data.get('searchText') !== '') {
    stages.unshift({
      '$match': {
        [data.get('searchType')]: data.get('searchText')
      }
    })
  }
  let items = await database.collection('comments')
    .aggregate(stages)
    .skip(curr !== undefined && size !== undefined ? curr * size : 0)
    .limit(size !== undefined ? size : 100)
    .toArray();
  return JSON.parse(JSON.stringify(items))
}

export async function listItemDetails(id) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-baozhi-api-v1');
  let item = await database.collection('comments').findOne({ _id: new ObjectId(id) });
  return JSON.parse(JSON.stringify(item))
}

export async function modifyItemDetails(id, data) {
  console.log(id)
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-baozhi-api-v1');
  await database.collection('comments').updateOne({
    _id: new ObjectId(id)
  }, {
    $set: data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data
  });
}

export async function listArticles() {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority")
  const database = client.db('ghg-baozhi-api-v1')
  let items = await database.collection('articles').find().toArray()
  return JSON.parse(JSON.stringify(items))
}