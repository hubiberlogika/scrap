import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import PropertiesPage from './pages/PropertiesPage'
import AgentsPage from './pages/AgentsPage'
import LogsPage from './pages/LogsPage'
import SettingsPage from './pages/SettingsPage'

export default function App(){
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col lg:flex-row">
          <div className="lg:min-h-screen lg:sticky lg:top-0 lg:self-start">
            <Sidebar />
          </div>
          <main className="flex-1 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/properties" element={<PropertiesPage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/logs" element={<LogsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
