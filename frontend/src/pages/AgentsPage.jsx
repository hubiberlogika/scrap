import React, { useEffect, useState } from 'react'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function AgentsPage(){
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({name:'', instagram_handle:'', email:'', phone:''})

  useEffect(()=>{
    fetchAgents()
  }, [])

  async function fetchAgents(){
    setLoading(true)
    setError('')
    try{
      const res = await axios.get(`${API_BASE}/agents`)
      setAgents(res.data || [])
    }catch(err){
      console.error(err)
      setError('Gagal memuat agents.')
    }finally{
      setLoading(false)
    }
  }

  async function createAgent(e){
    e.preventDefault()
    setLoading(true)
    try{
      await axios.post(`${API_BASE}/agents`, form)
      setForm({name:'', instagram_handle:'', email:'', phone:''})
      fetchAgents()
    }catch(err){
      console.error(err)
      setError('Gagal membuat agent baru.')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Agents Management</h2>
        <p className="text-sm text-gray-500 mt-1">Tambahkan dan lihat daftar agen properti.</p>
      </div>

      {error && <ErrorBanner message={error} onClose={()=>setError('')} />}
      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Agent List</h3>
            <div className="space-y-3">
              {agents.length ? agents.map(agent => (
                <div key={agent.id} className="rounded-xl border border-gray-200 p-3">
                  <div className="font-semibold text-gray-900">{agent.name}</div>
                  <div className="text-sm text-gray-600">IG: {agent.instagram_handle || '-'}</div>
                  <div className="text-sm text-gray-600">Email: {agent.email || '-'}</div>
                  <div className="text-sm text-gray-600">Phone: {agent.phone || '-'}</div>
                </div>
              )) : <p className="text-sm text-gray-500">Belum ada agen.</p>}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Tambah Agen</h3>
            <form className="space-y-3" onSubmit={createAgent}>
              <label className="block text-sm text-gray-700">
                Nama agen
                <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="mt-1 w-full px-3 py-2 border rounded" required />
              </label>
              <label className="block text-sm text-gray-700">
                Instagram handle
                <input value={form.instagram_handle} onChange={e=>setForm({...form, instagram_handle:e.target.value})} className="mt-1 w-full px-3 py-2 border rounded" />
              </label>
              <label className="block text-sm text-gray-700">
                Email
                <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="mt-1 w-full px-3 py-2 border rounded" type="email" />
              </label>
              <label className="block text-sm text-gray-700">
                Phone
                <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="mt-1 w-full px-3 py-2 border rounded" />
              </label>
              <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700">Create Agent</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
