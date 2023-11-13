import { listItemDetails } from '../app/actions'
import Link from 'next/link'

export default async ({ viewModel }) => {
  const itemDetails = await listItemDetails(viewModel.db, viewModel.collection, viewModel.id)

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignContent: 'center',
        marginRight: 24,
        marginTop: 24,
        gap: 16
      }}>
        <Link href={viewModel.baseUrl}>List</Link>
        <Link href={`${viewModel.baseUrl}/modify/${viewModel.id}`}>Modify</Link>
      </div>
      <dl style={{
        margin: 24
      }}>
        {viewModel.listModel.map(model => (
          <section key={model.key}>
            <dt>{model.displayName}</dt>
            <dd>{itemDetails[model.key]}</dd>
          </section>
        ))}
      </dl>
    </>
  );
}
