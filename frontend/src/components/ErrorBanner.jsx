import React from 'react'

export default function ErrorBanner({ message, onClose }) {
  if (!message) return null
  return (
    <div className="fixed top-14 left-0 right-0 z-50 bg-red-50 border-b-2 border-red-300 p-3 sm:p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-red-600 font-semibold text-sm">❌</span>
          <span className="text-red-800 text-sm">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-600 hover:text-red-800 text-sm font-semibold"
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  )
}
