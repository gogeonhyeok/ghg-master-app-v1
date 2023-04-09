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
    return {
      props: {
        farms: [
          {
            name: 'Hay Dairies',
            description: 'The only goat farm since 1988',
            address: '3 Lim Chu Kang Lane 4, Singapore 718859',
          },
          {
            name: 'The Live Turtle and Tortoise Museum',
            description:
              'We welcome you to enter into a rare world of turtles and tortoises',
            address: 'ORTO, 81 Lor Chencharu #01-16, Singapore 769198',
          },
          {
            name: 'Qian Hu Fish Farm',
            description:
              'An integrated "one-stop" service provider ranging from farming, importing, exporting and distributing of ornamental fish.',
            address: 'No. 71 Jalan Lekar Singpoare 698950',
          },
          {
            name: 'Jurong Frog Farm',
            description: 'Frog farm',
            address: 'Singapore Lim Chu Kang',
          },
          {
            name: 'Gallop Kranji Farm Resort',
            description: 'Vegetable farm',
            address: 'Singapore Lim Chu Kang',
          },
          {
            name: 'Dairy Folks',
            description: 'Milk farm',
            address: 'Singapore Lim Chu Kang',
          },
          {
            name: 'Bee Amazed Garden',
            description: 'Bee farm',
            address: 'Singapore Lim Chu Kang',
          },
          {
            name: 'Nippon Koi Farm',
            description: 'Koi farm',
            address: 'Singapore Lim Chu Kang',
          },
        ],
      },
    };
  } catch (e) {
    console.error(e);
  }
}
