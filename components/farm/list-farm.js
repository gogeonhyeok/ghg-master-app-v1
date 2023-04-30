export default function ListFarm({ items }) {
  console.log(items);
  return (
    <>
      <ul>
        {items.map((entry) => (
          <li>
            <h2>{entry.name}</h2>
            <p>{entry.description}</p>
            <p>{entry.address}</p>
          </li>
        ))}
      </ul>
    </>
  );
}