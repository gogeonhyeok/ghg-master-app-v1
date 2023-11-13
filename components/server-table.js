import Link from 'next/link'

export default ({ viewModel, dataSource, detailUrl }) => {
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
                <li><Link href={`${detailUrl}/${entry._id}`}>Detail</Link></li>
              </ul>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}