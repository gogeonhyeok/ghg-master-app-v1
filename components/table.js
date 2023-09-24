export default ({ viewModel, dataSource, onDetail, onModify, onDelete }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          {viewModel.map(model => <th key={model.key}>{model.displayName}</th>)}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {dataSource.map(entry => (
          <tr key={entry._id}>
            {viewModel.map(model => <td key={entry._id + model.key}>{entry[model.key]}</td>)}
            <td>
              <ul>
                <li><button onClick={() => onDetail(entry._id)}>Detail</button></li>
                <li><button onClick={() => onModify(entry._id)}>Modify</button></li>
                <li><button onClick={() => onDelete(entry._id)}>Delete</button></li>
              </ul>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}