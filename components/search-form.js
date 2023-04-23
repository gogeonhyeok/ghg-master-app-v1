export default function SearchForm({ onSubmit }) {
  return (
    <div className="border-2 p-4 m-4">
      <form onSubmit={onSubmit}>
        <label htmlFor="first">Name</label>
        <input type="text" id="name" name="name" required />
        <label htmlFor="last">Description</label>
        <input type="text" id="description" name="description" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
