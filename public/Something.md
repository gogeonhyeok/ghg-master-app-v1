# Nextjs Pages

1. SettingsMenuModify
    - 11/12/23 17:52

```jsx

/**
 * SettingsMenuModify
 * @author ghg
 * @version 0.0.1, 11/12/23
 */
'use client'

import Modify from '../../../../../components/modify';
import { listItemDetails, modifyItemDetails } from '../../../../actions';

export default ({ params }) => {
  const viewModel = {
    id: params.id,
    db: 'ghg-settings-api-v1',
    collection: 'menus',
    listUrl: '/settings/menu',
    listModel: [
      {
        name: 'href',
        displayName: 'HREF',
        displayType: 'input'
      },
      {
        name: 'displayName',
        displayName: 'Name',
        displayType: 'input'
      },
      {
        name: 'groupName',
        displayName: 'Group',
        displayType: 'input'
      }
    ],
    modifyItemDetails: modifyItemDetails,
    listItemDetails: listItemDetails
  }
  return (
    <>
      <Modify viewModel={viewModel}/>
    </>
  );
}


```


1. WmsUser
    - 11/11/23 18:59

```jsx

/**
 * WmsUser
 * @author ghg
 * @version 0.0.1, 11/11/23
 */
import List from '../../components/list';
import { listItems, modifyItemDetails } from './actions';

export default () => {
  return (
    <>
      <List
        viewModel={[
          {
            key: 'userId',
            displayName: 'ID'
          },
          {
            key: 'userName',
            displayName: 'Name'
          },
          {
            key: 'userType',
            displayName: 'Type'
          },
          {
            key: 'languageNo',
            displayName: 'Lang'
          },
          {
            key: 'groupId',
            displayName: 'Group'
          },
          {
            key: 'companyNo',
            displayName: 'Company'
          },
          {
            key: 'employeeId',
            displayName: 'Employee ID'
          },
          {
            key: 'sex',
            displayName: 'Sex'
          },
          {
            key: 'email',
            displayName: 'Email'
          },
          {
            key: 'mobileNo',
            displayName: 'Mobile'
          },
          {
            key: 'defaultSystem',
            displayName: 'Default System'
          },
          {
            key: 'defaultContactId',
            displayName: 'Default Contact'
          },
          {
            key: 'defaultCenterNo',
            displayName: 'Default Center'
          },
          {
            key: 'defaultBranchNo',
            displayName: 'Default Branch'
          },
          {
            key: 'expiryDate',
            displayName: 'Expiry Date'
          },
          {
            key: 'chargeRate',
            displayName: 'Charge Rate'
          },
          {
            key: 'isMultiLogin',
            displayName: 'Multi Login'
          },
          {
            key: 'remarks',
            displayName: 'Remarks'
          },
          {
            key: 'cancelTag',
            displayName: 'Cancel Tag'
          },
          {
            key: 'createDate',
            displayName: 'Create Date'
          },
          {
            key: 'createUser',
            displayName: 'Create User'
          },
          {
            key: 'updateDate',
            displayName: 'Update Date'
          },
          {
            key: 'updateUser',
            displayName: 'Update User'
          },
        ]}
        searchModel={[
          {
            value: 'userId',
            displayName: 'ID'
          }
        ]}
        listItems={listItems}
        modifyItemDetails={modifyItemDetails}
        modifyUrl='/wms-user/modify'
        detailUrl='/wms-user/detail'
        createUrl='/wms-user/create'
      />
    </>
  )
}

```

1. Workflow
    - 11/11/23 18:47

