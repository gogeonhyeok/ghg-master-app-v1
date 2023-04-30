export default function CreateFarm() {
  const onSubmit = async (event) => {
    event.preventDefault();
  };
  return (
    <form
      onSubmit={onSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      <input name="name" placeholder="Name" />
      <input name="address" placeholder="Address" />
      <button type="submit">Submit</button>
    </form>
  );
}
