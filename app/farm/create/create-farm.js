import Link from 'next/link';

export default function CreateFarm() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/farm">List</Link>
        <Link href="/">Home</Link>
      </nav>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        <input name="name" placeholder="Name" />
        <input name="address" placeholder="Address" />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
