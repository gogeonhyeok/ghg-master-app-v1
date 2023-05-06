export default function CreateFarm() {
  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      <input name="name" placeholder="Name" />
      <input name="address" placeholder="Address" />
      <button type="submit">Submit</button>
    </form>
  );
}
