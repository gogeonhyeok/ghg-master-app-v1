'use server'

import { MongoClient, ObjectId } from 'mongodb';

export async function addItem(data) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority")
  const database = client.db('ghg-baozhi-api-v1')
  await database.collection('articles').insertOne({
    ...Object.fromEntries(data.entries()),
    createDate: new Date()
  })
}

export async function listItems(data, curr, size) {
  console.log(data)
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority")
  const database = client.db('ghg-baozhi-api-v1')
  let stages = []

  if (data !== undefined && data instanceof FormData && data.has('searchType') && data.has('searchText') && data.get('searchText') !== '') {
    stages.unshift({
      '$match': {
        [data.get('searchType')]: data.get('searchText')
      }
    })
  }
  let items = await database.collection('articles')
    .aggregate(stages)
    .skip(curr !== undefined && size !== undefined ? curr * size : 0)
    .limit(size !== undefined ? size : 100)
    .toArray();
  return JSON.parse(JSON.stringify(items))
}

export async function listItemDetails(id) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-baozhi-api-v1');
  let item = await database.collection('articles').findOne({ _id: new ObjectId(id) });
  return JSON.parse(JSON.stringify(item))
}

export async function modifyItemDetails(id, data) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-baozhi-api-v1');
  await database.collection('articles').updateOne({
    _id: new ObjectId(id)
  }, {
    $set: {
      ...data instanceof FormData
        ? Object.fromEntries(data.entries())
        : data,
      updateDate: new Date()
    }
  });
}