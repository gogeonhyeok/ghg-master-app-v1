import ListFarm from '../../components/farm/list-farm';

export default function Farm() {
  return (
    <>
      <Link href="/farm/create">Create</Link>
      <Link href="/">Home</Link>
      <ListFarm />
    </>
  );
}
