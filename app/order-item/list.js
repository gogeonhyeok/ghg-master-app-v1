import { MongoClient } from 'mongodb';

export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('orderItems').aggregate([
    {
      '$lookup': {
        'from': 'orders',
        'localField': 'ordNo',
        'foreignField': 'ordNo',
        'as': 'orders'
      }
    },
    {
      '$addFields': {
        'contactOrdNo': {
          '$getField': {
            'field': 'contactOrdNo',
            'input': {
              '$arrayElemAt': [
                '$orders',
                0
              ]
            }
          }
        },
        'createUser': {
          '$getField': {
            'field': 'createUser',
            'input': {
              '$arrayElemAt': [
                '$orders',
                0
              ]
            }
          }
        },
        'createDate': {
          '$getField': {
            'field': 'createDate',
            'input': {
              '$arrayElemAt': [
                '$orders',
                0
              ]
            }
          }
        },
        'updateUser': {
          '$getField': {
            'field': 'updateUser',
            'input': {
              '$arrayElemAt': [
                '$orders',
                0
              ]
            }
          }
        },
        'updateDate': {
          '$getField': {
            'field': 'updateDate',
            'input': {
              '$arrayElemAt': [
                '$orders',
                0
              ]
            }
          }
        }
      }
    },
    {
      '$lookup': {
        'from': 'masterProducts',
        'localField': 'productId',
        'foreignField': 'productId',
        'as': 'masterProducts'
      }
    },
    {
      '$addFields': {
        'productName': {
          '$getField': {
            'field': 'productName',
            'input': {
              '$arrayElemAt': [
                '$masterProducts',
                0
              ]
            }
          }
        }
      }
    },
    {
      '$lookup': {
        'from': 'masterSkus',
        'localField': 'skuId',
        'foreignField': 'skuId',
        'as': 'masterSkus'
      }
    },
    {
      '$addFields': {
        'skuDesc': {
          '$getField': {
            'field': 'skuDesc',
            'input': {
              '$arrayElemAt': [
                '$masterSkus',
                0
              ]
            }
          }
        }
      }
    },
    {
      '$project': {
        'orders': 0,
        'masterProducts': 0,
        'mmasterSkus': 0
      }
    }
  ]).limit(100).toArray();
  return (
    <table className="table">
      <tr>
        <th>Order No</th>
        <th>Item No</th>
        <th>Group No</th>
        <th>Product</th>
        <th>Product Grade</th>
        <th>Product State</th>
        <th>Qty</th>
        <th>SKU</th>
        <th>SKU Qty</th>
        <th>Confirm Qty</th>
        <th>Packing Unit Qty</th>
        <th>Remarks</th>
        <th>Blocked To Process</th>
        <th>Create Date</th>
        <th>Create User</th>
        <th>Update Date</th>
        <th>Update User</th>
      </tr>
      {items.map((entry) => (
        <tr>
          <td>{entry.contactOrdNo}</td>
          <td>{entry.itemNo}</td>
          <td>{entry.itemGroupNo}</td>
          <td>{entry.productName}</td>
          <td>{entry.productGrade}</td>
          <td>{entry.productState}</td>
          <td>{entry.qty}</td>
          <td>{entry.skuDesc}</td>
          <td>{entry.skuQty}</td>
          <td>{entry.confirmQty}</td>
          <td>{entry.packingUnitQty}</td>
          <td>{entry.remarks}</td>
          <td>{entry.isBlockedToProcess}</td>
          <td>{entry.createDate}</td>
          <td>{entry.createUser}</td>
          <td>{entry.updateDate}</td>
          <td>{entry.updateUser}</td>
        </tr>
      ))}
    </table>
  );
}