```jsx

/**
 * Workflow
 * @author ghg
 * @version 0.0.1, 11/11/23
 */
import List from '../../components/list';
import { listItems, modifyItemDetails } from '../actions';

const viewModel = {
  db:"ghg-master-api-v1",
  collection:"wmsMasterWorkflows",
  modifyUrl: '/workflow/modify',
  detailUrl: '/workflow/detail',
  createUrl: '/workflow/create',
  searchModel: [
    {
      value: 'workflowName',
      displayName: 'Name'
    }
  ],
  listModel: [
    {
      key: 'workflowId',
      displayName: 'ID'
    },
    {
      key: 'workflowName',
      displayName: 'Name'
    },
    {
      key: 'workflowType',
      displayName: 'Type'
    },
    {
      key: 'contactId',
      displayName: 'Contact'
    },
    {
      key: 'fromDate',
      displayName: 'From'
    },
    {
      key: 'thruDate',
      displayName: 'Thru'
    },
    {
      key: 'createDate',
      displayName: 'Create Date'
    },
    {
      key: 'createUser',
      displayName: 'Create User'
    },
    {
      key: 'updateDate',
      displayName: 'Update Date'
    },
    {
      key: 'updateUser',
      displayName: 'Update User'
    }
  ]
}

export default () => {
  return (
    <>
      <List
        viewModel={viewModel}
        listItems={listItems}
        modifyItemDetails={modifyItemDetails}
      />
    </>
  )
}

```

1. BaozhiArticle
    - 11/11/23 18:30

```tsx

/**
 * BaozhiArticle
 * @author ghg
 * @version 0.0.1, 11/11/23
 */
import List from '../../../components/server-list'

export default async ({ searchParams }) => {
  const page = parseInt(searchParams.page)
  const searchData = {
    searchType: searchParams.searchType,
    searchText: searchParams.searchText
  }
  return (
    <>
      <List
        page={page}
        searchData={searchData}
        listModel={[
          {
            key: 'subject',
            displayName: 'Subject'
          },
          {
            key: 'createDate',
            displayName: 'Create Date'
          }
        ]}
        searchModel={[
          {
            value: 'subject',
            displayName: 'Subject'
          }
        ]}
        db='ghg-baozhi-api-v1'
        collection='articles'
        baseUrl='/baozhi/article'
      />
    </>
  )
}

```

1. FarmPage
    - 05/07/23 02:44
  
```tsx

/**
 * FarmPage
 * @author ghg
 * @version 0.0.1, 05/07/23
 */
export default function FarmPage() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/farm/create">Create</Link>
        <Link href="/">Home</Link>
      </nav>
      <ListFarm />
    </>
  );
}

```

1. PageWithJSBasedForm
    - 01/14/23 12:03
  
```tsx

/**
 * PageWithJSBasedForm
 * @author ghg
 * @version 0.0.1, 01/14/23
 */
export default function PageWithJSBasedForm() {
  const handleSubmit = async (event) => {
    event.preventDefault()

    const data = {
      first: event.target.first.value,
      last: event.target.last.value,
    }

    const JSONdata = JSON.stringify(data)

    const endpoint = '/api/form'

    const options = {
      method: 'POST',
      handlers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    }

    const response  = await fetch(endpoint, options)

    const result = await response.json()
  }

  return (
    <form onSubmit={handleSubmit}>>
      <label htmlFor="first">First Name</label>
      <input type="text" id="first" name="first" required />
      <label htmlFor="last">Last Name</label>
      <input type="text" id="last" name="last" required />
      <button type="submit">Submit</button>
    </form>
  )
}

```

1. MasterProduct
    - 01/14/23 01:25
  
```tsx

/**
 * MasterProduct
 * @author ghg
 * @version 0.0.1, 01/14/23
 */
import clientPromise from "../../lib/mongodb";

export default function MasterProduct({ entries }) {
  return (
    <div>
      <h1>Products</h1>
      <ul>
        {entries.map(entry => (
          <li>{entry.productName}</li>
        ))}
      </ul>
    </div>
  )
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("hyeok-master-api-v1");
    const documents = await db
      .collection("master/product")
      .find({})
      .limit(1000)
      .toArray();
    return {
      props: { entries: JSON.parse(JSON.stringify(documents)) }
    }
  } catch(e) {
    console.error(e);
  }
}

```

1. Home
    - 04/18/22 23:52

