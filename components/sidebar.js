import Link from 'next/link';

export default ({ entry }) => {
  const groupBy = entry.reduce((prev, curr) => {
    const { groupName } = curr
    prev[groupName] = prev[groupName] ?? []
    prev[groupName].push(curr)
    return prev
  }, {});
  return (
    <nav className="sidebar">
      {
        Object.keys(groupBy).map(groupName => {
          if (groupName !== 'undefined') {
            return (
              <section key={groupName} style={{
                paddingLeft: 0
              }}>
                <hr />
                <section>
                  <h1>{groupName}</h1>
                  {groupBy[groupName].map(model => (
                    <Link key={model.href} href={model.href}>{model.displayName}</Link>
                  ))}
                </section>
              </section>
            )
          } else {
            return (
              groupBy[groupName].map(model => (
                <Link key={model.href} href={model.href}>{model.displayName}</Link>
              ))
            )
          }
        })
      }
    </nav>
  );
}
