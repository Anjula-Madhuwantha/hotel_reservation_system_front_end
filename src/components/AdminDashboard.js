import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerDashboard from './CustomerDashboard';
import RoomDashboard from './RoomDashboard';
import Reports from './Reports';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('customer');
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || user?.role?.toLowerCase() !== 'admin') {
      navigate('/login');
    } else {
      setUserInfo(user);
    }
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const getTabInfo = (tabName) => {
    const tabConfig = {
      customer: { icon: '👥', label: 'Customer Management', description: 'Manage customer accounts and profiles' },
      room: { icon: '🏨', label: 'Room Management', description: 'Configure rooms and availability' },
      reports: { icon: '📊', label: 'Reports & Analytics', description: 'View performance metrics and insights' }
    };
    return tabConfig[tabName] || { icon: '📋', label: 'Dashboard', description: 'Admin panel' };
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">🛡️</div>
            {!isSidebarCollapsed && (
              <div className="brand-text">
                <h1>Admin Panel</h1>
                <p>Management System</p>
              </div>
            )}
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-header">
              {!isSidebarCollapsed && <span>Management</span>}
            </div>
            {['customer', 'room', 'reports'].map((tab) => {
              const tabInfo = getTabInfo(tab);
              return (
                <button
                  key={tab}
                  className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  title={isSidebarCollapsed ? tabInfo.label : ''}
                >
                  <span className="nav-icon">{tabInfo.icon}</span>
                  {!isSidebarCollapsed && (
                    <div className="nav-content">
                      <span className="nav-label">{tabInfo.label}</span>
                      <span className="nav-description">{tabInfo.description}</span>
                    </div>
                  )}
                  {activeTab === tab && <div className="nav-indicator"></div>}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          {userInfo && (
            <div className="user-profile">
              <div className="user-avatar">
                <span>{userInfo.name?.charAt(0)?.toUpperCase() || 'A'}</span>
              </div>
              {!isSidebarCollapsed && (
                <div className="user-details">
                  <div className="user-name">{userInfo.name}</div>
                  <div className="user-role">Administrator</div>
                  <div className="user-username">@{userInfo.username}</div>
                </div>
              )}
            </div>
          )}
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title={isSidebarCollapsed ? 'Logout' : ''}
          >
            <span className="logout-icon">🚪</span>
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`admin-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="main-header">
          <div className="header-content">
            <div className="header-title">
              <h2>
                <span className="title-icon">{getTabInfo(activeTab).icon}</span>
                {getTabInfo(activeTab).label}
              </h2>
              <p className="header-subtitle">{getTabInfo(activeTab).description}</p>
            </div>
            <div className="header-actions">
              <div className="header-stats">
                <div className="stat-item">
                  <span className="stat-label">Active Session</span>
                  <span className="stat-value">Online</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Last Login</span>
                  <span className="stat-value">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="main-content">
          <div className="content-wrapper">
            {activeTab === 'customer' && (
              <div className="tab-panel fade-in">
                <CustomerDashboard />
              </div>
            )}
            {activeTab === 'room' && (
              <div className="tab-panel fade-in">
                <RoomDashboard />
              </div>
            )}
            {activeTab === 'reports' && (
              <div className="tab-panel fade-in">
                <Reports />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {!isSidebarCollapsed && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarCollapsed(true)}
        ></div>
      )}
    </div>
  );
}

export default AdminDashboard;