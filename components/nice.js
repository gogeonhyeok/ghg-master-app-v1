import { useState } from 'react'

export default () => {
  const [age, setAge] = useState(28)
  return (
    <div>
      <h1>Nice Component</h1>
      <p>{age}</p>
    </div>
  )
}