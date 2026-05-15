import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const STATUS_LABEL = {
  pending:  { text: 'Menunggu…',   color: 'text-yellow-600', bg: 'bg-yellow-50',  dot: 'bg-yellow-400' },
  running:  { text: 'Berjalan…',   color: 'text-blue-600',   bg: 'bg-blue-50',    dot: 'bg-blue-500 animate-pulse' },
  done:     { text: 'Selesai ✓',   color: 'text-green-700',  bg: 'bg-green-50',   dot: 'bg-green-500' },
  error:    { text: 'Error ✕',     color: 'text-red-600',    bg: 'bg-red-50',     dot: 'bg-red-500' },
}

function JobCard({ job, onDelete }) {
  const s = STATUS_LABEL[job.status] || STATUS_LABEL.pending
  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${s.bg}`}>
      <span className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-800 text-sm">@{job.username}</span>
          <span className={`text-xs font-medium ${s.color}`}>{s.text}</span>
        </div>
        {job.message && (
          <p className="text-xs text-gray-600 mt-1 break-words">{job.message}</p>
        )}
        {job.status === 'done' && (
          <p className="text-xs text-gray-500 mt-1">
            Ditemukan: {job.total_found} · Disimpan: {job.total_saved}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {new Date(job.created_at).toLocaleString('id-ID')}
        </p>
      </div>
      {(job.status === 'done' || job.status === 'error') && (
        <button
          onClick={() => onDelete(job.id)}
          className="text-gray-300 hover:text-red-500 text-sm flex-shrink-0 transition"
          title="Hapus"
        >✕</button>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [igHandle, setIgHandle]               = useState('')
  const [verifiedAccount, setVerifiedAccount] = useState('')
  const [verifyLoading, setVerifyLoading]     = useState(false)
  const [verifyMessage, setVerifyMessage]     = useState('')

  const [limit, setLimit]     = useState(10)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [jobs, setJobs] = useState([])
  const pollRef = useRef(null)

  // ── Fetch all jobs ────────────────────────────────────────────────────────
  async function fetchJobs() {
    try {
      const res = await axios.get(`${API_BASE}/scrape/jobs`)
      setJobs(res.data)
    } catch (_) {}
  }

  // ── Poll while any job is pending/running ─────────────────────────────────
  useEffect(() => {
    fetchJobs()
    pollRef.current = setInterval(() => {
      const hasActive = jobs.some(j => j.status === 'pending' || j.status === 'running')
      if (hasActive) fetchJobs()
    }, 3000)
    return () => clearInterval(pollRef.current)
  }, [jobs.length])  // re-register when job count changes

  // ── Force refresh after triggering ───────────────────────────────────────
  function startPolling() {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      await fetchJobs()
    }, 2000)
    // Stop after 5 minutes max
    setTimeout(() => clearInterval(pollRef.current), 5 * 60 * 1000)
  }

  // ── Verify IG account ─────────────────────────────────────────────────────
  async function handleVerify(e) {
    e && e.preventDefault()
    if (!igHandle.trim()) {
      setVerifyMessage('Masukkan username IG terlebih dahulu.')
      return
    }
    setVerifyLoading(true)
    setVerifyMessage('')
    try {
      const res = await axios.post(`${API_BASE}/scrape/verify`, { accounts: [igHandle.trim()] })
      const failed = res.data.failed || []
      if (failed.length > 0) {
        setVerifyMessage(`Verifikasi gagal: ${failed[0].error}`)
      } else {
        setVerifiedAccount(igHandle.trim())
        setVerifyMessage('Verifikasi berhasil — akun siap digunakan.')
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Verifikasi gagal. Pastikan backend berjalan.'
      setVerifyMessage(typeof msg === 'string' ? msg : 'Verifikasi gagal.')
    } finally {
      setVerifyLoading(false)
    }
  }

  function resetVerification() {
    setVerifiedAccount('')
    setVerifyMessage('')
    setIgHandle('')
  }

  // ── Trigger scrape (add to queue) ─────────────────────────────────────────
  async function handleTrigger(e) {
    e.preventDefault()
    if (!verifiedAccount) return
    setLoading(true)
    setMessage('')
    try {
      const res = await axios.post(`${API_BASE}/scrape/queue`, {
        accounts: [verifiedAccount],
        limit,
      })
      const count = res.data.queued || 0
      setMessage(`${count} job berhasil ditambahkan ke antrian scraping.`)
      await fetchJobs()
      startPolling()
    } catch (err) {
      const msg = err?.response?.data?.error || 'Gagal memicu scrape. Cek backend.'
      setMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Delete a job from list ────────────────────────────────────────────────
  async function handleDeleteJob(jobId) {
    try {
      await axios.delete(`${API_BASE}/scrape/jobs/${jobId}`)
      setJobs(prev => prev.filter(j => j.id !== jobId))
    } catch (_) {}
  }

  const activeJobs    = jobs.filter(j => j.status === 'pending' || j.status === 'running')
  const completedJobs = jobs.filter(j => j.status === 'done' || j.status === 'error')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi scraping Instagram dan pantau antrian.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Step 1 – Verify IG */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Instagram Account (Step 1)</h3>
          <p className="text-sm text-gray-500 mt-2">
            Verifikasi akun Instagram target terlebih dahulu.
          </p>

          {!verifiedAccount ? (
            <form className="mt-4 space-y-3" onSubmit={handleVerify}>
              <input
                value={igHandle}
                onChange={e => setIgHandle(e.target.value)}
                placeholder="contoh: property0ne"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={verifyLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm rounded-lg transition"
              >
                {verifyLoading ? 'Verifying…' : 'Verify IG'}
              </button>
              {verifyMessage && (
                <p className="text-sm text-gray-700 mt-2">{verifyMessage}</p>
              )}
            </form>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                ✓ Akun terverifikasi: <span className="font-semibold">@{verifiedAccount}</span>
              </div>
              <button
                onClick={resetVerification}
                className="text-sm text-gray-500 underline"
              >
                Ganti akun
              </button>
            </div>
          )}

          {/* Step 2 – trigger scrape */}
          {verifiedAccount && (
            <div className="mt-6 border-t pt-5">
              <h4 className="text-sm font-semibold text-gray-800">Scrape Options (Step 2)</h4>
              <form className="mt-3 space-y-3" onSubmit={handleTrigger}>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-32">Limit per akun</label>
                  <input
                    type="number"
                    value={limit}
                    onChange={e => setLimit(parseInt(e.target.value || '1'))}
                    min={1} max={100}
                    className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm rounded-lg transition"
                >
                  {loading ? 'Menambahkan ke antrian…' : '▶ Mulai Scrape'}
                </button>
                {message && (
                  <p className="text-sm text-gray-700">{message}</p>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Queue panel */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Antrian Scraping</h3>
            <button
              onClick={fetchJobs}
              className="text-xs text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Status real-time proses scraping. Auto-refresh setiap 2 detik saat ada job aktif.
          </p>

          <div className="mt-4 space-y-2">
            {jobs.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">Belum ada job scraping.</p>
            )}

            {activeJobs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Aktif ({activeJobs.length})</p>
                {activeJobs.map(j => (
                  <JobCard key={j.id} job={j} onDelete={handleDeleteJob} />
                ))}
              </div>
            )}

            {completedJobs.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Riwayat ({completedJobs.length})</p>
                {completedJobs.map(j => (
                  <JobCard key={j.id} job={j} onDelete={handleDeleteJob} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
