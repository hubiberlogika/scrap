import React, { useState, useEffect } from 'react'

export default function FilterSection({ agents, selectedAgent, onAgentChange, onRefresh, loading }) {
  return (
    <section className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="flex flex-col">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Filter Agen</label>
            <select
              value={selectedAgent}
              onChange={(e) => onAgentChange(e.target.value)}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white disabled:bg-gray-100"
            >
              <option value="">Semua Agen</option>
              {agents.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
