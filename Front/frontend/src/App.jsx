import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import UserDashboard from './pages/user/Dashboard'
import Absence from './pages/user/Absence'
import LeaveRequest from './pages/user/LeaveRequest'
import AdvanceRequest from './pages/user/AdvanceRequest'
import GeneralRequest from './pages/user/GeneralRequest'
import MyRequests from './pages/user/MyRequests'
import RequestDetail from './pages/user/RequestDetail'
import TicketList from './pages/user/TicketList'
import TicketNew from './pages/user/TicketNew'
import TicketDetail from './pages/TicketDetail'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import ITDashboard from './pages/it/Dashboard'
import ITTickets from './pages/it/Tickets'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import Catalog from './pages/admin/Catalog'
import Reports from './pages/admin/Reports'
import Settings from './pages/admin/Settings'
import HrDashboard from './pages/hr/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            element={
              <ProtectedRoute roles={['user', 'technician', 'hr', 'superadmin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route
            element={
              <ProtectedRoute roles={['hr']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/hr/dashboard" element={<HrDashboard />} />
            <Route path="/hr/requests/:id" element={<RequestDetail />} />
            <Route path="/hr/attendance" element={<Absence />} />
          </Route>

          <Route
            element={
              <ProtectedRoute roles={['user', 'technician', 'hr']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/absence" element={<Absence />} />
            <Route path="/leave-request" element={<LeaveRequest />} />
            <Route path="/advance-request" element={<AdvanceRequest />} />
            <Route path="/general-request" element={<GeneralRequest />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/requests/:id" element={<RequestDetail />} />
            <Route path="/tickets/new" element={<TicketNew />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/history" element={<TicketList status="done" title="Historique" />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
          </Route>

          <Route
            element={
              <ProtectedRoute roles={['technician']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/it/dashboard" element={<ITDashboard />} />
            <Route path="/it/tickets" element={<ITTickets />} />
            <Route path="/it/tickets/:id" element={<TicketDetail />} />
            <Route path="/it/history" element={<ITTickets history />} />
            <Route path="/it/history/:id" element={<TicketDetail />} />
          </Route>

          <Route
            element={
              <ProtectedRoute roles={['superadmin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/technicians" element={<AdminUsers roleFilter="technician" />} />
            <Route path="/admin/departments" element={<Catalog type="departments" />} />
            <Route path="/admin/categories" element={<Catalog type="categories" />} />
            <Route path="/admin/tickets" element={<ITTickets detailPath="/admin/tickets" />} />
            <Route path="/admin/requests" element={<HrDashboard detailBasePath="/admin/requests" />} />
            <Route path="/admin/requests/:id" element={<RequestDetail />} />
            <Route path="/admin/tickets/:id" element={<TicketDetail />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
