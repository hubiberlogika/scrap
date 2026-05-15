import React, { useState } from 'react'

export default function PropertyCard({property, onEdit, onDelete}){
  const [expanded, setExpanded] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  return (
    <article className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Header: Title, Price, Location */}
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">
              {property.title || '—'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {property.location || property.address || 'Lokasi tidak tersedia'}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-bold text-base sm:text-lg text-blue-600">
              {property.price || '-'}
            </div>
            <div className="text-xs font-semibold text-gray-500 mt-1 flex flex-col">
              <span>{property.agent_name || 'Agent'}</span>
              {property.agent_phone && <span className="text-gray-400 mt-0.5">{property.agent_phone}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Details: Mobile expandable, Desktop always shown */}
      <div className="hidden sm:block px-3 sm:px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-gray-700">
          <div><span className="font-semibold text-gray-500">Luas Tanah:</span> {property.land_area || '-'}</div>
          <div><span className="font-semibold text-gray-500">Luas Bangunan:</span> {property.building_area || '-'}</div>
          <div><span className="font-semibold text-gray-500">K. Tidur:</span> {property.bedrooms || '-'}</div>
          <div><span className="font-semibold text-gray-500">K. Mandi:</span> {property.bathrooms || '-'}</div>
          <div><span className="font-semibold text-gray-500">Lantai:</span> {property.floors || '-'}</div>
          <div><span className="font-semibold text-gray-500">Listrik:</span> {property.electricity || '-'}</div>
          <div><span className="font-semibold text-gray-500">Air:</span> {property.water_source || '-'}</div>
          <div><span className="font-semibold text-gray-500">Dokumen:</span> {property.documents || '-'}</div>
        </div>
      </div>

      {/* Mobile: Expandable Section */}
      <div className="sm:hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center justify-between border-t border-gray-100"
        >
          <span className="font-semibold">Details</span>
          <span className={`transform transition ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {expanded && (
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-700 grid grid-cols-2 gap-2">
            <div><span className="font-semibold text-gray-500">L. Tanah:</span> {property.land_area || '-'}</div>
            <div><span className="font-semibold text-gray-500">L. Bangunan:</span> {property.building_area || '-'}</div>
            <div><span className="font-semibold text-gray-500">K. Tidur:</span> {property.bedrooms || '-'}</div>
            <div><span className="font-semibold text-gray-500">K. Mandi:</span> {property.bathrooms || '-'}</div>
            <div><span className="font-semibold text-gray-500">Lantai:</span> {property.floors || '-'}</div>
            <div><span className="font-semibold text-gray-500">Listrik:</span> {property.electricity || '-'}</div>
            <div><span className="font-semibold text-gray-500">Air:</span> {property.water_source || '-'}</div>
            <div><span className="font-semibold text-gray-500">Dokumen:</span> {property.documents || '-'}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 sm:px-4 py-3 bg-white border-t border-gray-100 flex gap-2 flex-wrap items-center">
        <button
          onClick={()=>onEdit && onEdit(property)}
          className="px-3 py-1.5 bg-green-600 text-white rounded text-xs sm:text-sm font-semibold hover:bg-green-700 transition"
        >
          Edit
        </button>
        {property.post_url && (
          <a
            href={property.post_url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs sm:text-sm font-semibold hover:bg-gray-50 transition"
          >
            View Post
          </a>
        )}
        {!confirmDel ? (
          <button
            onClick={()=>setConfirmDel(true)}
            className="ml-auto px-3 py-1.5 text-red-500 border border-red-200 rounded text-xs sm:text-sm font-semibold hover:bg-red-50 transition"
          >
            Hapus
          </button>
        ) : (
          <div className="ml-auto flex gap-1 items-center">
            <span className="text-xs text-red-600">Yakin?</span>
            <button onClick={()=>{onDelete && onDelete(property.id); setConfirmDel(false)}} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Ya</button>
            <button onClick={()=>setConfirmDel(false)} className="px-2 py-1 border rounded text-xs">Batal</button>
          </div>
        )}
      </div>
    </article>
  )
}