```tsx

/**
 * Home
 * @author ghg
 * @version 0.0.1, 10/12/24
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flx place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By {' '}
            <Image
              src="/varcel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>
      <div className="">
      
      </div>
    </main>
  )
}

/**
 * Home
 * @author ghg
 * @version 0.0.1, 12/03/23
 */
export default function Page() {
  async function create(formData: FormData) {
    'use server';
    const id = await createItem(formData);
  }

  return (
    <form action={create}>
      <input type="text" name="name" />
      <button type="submit">Submit</button>
    </form>
  )
}

/**
 * Home
 * @author ghg
 * @version 0.0.1, 12/24/23
 * csl-pfs-admin-v1
 */
'use server';
export default async function Home() {
  async function getPaymentGateways() {
    const url: any = process.env["CACHE_URL"];
    const response = await fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify({
          requestElement: 'PaymentGateway',
          serviceName: 'csl-pfs-admin-v1',
        }),
        headers: { 'Content-Type': 'application/json' }
      },
    );
    const items = await response.json()
    return items.object
      .map((item: any) => item.country.split(',').map((entry: any) => ({ ...item, country: entry })))
      .flat()
      .filter((item: any) => item.ruleType === 'PAYMENT_RULE')
      .sort((a: any, b: any) =>
        a.country.localeCompare(b.country) == 0
          ? a.paymentType.localeCompare(b.paymentType)
          : a.country.localeCompare(b.country),
      );
  }

  const paymentGateways = await getPaymentGateways()

  return (
    <main className={styles.main}>
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Country</th>
              <th>Card Type</th>
              <th>Channel</th>
              <th>Gateway</th>
            </tr>
          </thead>
          <tbody>
            {paymentGateways.map((entry: any) => (
              <tr>
                <td><input type="checkbox" /></td>
                <td>{entry.country}</td>
                <td>{entry.paymentType}</td>
                <td>{entry.channel}</td>
                <td>{entry.priGateway}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </main>
  );
}


/**
 * Home
 * @author ghg
 * @version 0.0.1, 04/30/23
 */
import styles from '../styles/Home.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Master</h1>
        <Link href="/farm">Farm</Link>
        <Link href="/center">Center</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/product">Product</Link>
      </main>
    </div>
  );
}


/**
 * Home
 * @author ghg
 * @version 0.0.1, 01/30/23
 */
const Home: NextPage = ({ entries }) => {
  console.log(entries);
  return (
    <div className={styles.container}>
      <ul>
        {entries.map((entry: any) => (
          <li>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white shadow-md rounded-lg max-w-sm dark:bg-gray-800 dark:border-gray-700">
                <a href="#">
                  <img className="rounded-t-lg p-8" src="https://flowbite.com/docs/images/products/product-1.png" alt="product image" />
                    </a>
                  <div className="px-5 pb-5">
                    <a href="#">
                      <h3 className="text-gray-900 font-semibold text-xl tracking-tight dark:text-white">{entry.description}</h3>
                    </a>
                    <div className="flex items-center mt-2.5 mb-5">
                      <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                      </svg>
                      <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                      </svg>
                      <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                      </svg>
                      <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                      </svg>
                      <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                        </path>
                      </svg>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">5.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">$599</span>
                      <a href="#"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add
                        to cart</a>
                    </div>
                  </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("ghg-master-api-v1");
    const documents = await db
      .collection("products")
      .find({})
      .limit(10)
      .toArray();
    return {
      props: { entries: JSON.parse(JSON.stringify(documents)) }
    }
  } catch(e) {
    console.error(e);
  }
}

export default Home


/**
* Home
* @author ghg
* @version 0.0.1, 04/18/22
*/
import { Container, FormElement, Input, Row } from '@nextui-org/react'
import type { NextPage } from 'next'
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'
import { Text } from '@nextui-org/react';

const Home: NextPage = () => {
  const { setTheme } = useTheme();
  const [command, setCommand] = useState<string>();
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [commandHistories, setCommandHistories] = useState<string[]>([]);

  useEffect(() => {
    setTheme('dark');
  }, []);

  const clearConsole = () => {
    setConsoleLogs([]);
  }
e
  const printConsole = (msg: string) => {
    setConsoleLogs([msg].concat(consoleLogs));
  }

  const onKeyDown = (e: React.KeyboardEvent<FormElement>) => {
    if (e.key === "Enter") {
      setCommandHistories([command as string].concat(commandHistories));

      switch(command) {
        case "help":
        case "get-help":
        case "get-help -name get-service":
          printConsole("Get-Service: get service details");
          break;
        case "clear":
        case "clear-host":
          clearConsole();
          break;
        case "get-actuatorstartupreport":
          printConsole("Processing...");
          break;
      }
      setCommand("");
    }
  }

  const onChange = (e: React.ChangeEvent<FormElement>) => {
    setCommand(e.currentTarget.value);
  }

  return (
    <Container
      alignItems='center'
      alignContent="center"
      fluid
      style={{marginTop: 32}}
    >
      <Row
        justify="center"
        align="center"
      >
        <Input
          size="xl"
          placeholder="help"
          bordered
          labelLeft=">"
          animated={false}
          onKeyDown={onKeyDown}
          onChange={onChange}
          value={command}
        />
      </Row>
      <Row>
        <Container>
          {consoleLogs.map(entry => <Row><Text h2>{entry}</Text></Row>)}
        </Container>
      </Row>
    </Container>
  )
}

export default Home;

```

