import ListFarm from '../../components/farm/list-farm';
import Link from 'next/link';

export default function Farm({ farms }) {
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
      <ListFarm items={farms} />
    </>
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
