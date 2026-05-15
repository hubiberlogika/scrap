import React from 'react'
import { NavLink } from 'react-router-dom'

const menu = [
  { path: '/', label: 'Dashboard' },
  { path: '/properties', label: 'Properties' },
  { path: '/agents', label: 'Agents' },
  { path: '/logs', label: 'Logs' },
  { path: '/settings', label: 'Settings' },
]

export default function Sidebar(){
  return (
    <aside className="w-full lg:w-64 bg-white border-r border-gray-200">
      <div className="px-4 py-6">
        <div className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">Menu</div>
        <nav className="space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
