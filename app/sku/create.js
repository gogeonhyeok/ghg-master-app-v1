export default () => {
  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      <input name="locationId" placeholder="Location ID" />
      <input name="centerId" placeholder="Center ID" />
      <button type="submit">Submit</button>
    </form>
  );
}
