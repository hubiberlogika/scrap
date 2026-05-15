import React, { useEffect, useState } from 'react'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function LogsPage(){
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(()=>{
    fetchLogs()
  }, [])

  async function fetchLogs(){
    setLoading(true)
    setError('')
    try{
      const res = await axios.get(`${API_BASE}/scrape-logs`)
      setLogs(res.data || [])
    }catch(err){
      console.error(err)
      setError('Tidak bisa memuat history scrape.')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Scrape History</h2>
        <p className="text-sm text-gray-500 mt-1">Catatan scraping yang dijalankan oleh aplikasi.</p>
      </div>

      {error && <ErrorBanner message={error} onClose={()=>setError('')} />}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-3">
          {logs.length ? logs.map(log => (
            <div key={log.id} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{log.accounts_scraped}</h3>
                  <p className="text-sm text-gray-500">{new Date(log.scraped_at).toLocaleString()}</p>
                </div>
                <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${log.status === 'success' ? 'bg-green-100 text-green-700' : log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {log.status}
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-700">
                <div>Properties found: {log.properties_found}</div>
                {log.error_message && <div className="text-red-600">Error: {log.error_message}</div>}
              </div>
            </div>
          )) : <p className="text-sm text-gray-500">Belum ada log scraping.</p>}
        </div>
      )}
    </div>
  )
}
