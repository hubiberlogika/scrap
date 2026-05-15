import React, { useEffect, useState } from 'react'

export default function EditModal({property, onClose, onSave}){
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    if(property){
      setForm({
        id: property.id,
        address: property.address || '',
        land_area: property.land_area || '',
        building_condition: property.building_condition || '',
        documents: property.documents || '',
        property_type: property.property_type || '',
        year_built: property.year_built || '',
        description: property.description || '',
      })
    }
  }, [property])

  if(!property) return null

  function change(field, value){
    setForm(prev=> ({...prev, [field]: value}))
  }

  async function handleSubmit(e){
    e.preventDefault()
    setSaving(true)
    try {
      await onSave && onSave(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-lg sm:rounded-lg shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-4 flex items-center justify-between border-b">
          <h3 className="font-bold text-lg">Edit Properti</h3>
          <button onClick={onClose} className="text-xl leading-none hover:opacity-70">×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <label className="block">
            <div className="text-sm font-semibold text-gray-700 mb-1">Address</div>
            <input 
              value={form.address||''} 
              onChange={e=>change('address', e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g., Jl. Cempaka No. 1"
            />
          </label>

          <label className="block">
            <div className="text-sm font-semibold text-gray-700 mb-1">Land Area</div>
            <input 
              value={form.land_area||''} 
              onChange={e=>change('land_area', e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g., 150 m²"
            />
          </label>

          <label className="block">
            <div className="text-sm font-semibold text-gray-700 mb-1">Building Condition</div>
            <select 
              value={form.building_condition||''} 
              onChange={e=>change('building_condition', e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Select condition...</option>
              <option value="Baru">Baru</option>
              <option value="Renovasi">Renovasi</option>
              <option value="Lama">Lama</option>
              <option value="Rusak">Rusak</option>
            </select>
          </label>

          <label className="block">
            <div className="text-sm font-semibold text-gray-700 mb-1">Documents</div>
            <input 
              value={form.documents||''} 
              onChange={e=>change('documents', e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g., SHM, IMB"
            />
          </label>

          <label className="block">
            <div className="text-sm font-semibold text-gray-700 mb-1">Property Type</div>
            <select 
              value={form.property_type||''} 
              onChange={e=>change('property_type', e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Select type...</option>
              <option value="Rumah">Rumah</option>
              <option value="Apartemen">Apartemen</option>
              <option value="Tanah">Tanah</option>
              <option value="Ruko">Ruko</option>
              <option value="Kantor">Kantor</option>
            </select>
          </label>

          <label className="block">
            <div className="text-sm font-semibold text-gray-700 mb-1">Year Built</div>
            <input 
              value={form.year_built||''} 
              onChange={e=>change('year_built', e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g., 2020"
              type="number"
            />
          </label>

          <label className="block">
            <div className="text-sm font-semibold text-gray-700 mb-1">Description</div>
            <textarea 
              value={form.description||''} 
              onChange={e=>change('description', e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="Additional details..."
              rows="4"
            />
          </label>

          {/* Footer */}
          <div className="flex gap-2 justify-end pt-2 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
