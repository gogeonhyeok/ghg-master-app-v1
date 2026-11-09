# Warehouse data

The warehouse page reads stock, orders, and master data from the Camel HTTP API
in `ghg-master-api-v1/src/main/resources/camel/warehouse.camel.yaml`.
`data.ts` performs server-only, uncached HTTP requests and validates the response;
the warehouse page no longer connects to MongoDB directly.

For local development, run the API and set this server environment variable:

```dotenv
WAREHOUSE_API_URL=http://localhost:8080/warehouse
```

By default the base URL is
`https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/warehouse`.
Deploy the new Camel endpoints before deploying this frontend change. Set
`WAREHOUSE_API_URL` to include any API Gateway stage prefix when necessary.

The client calls `/inventories`, `/orders`, and
`/master-data/{products|locations|centers|skus}` under that base, with `?page=N`.
For the hybrid MongoDB/Aurora backend, keep transaction requests on
`WAREHOUSE_API_URL` and set a separate master-data base after deploying and enabling
`warehouse-sql.camel.yaml`:

```dotenv
WAREHOUSE_API_URL=http://localhost:8080/warehouse
WAREHOUSE_MASTER_API_URL=http://localhost:8080/warehouse-sql/master-data
```

If `WAREHOUSE_MASTER_API_URL` is unset, masters continue to use the original base.
Both requests still run only on the Next.js server.

Camel returns `{ rows, total, page, pageSize }` with display-ready string cells,
fixed page sizes (50 stock records or 25 other records), clamped pagination, and
inventory product/location names. Existing independent unavailable states remain
in place when any request fails, times out, or returns an invalid response.

Run `npm test -- --runInBand --watchman=false app/warehouse` to test the HTTP
client and page without a running API or MongoDB connection.
