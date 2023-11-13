'use server'

import { MongoClient, ObjectId } from 'mongodb';
import { redirect } from 'next/navigation'
import 'dotenv/config'

const client = new MongoClient(process.env.MONGODB_URL)
export async function addItem(db, collection, data, redirectUrl) {
  const database = client.db(db)
  await database.collection(collection).insertOne({
    ...Object.fromEntries(data.entries()),
    createDate: new Date()
  })
  redirect(redirectUrl)
}

export async function listItems(db, collection, data, curr, size) {
  const database = client.db(db)
  let stages = []

  if (data !== undefined && data.hasOwnProperty('searchType') && data.hasOwnProperty('searchText') && data['searchText'] !== '') {
    stages.unshift({
      '$match': {
        [data['searchType']]: data['searchText']
      }
    })
  }
  let items = await database.collection(collection)
    .aggregate(stages)
    .skip(curr !== undefined && size !== undefined ? curr * size : 0)
    .limit(size !== undefined ? size : 100)
    .toArray();
  return JSON.parse(JSON.stringify(items))
}

export async function listItemDetails(db, collection, id) {
  const database = client.db(db);
  let item = await database.collection(collection).findOne({ _id: new ObjectId(id) });
  return JSON.parse(JSON.stringify(item))
}

export async function modifyItemDetails(db, collection, id, data) {
  const database = client.db(db);
  await database.collection(collection).updateOne({
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