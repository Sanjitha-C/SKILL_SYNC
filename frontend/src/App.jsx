import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SignupInterestsPage from './pages/SignupInterestsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminManageEvents from './pages/admin/AdminManageEvents';
import AdminStudents from './pages/admin/AdminStudents';
import AdminReports from './pages/admin/AdminReports';
import AdminMessages from './pages/admin/AdminMessages';
import AdminFeedback from './pages/admin/AdminFeedback';
import MyInstitution from './pages/student/MyInstitution';
import StudentProfile from './pages/student/StudentProfile';
import Opportunities from './pages/student/Opportunities';
import Progress from './pages/student/Progress';
import Attendance from './pages/student/Attendance';
import Reports from './pages/student/Reports';
import Messages from './pages/student/Messages';
import ThemeToggle from './components/ThemeToggle';

const adminMenu = [
  { path: '/admin/institution', label: 'My Institution' },
  { path: '/admin/manage-events', label: 'Manage Events' },
  { path: '/admin/students', label: 'Students' },
  { path: '/admin/reports', label: 'Reports' },
  { path: '/admin/feedback', label: 'Feedback' },
  { path: '/admin/messages', label: 'Messages' }
];

const studentMenu = [
  { path: '/student/profile', label: 'My Profile', menuKey: 'profile' },
  { path: '/student/institution', label: 'My Institution', menuKey: 'institution' },
  { path: '/student/opportunities', label: 'Opportunities', menuKey: 'opportunities' },
  { path: '/student/progress', label: 'Progress', menuKey: 'progress' },
  { path: '/student/attendance', label: 'Attendance', menuKey: 'attendance' },
  { path: '/student/reports', label: 'Reports', menuKey: 'reports' },
  { path: '/student/messages', label: 'Messages', menuKey: 'messages' }
];

const App = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/student');

  return (
    <>
      {!isDashboardRoute ? <ThemeToggle /> : null}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/interests" element={<SignupInterestsPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <SidebarLayout title="Admin Dashboard" menu={adminMenu} />
            </ProtectedRoute>
          }
        >
          <Route path="institution" element={<MyInstitution />} />
          <Route path="manage-events" element={<AdminManageEvents />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <SidebarLayout title="Student Dashboard" menu={studentMenu} />
            </ProtectedRoute>
          }
        >
          <Route path="profile" element={<StudentProfile />} />
          <Route path="institution" element={<MyInstitution />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="progress" element={<Progress />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
