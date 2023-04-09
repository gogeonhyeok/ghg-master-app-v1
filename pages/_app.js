import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  console.log('hello world');
  return <Component {...pageProps} />;
}

export default MyApp;
