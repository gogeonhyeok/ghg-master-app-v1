/** @jest-environment node */
jest.mock('mongodb', () => ({ MongoClient: jest.fn() }));
import { MongoClient } from 'mongodb';
import { placeOrder } from './actions';

const globalMongo = globalThis;
const originalUri = process.env.MONGODB_URI;
const originalUrl = process.env.MONGODB_URL;
const insertOne = jest.fn();
const collection = jest.fn(() => ({ insertOne }));
const db = jest.fn(() => ({ collection }));

beforeEach(() => {
  jest.clearAllMocks();
  delete globalMongo.coffeeMongo;
  delete process.env.MONGODB_URL;
  process.env.MONGODB_URI = 'mongodb://localhost/test';
  const client = { connect: jest.fn(), close: jest.fn().mockResolvedValue(undefined), db };
  client.connect.mockResolvedValue(client);
  jest.mocked(MongoClient).mockImplementation(() => client);
  insertOne.mockResolvedValue({ insertedId: { toString: () => 'order-123' } });
});
afterEach(() => {
  delete globalMongo.coffeeMongo;
  if (originalUri === undefined) delete process.env.MONGODB_URI;
  else process.env.MONGODB_URI = originalUri;
  if (originalUrl === undefined) delete process.env.MONGODB_URL;
  else process.env.MONGODB_URL = originalUrl;
});
function order(name = ' Alex ', quantity = '2') {
  const form = new FormData();
  form.set('customerName', name);
  form.set('quantity', quantity);
  form.set('menu', 'Latte');
  return form;
}
it('saves only Americano to the requested database and collection', async () => {
  expect(await placeOrder(order())).toEqual({ ok: true, message: expect.stringContaining('order-123') });
  expect(db).toHaveBeenCalledWith('ghg-master-api-v1');
  expect(collection).toHaveBeenCalledWith('order');
  expect(insertOne).toHaveBeenCalledWith({ customerName: 'Alex', items: [{ name: 'Americano', quantity: 2 }], status: 'pending', source: 'coffee', createdAt: expect.any(Date) });
});
it.each([[' ', '1'], ['x'.repeat(81), '1'], ['Alex', '0'], ['Alex', '11'], ['Alex', '1.5'], ['Alex', 'invalid']])('rejects invalid input %s / %s', async (name, quantity) => {
  expect((await placeOrder(order(name, quantity))).ok).toBe(false);
  expect(insertOne).not.toHaveBeenCalled();
});
it('handles missing configuration without connecting', async () => {
  delete process.env.MONGODB_URI;
  expect((await placeOrder(order())).ok).toBe(false);
  expect(MongoClient).not.toHaveBeenCalled();
});
it('does not expose driver errors or claim success on failure', async () => {
  insertOne.mockRejectedValueOnce(new Error('private connection detail'));
  const result = await placeOrder(order());
  expect(result.ok).toBe(false);
  expect(result.message).not.toContain('private');
});

it('supports the existing MONGODB_URL configuration', async () => {
  delete process.env.MONGODB_URI;
  process.env.MONGODB_URL = 'mongodb://localhost/existing';
  expect((await placeOrder(order())).ok).toBe(true);
  expect(MongoClient).toHaveBeenCalledWith(process.env.MONGODB_URL, expect.any(Object));
});
