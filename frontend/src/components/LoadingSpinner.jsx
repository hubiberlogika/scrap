import React from 'react'

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  )
}
