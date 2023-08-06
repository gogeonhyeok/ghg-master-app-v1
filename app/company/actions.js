'use server'

import { MongoClient } from 'mongodb';

export async function addItem(data) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const result = await database.collection('companies').insertOne({
    subject: data.get('subject'),
    body: data.get('body'),
  });
}


export async function listItems(data, curr, size) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  let stages = []

  if(data !== undefined && data instanceof FormData && data.has('searchType') && data.has('searchText') && data.get('searchText') !== '') {
    stages.unshift({
      '$match': {
        [data.get('searchType')]: data.get('searchText')
      }
    })
  }

  let items = await database.collection('companies')
      .aggregate(stages)
      .skip(curr !== undefined && size !== undefined ? curr * size : 0)
      .limit(size !== undefined ? size : 100)
      .toArray();
  return JSON.parse(JSON.stringify(items))
}