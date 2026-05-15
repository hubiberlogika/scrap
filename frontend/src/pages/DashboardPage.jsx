import React, { useEffect, useState } from 'react'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function DashboardPage(){
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    fetchStats()
  }, [])

  async function fetchStats(){
    setLoading(true)
    setError('')
    try{
      const res = await axios.get(`${API_BASE}/dashboard/stats`)
      setStats(res.data)
    }catch(err){
      console.error(err)
      setError('Tidak bisa memuat dashboard. Pastikan backend berjalan.')
    }finally{
      setLoading(false)
    }
  }

  if(loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <article className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Properties</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">{stats?.total_properties ?? 0}</h2>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Agents</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">{stats?.total_agents ?? 0}</h2>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Recent Listings</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">{stats?.recent_properties?.length ?? 0}</h2>
        </article>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Listings</h3>
        </div>
        {stats?.recent_properties?.length ? (
          <div className="grid gap-3">
            {stats.recent_properties.map((property) => (
              <div key={property.id} className="rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-800">{property.title || 'Untitled'}</h4>
                <p className="text-xs text-gray-500 mt-1">{property.location || property.address || 'Lokasi tidak tersedia'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Belum ada listing terbaru.</p>
        )}
      </section>

      {error && <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}
    </div>
  )
}
