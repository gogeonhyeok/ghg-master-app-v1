'use client'

import { addItem, getCompanies, getRequestTypes, getStandardCodes, getSystems } from './actions'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const viewModel = [
  {
    key: 'subject',
    displayName: 'Subject'
  },
]

export default () => {
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [requestTypes, setRequestTypes] = useState([])
  const [standardCodes, setStandardCodes] = useState([])
  const [systems, setSystems] = useState([])

  useEffect(() => {
    getCompanies().then(response => setCompanies(response))
  }, [])

  useEffect(() => {
    getStandardCodes('PRIORITY').then(response => setStandardCodes(response))
  }, [])

  useEffect(() => {
    getRequestTypes().then(response => setRequestTypes(response))
  }, [])

  useEffect(() => {
    getSystems().then(response => setSystems(response))
  }, [])

  const onAction = async (data) => {
    await addItem(data)
    router.back()
  }

  return (
    <form
      action={onAction}
      className='form'
    >
      <label>
        Request Type
        <select name="requestTypeId">
          {requestTypes.map(requestType => (<option key={requestType._id} value={requestType.requestTypeId}>{requestType.requestTypeDescription}</option>))}
        </select>
      </label>
      <label>
        System
        <select name="system" multiple="multiple">
          {systems.map(item => (<option key={item._id} value={item.systemId}>{item.systemName}</option>))}
        </select>
      </label>
      <label>
        Priority
        <select name="priority">
          {standardCodes.map(item => (<option key={item._id} value={item.codeId}>{item.codeDescription}</option>))}
        </select>
      </label>
      <label>
        Request To
        <select name="requestTo">
          {companies.map(company => (<option key={company._id} value={company.companyId}>{company.companyName}</option>))}
        </select>
      </label>
      {viewModel.map(model => (
        <label key={model.key}>
          {model.displayName}
          <input name={model.key} />
        </label>
      ))}
      <label>
        Content
        <textarea name="content" />
      </label>
      <div>
        <button type="submit">Submit</button>
        <Link href="/request">Cancel</Link>
      </div>
    </form>
  );
}
