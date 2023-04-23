import Head from 'next/head';
import styles from '../styles/Home.module.css';
import SearchForm from '../components/search-form';

export default function Home({ farms }) {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Smart Local Farms</h1>
        <SearchForm />
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    return {
      props: {
        farms: [],
      },
    };
  } catch (e) {
    console.error(e);
  }
}