1. FlightStatus
    - 03/06/22 15:40

```jsx

/**
* FlightStatus
* @author ghg
* @version 0.0.1, 03/06/22
*/
function FlightStatus({ initialData }: any) {
  return <FlightStatusPageContainer initialData={initialData} />;
}

FlightStatus.getInitialProps = async (ctx: any) => {
  const { query } = ctx;
  let initialData: any;
  if (typeof window !== "undefined") {
    initialData = { formData: query };
  } else {
    initialData = await FlightStatusInitialDataService.getInitialData(query);
  }
  return { initialData };
};
export default FlightStatus;

```

1. Blog
    - 01/30/22 12:06

```tsx

/**
* Blog
* @author ghg
* @version 0.0.1, 01/30/22
*/
export default function Blog({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li>{post.title}</li>
      ))}
    </ul>
  )
}

export async function getStaticProps() {
  const res = await fetch('http://.../posts')
  const posts = await res.json()

  return {
    props: {
      posts,
    },
  }
}

export async function getStaticPaths() {
  const res = await fetch('http://.../posts')
  const posts = await res.json()

  const paths = posts.map((post) => ({
    params: { id: post.id },
  }))

  return {
    paths,
    fallback: false
  }
}

```

1. Seat
    - 01/20/22 22:43

```tsx

/**
* Seat
* @author ghg
* @version 0.0.1, 01/20/22
*/
interface PageProps {
  initialData: IStackInitialData;
}

export default class SeatPage extends EventComponent<PageProps> {
  public static async getInitialProps(ctx: any) {
    const { query, req, pathname } = ctx;
    const intialData = await new InitialDataService().getInitialData(
      query,
      req,
      pathname
    );
    return { initialData };
  }

  public render() {
    return <Seat event={new Sevendis()} />;
  }
}

```

1. CheckinLandingPage
    - 12/30/21 17:17

```tsx

/**
* CheckinLandingPage
* @author ghg
* @version 0.0.1, 12/30/21
*/
export default class CheckinLandingPage extends EventComponent<PageProps> {

}

```

1. PassengerPage
    - 12/23/21 15:18

```tsx

/**
* PassengerPage
* @author ghg
* @version 0.0.1, 12/23/21
*/
interface PageProps {
  initialData: IStackInitialData;
}

export default class PassengerPage extends EventComponent<PageProps> {
  public static async getInitialProps(ctx: any) {
    const { query, req, pathname } = ctx;
    const initialData = await new InitialDataService().getInitialData(
      query,
      req,
      pathname
    );
    return { initialData };
  }

  componentDidMount(): void {
    pushToDataLayer(this.props.initialData.pageData.dataLayerData);
  }

  public render() {
    <>
      <PassengerDetails event={new Sevendis()} />
    </>
  };
}

```

