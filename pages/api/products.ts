import clientPromise from '../../lib/mongodb';

export default async (_: any, res: any) => {
  try {
    console.log('roblox');
    res.json([
      {
        name: 'abc',
      },
    ]);
  } catch (e) {
    console.error(e);
  }
};
