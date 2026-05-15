import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function SettingsPage(){
  const [igHandle, setIgHandle] = useState('')
  const [verifiedAccount, setVerifiedAccount] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState('')

  const [accountsText, setAccountsText] = useState('')
  const [limit, setLimit] = useState(5)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleVerify(e){
    e && e.preventDefault()
    if(!igHandle.trim()){
      setVerifyMessage('Masukkan username IG terlebih dahulu.')
      return
    }
    setVerifyLoading(true)
    setVerifyMessage('')
    try{
      const res = await axios.post(`${API_BASE}/scrape/verify`, { accounts: [igHandle.trim()] })
      const failed = res.data.failed || []
      if(failed.length > 0){
        setVerifyMessage(`Verifikasi gagal: ${failed[0].error}`)
      } else {
        setVerifiedAccount(igHandle.trim())
        setAccountsText(igHandle.trim())
        setVerifyMessage('Verifikasi berhasil — akun siap digunakan.')
      }
    }catch(err){
      const errorMessage = err?.response?.data?.error || err?.response?.data || err?.message || 'Verifikasi gagal. Pastikan backend berjalan dan username valid.'
      setVerifyMessage(typeof errorMessage === 'string' ? errorMessage : 'Verifikasi gagal. Pastikan backend berjalan dan username valid.')
    }finally{
      setVerifyLoading(false)
    }
  }

  function resetVerification(){
    setVerifiedAccount('')
    setVerifyMessage('')
    setIgHandle('')
    setAccountsText('')
  }

  async function handleTrigger(e){
    e.preventDefault()
    const accounts = accountsText.split(/[,\n\s]+/).map(s=>s.trim()).filter(Boolean)
    if(accounts.length === 0){
      setMessage('Masukkan minimal satu username atau gunakan prefix test:<caption> untuk testing.')
      return
    }
    setLoading(true)
    setMessage('')
    try{
      const res = await axios.post(`${API_BASE}/scrape`, { accounts, limit })
      setMessage(`Scrape selesai. Created: ${res.data.count || 0}`)
      setAccountsText('')
      setVerifiedAccount('')
    }catch(err){
      const errorMessage = err?.response?.data?.error || 'Gagal memicu scrape. Cek backend.'
      setMessage(errorMessage)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi aplikasi, koneksi API, dan preferensi.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">General</h3>
          <p className="text-sm text-gray-500 mt-2">Pengaturan dasar dan informasi aplikasi.</p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Instagram Account (Step 1)</h3>
          <p className="text-sm text-gray-500 mt-2">Masukkan alamat/handle Instagram terlebih dahulu. Setelah verifikasi berhasil, kamu dapat mengisi opsi lain.</p>

          {!verifiedAccount ? (
            <form className="mt-4 space-y-3" onSubmit={handleVerify}>
              <div>
                <input value={igHandle} onChange={e=>setIgHandle(e.target.value)} placeholder="contoh: agent_username" className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <button type="submit" disabled={verifyLoading} className="px-4 py-2 bg-blue-600 text-white rounded">{verifyLoading ? 'Verifying...' : 'Verify IG'}</button>
              </div>
              {verifyMessage && <div className="mt-3 text-sm text-gray-700">{verifyMessage}</div>}
            </form>
          ) : (
            <div className="mt-4">
              <div className="text-sm text-green-700">Akun terverifikasi: <span className="font-semibold">{verifiedAccount}</span></div>
              <div className="mt-2">
                <button onClick={resetVerification} className="px-3 py-1 border rounded">Reset</button>
              </div>
            </div>
          )}

          {verifiedAccount && (
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-semibold">Instagram Scrape Options (Step 2)</h4>
              <form className="mt-3 space-y-3" onSubmit={handleTrigger}>
                <textarea value={accountsText} onChange={e=>setAccountsText(e.target.value)} rows={3} placeholder="Daftar username (dipisah koma/spasi/baris baru)" className="w-full px-3 py-2 border rounded" />
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Limit per akun</label>
                  <input type="number" value={limit} onChange={e=>setLimit(parseInt(e.target.value||'0'))} min={1} max={50} className="w-24 px-2 py-1 border rounded" />
                </div>
                <div>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Running...' : 'Trigger Scrape'}</button>
                </div>
              </form>
              {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