1. SeatPage
    - 12/23/21 15:17

```tsx

/**
* SeatPage
* @author ghg
* @version 0.0.1, 12/23/21
*/
export default class SeatPage extends EventComponent<PageProps> {
  public render() {
    return <Seat event={new Sevendis()}>
  }
}

```

1. GroupBookingPage
    - 12/23/21 15:16

```tsx

/**
* GroupBookingPage
* @author ghg
* @version 0.0.1, 12/23/21
*/
export default class GroupBookingPage extends EventComponent<PageProps> {
  public static async getInitialProps(ctx: any): Promise<PageProps> {

  }

  componentDidMount() {
    document.title = 'Group Check-In';
  }

  public render() {
    return (
      <GroupBooking
        recordLocator={recordLocator}
        eTicketNumber={eTicketNumber}
        lastName={lastName.toUpperCase()}
        locale={locale}
        hideLastName={hideLastName}
      />
    );
  }

}

```

1. Checkin
    - 12/20/21 12:56


```tsx

/**
 * Checkin
 * @author ghg
 * @version 0.0.1, 12/20/21
 */
export default class CheckinLandingPage extends EventComponent<PageProps> {
  public static async getInitialProps(ctx: any) {
    const {query, req, pathname} = ctx;
    const initialData = await new InitialDataService().getInitialData(
      query,
      req,
      pathname
    );
    return {initialData};
}

  componentDidMount(): void {
    pushToDataLayer(this.props.initialData.pageData.dataLayerData);
  }

  public render() {
    return (
      <>
        <CheckinOverview event={new Sevendis()} />
      </>
    )
  }
}

```

1. Home
    - 12/15/21 15:52

```tsx

/**
 * Home
 * @author ghg
 * @version 0.0.1, 12/15/21
 */
export default class CheckinLandingPage extends EventComponent<PageProps> {
  constructor(props: PageProps) {
    super(props);
    this.state = {
      showSpinner: false,
    };
  }

  public static async getInitialProps(ctx: any) {
    const { query, req, pathname } = ctx;
    const initialData = await new InitialDataService().getInitialData(
      query,
      req,
      pathname
    );
    return { initialData };
  }

  redirectToCheckInOverview() {
    this.setState({ showSpinner: true });
  }

  setCookie = function (cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  public render() {
    const { showSpinner } = this.state;
    const { locale } = this.props.initialData;
    return (
      <>
        {showSpinner && (
          <PageSpinner
            locale={(locale as Locale) ?? Locale.en_UK}
            scrollToTop={true}
            shouldLockBody={false}
          />
        )}
        <form
          id="retrievePNRForm"
          onSubmit={this.redirectToCheckInOverview.bind(this)}
          action="/ice/checkin/overview"
          method="POST">
          <table summary="Retrieve Pnr Form">
            <tbody>
              <tr>
                <th></th>
              </tr>
              <tr>
                <td>
                  <label htmlFor="pnr">PNR/TicketNumber</label>
                </td>
                <td>
                  <input id="pnr" name="pnr" type="text" />
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="lastName">Last Name</label>
                </td>
                <td>
                  <input id="lastname" name="lastName" type="text" />
                </td>
              </tr>
              <tr>
                <td colSpan={1}>
                  <input type="submit" value="Submit" />
                </td>
                <td colSpan={1}>
                  <input type="reset" value="Reset" />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </>
    );
  }
}

/**
* Home
* @author ghg
* @version 0.0.1, 01/25/22
*/
export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <section className={}>
        <h2 className={}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              {title}
              <br />
              {id}
              <br />
              {date}
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}

```

1. About
    - 12/15/21 15:48

```tsx

/**
 * About
 * @author ghg
 * @version 0.0.1, 12/15/21
 */
function About() {
  return <div>About</div>
}
export default About;

```
