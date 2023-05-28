export default async () => {
  async function onAction(data) {
    'use server';
    const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
    const database = client.db('ghg-master-api-v1');
    const result = await database.collection('requestTypes').insertOne({
      requestTypeId: data.get('requestTypeId'),
      requestTypeDescription: data.get('requestTypeDescription'),
      cancelTag: data.get('cancelTag'),
      createDate: data.get('createDate'),
      createUser: data.get('createUser'),
      updateDate: data.get('updateDate'),
      updateUser: data.get('updateUser'),
    });
  }
  return (
    <form
      action={onAction}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4
      }}
    >
      <input name="requestTypeId" placeholder="ID" />
      <input name="requestTypeDescription" placeholder="Description" />
      <input name="cancelTag" placeholder="Cancel Tag" />
      <input name="createDate" placeholder="Create Date" />
      <input name="createUser" placeholder="Create User" />
      <input name="updateDate" placeholder="Update Date" />
      <input name="updateUser" placeholder="Update User" />
      <button type="submit">Submit</button>
    </form>
  );
}
