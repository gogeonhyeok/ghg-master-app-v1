export default function CreateContact() {
  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      <input name="contactId" placeholder="Contact ID" />
      <input name="centerId" placeholder="Center ID" />
      <button type="submit">Submit</button>
    </form>
  );
}
