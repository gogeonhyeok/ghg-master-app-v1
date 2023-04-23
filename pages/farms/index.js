import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home({ farms }) {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Smart Local Farms</h1>
        <ul>
          {farms.map((entry) => (
            <li>
              <h2>{entry.name}</h2>
              <p>{entry.description}</p>
              <p>{entry.address}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const response = await fetch(
      'https://data.mongodb-api.com/app/data-efhph/endpoint/data/v1/action/find',
      {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
          'api-key':
            'EkYheuKC7iqVZ1H2FejbfNLjSj9RHDw26HWMm8Z31Cpo3nJlK6Q8jAa7gUpX4Ow7',
        },
        body: JSON.stringify({
          dataSource: 'Cluster0',
          database: 'ghg-master-api-v1',
          collection: 'farms',
          filter: {},
          sort: {
            completedAt: 1,
          },
        }),
      }
    );
    let responseBody = await response.json();

    return {
      props: {
        farms: responseBody.documents,
      },
    };
  } catch (e) {
    console.error(e);
  }
}
