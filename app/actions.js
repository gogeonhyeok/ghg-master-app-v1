'use server'

import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'

const client = new MongoClient(process.env.MONGODB_URL)
export async function addItem(db, collection, data) {
  try {
    const database = client.db(db)
    await database.collection(collection).insertOne({
      ...Object.fromEntries(data.entries()),
      createDate: new Date()
    })
  } finally {
    client.close()
  }
}

export async function listItems(db, collection, data, curr, size) {
  try {
    const database = client.db(db)
    let stages = []
  
    if (data !== undefined && data instanceof FormData && data.has('searchType') && data.has('searchText') && data.get('searchText') !== '') {
      stages.unshift({
        '$match': {
          [data.get('searchType')]: data.get('searchText')
        }
      })
    }
    let items = await database.collection(collection)
      .aggregate(stages)
      .skip(curr !== undefined && size !== undefined ? curr * size : 0)
      .limit(size !== undefined ? size : 100)
      .toArray();
    return JSON.parse(JSON.stringify(items))
  } finally {
    client.close()
  }
}

export async function listItemDetails(db, collection, id) {
  try {
    const database = client.db(db);
    let item = await database.collection(collection).findOne({ _id: new ObjectId(id) });
    return JSON.parse(JSON.stringify(item))
  } finally {
    client.close()
  }
}

export async function modifyItemDetails(db, collection, id, data) {
  try {
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
  } finally {
    client.close()
  }
}