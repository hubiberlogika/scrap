import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PropertyCard from '../components/PropertyCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import EditModal from '../components/EditModal'

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'

export default function PropertiesPage(){
  const [properties, setProperties] = useState([])
  const [allAgents, setAllAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editProperty, setEditProperty] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(()=>{
    fetchProperties()
  }, [selectedAgent])

  async function fetchProperties(){
    setLoading(true)
    setError('')
    try{
      const res = await axios.get(`${API_BASE}/properties`, {
        params: { agent: selectedAgent, search: searchTerm }
      })
      const data = res.data || []
      setProperties(data)
      // Ambil semua agen dari seluruh data (tanpa filter) untuk dropdown
      if(!selectedAgent && !searchTerm){
        setAllAgents([...new Set(data.map(p=>p.agent_name).filter(Boolean))])
      }
    }catch(err){
      setError('Gagal memuat properties. Pastikan backend berjalan.')
    }finally{
      setLoading(false)
    }
  }

  async function handleSearch(e){
    e && e.preventDefault()
    fetchProperties()
  }

  async function handleDeleteAll(){
    setClearing(true)
    try{
      await axios.delete(`${API_BASE}/properties/all`)
      setProperties([])
      setAllAgents([])
      setSelectedAgent('')
      setSearchTerm('')
      setConfirmClear(false)
    }catch(err){
      setError('Gagal menghapus data.')
    }finally{
      setClearing(false)
    }
  }

  async function handleDeleteOne(id){
    try{
      await axios.delete(`${API_BASE}/properties/${id}`)
      setProperties(prev => prev.filter(p => p.id !== id))
    }catch(err){
      setError('Gagal menghapus properti.')
    }
  }

  async function saveProperty(updated){
    if(!updated || !updated.id) return
    try{
      const res = await axios.put(`${API_BASE}/properties/${updated.id}`, updated)
      const updatedProp = res.data
      setProperties(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p))
      setEditProperty(null)
    }catch(err){
      setError('Gagal menyimpan perubahan.')
    }
  }

  const filtered = properties.filter(p => {
    const term = searchTerm.toLowerCase()
    if(!term) return true
    return (
      (p.title || '').toLowerCase().includes(term) ||
      (p.location || '').toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Daftar Properties</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filtered.length} properti ditemukan
              {selectedAgent ? ` dari agen "${selectedAgent}"` : ''}
            </p>
          </div>
          {/* Tombol Hapus Semua */}
          {!confirmClear ? (
            <button
              onClick={()=>setConfirmClear(true)}
              disabled={properties.length === 0}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              🗑 Hapus Semua Data
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600 font-medium">Yakin hapus semua?</span>
              <button
                onClick={handleDeleteAll}
                disabled={clearing}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700"
              >
                {clearing ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
              <button
                onClick={()=>setConfirmClear(false)}
                className="px-3 py-1.5 border rounded text-sm"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          {/* Filter Agen */}
          <div className="flex flex-col gap-1 w-full sm:w-64">
            <label className="text-xs font-semibold text-gray-600">Filter Agen Instagram</label>
            <select
              value={selectedAgent}
              onChange={e=>{setSelectedAgent(e.target.value)}}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Semua Agen ({allAgents.length})</option>
              {allAgents.map(agent=>(
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              value={searchTerm}
              onChange={e=>setSearchTerm(e.target.value)}
              placeholder="Cari judul, lokasi, deskripsi..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              Cari
            </button>
          </form>

          {/* Refresh */}
          <button
            onClick={()=>{setSelectedAgent(''); setSearchTerm(''); setTimeout(fetchProperties, 50)}}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
          >
            ↺ Reset Filter
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onClose={()=>setError('')} />}

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center text-gray-400 shadow-sm">
          <div className="text-4xl mb-3">🏠</div>
          <p className="font-semibold">Belum ada data properti</p>
          <p className="text-sm mt-1">Lakukan scraping di halaman Settings untuk menambah data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={()=>setEditProperty(property)}
              onDelete={()=>handleDeleteOne(property.id)}
            />
          ))}
        </div>
      )}

      <EditModal property={editProperty} onClose={()=>setEditProperty(null)} onSave={saveProperty} />
    </div>
  )
}
