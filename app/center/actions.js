'use server'

import { MongoClient } from 'mongodb';
 
export async function addItem(data) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const result = await database.collection('centers').insertOne({
    centerNo: data.get('centerNo'),
    centerName: data.get('centerName'),
    centerType: data.get('centerType'),
    addr1: data.get('addr1'),
    addr2: data.get('addr2'),
    addr3: data.get('addr3'),
    addr4: data.get('addr4'),
    tel: data.get('tel'),
    fax: data.get('fax'),
    country: data.get('country'),
    province: data.get('province'),
    city: data.get('city'),
    zipCode: data.get('zipCode'),
    timeZone: data.get('timeZone'),
    contactPerson: data.get('contactPerson'),
    mainCenterNo: data.get('mainCenterNo'),
    ownershipType: data.get('ownershipType'),
    vendorContactId: data.get('vendorContactId'),
    volume: data.get('volume'),
    volumeUom: data.get('volumeUom'),
    longitude: data.get('longitude'),
    latitude: data.get('latitude'),
    plantCode: data.get('plantCode'),
    storageLocation: data.get('storageLocation'),
  });
}