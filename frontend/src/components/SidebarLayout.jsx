import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ThemeToggle from './ThemeToggle';

const SidebarLayout = ({ title, menu }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({});
  const [latestNotification, setLatestNotification] = useState(null);

  const filteredMenu = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return menu;
    return menu.filter((item) => item.label.toLowerCase().includes(query));
  }, [menu, search]);

  const totalNotifications = useMemo(
    () => Object.values(notificationCounts).reduce((sum, count) => sum + count, 0),
    [notificationCounts]
  );

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    if (filteredMenu.length === 0) return;
    navigate(filteredMenu[0].path);
  };

  useEffect(() => {
    const loadNotifications = async () => {
      if (user?.role !== 'student') {
        setNotificationCounts({});
        setLatestNotification(null);
        return;
      }

      try {
        if (location.pathname.startsWith('/student/messages')) {
          await api.patch('/student/messages/read-all');
        }

        const { data } = await api.get('/student/messages');
        const currentUserId = String(user?.id || user?._id || '');

        const unreadMessages = data.filter((item) => {
          const readBy = Array.isArray(item.readBy) ? item.readBy : [];
          return !readBy.some((readerId) => String(readerId) === currentUserId);
        });

        const counts = unreadMessages.reduce((acc, item) => {
          const key = item.targetMenu || 'messages';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        setNotificationCounts(counts);
        setLatestNotification(unreadMessages[0] || null);
      } catch {
        setNotificationCounts({});
        setLatestNotification(null);
      }
    };

    loadNotifications();
  }, [location.pathname, user?.role, user?.id, user?._id]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo-wrap">
          <div className="logo-mark">
            <img
              src="/kct-logo.png"
              alt="Kumaraguru College Logo"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
                event.currentTarget.nextElementSibling.style.display = 'grid';
              }}
            />
            <span className="logo-fallback">KCT</span>
          </div>
        </div>
        <input
          className="search-input"
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <nav className="menu">
          {filteredMenu.map((item) => (
            <NavLink key={item.path} className="menu-item" to={item.path}>
              <span>{item.label}</span>
              {user?.role === 'student' && item.menuKey && notificationCounts[item.menuKey] ? (
                <span className="menu-badge">{notificationCounts[item.menuKey]}</span>
              ) : null}
            </NavLink>
          ))}
          {filteredMenu.length === 0 ? <p className="menu-empty">No matching menu item.</p> : null}
          <button type="button" className="menu-item logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>
      <main className="content">
        <header className="content-header">
          <h2>{title}</h2>
          <div className="header-user">
            <ThemeToggle className="theme-toggle-inline" />
            {user?.role === 'student' ? (
              <button type="button" className="bell-btn" onClick={() => navigate('/student/messages')} aria-label="Notifications">
                🔔
                {totalNotifications > 0 ? <span className="bell-badge">{totalNotifications}</span> : null}
              </button>
            ) : null}
            <div className="profile-avatar" aria-label="Profile photo icon">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <p className="profile-meta">
              {user?.name} ({user?.role})
            </p>
          </div>
        </header>
        {user?.role === 'student' && latestNotification ? (
          <div className="notification-bar">
            <strong>Notification:</strong> {latestNotification.title} — {latestNotification.body}
          </div>
        ) : null}
        <section className="content-body">
          <Outlet />
        </section>
      </main>

      {showLogoutConfirm ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Logout confirmation">
          <div className="modal-card">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="row-actions">
              <button type="button" className="danger" onClick={confirmLogout}>
                Yes, Logout
              </button>
              <button type="button" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SidebarLayout;
