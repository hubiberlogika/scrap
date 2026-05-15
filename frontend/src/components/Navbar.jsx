import React from 'react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-blue-600">
            🏠
          </div>
          <h1 className="text-lg sm:text-xl font-bold">Scrapper Home</h1>
        </div>
        <div className="text-xs sm:text-sm">Property Listings</div>
      </div>
    </nav>
  )
}
