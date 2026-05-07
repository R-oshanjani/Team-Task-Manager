import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, FolderGit2, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { logout, user } = useContext(AuthContext);

    return (
        <aside className="sidebar">
            <div style={{ marginBottom: '32px', padding: '0 16px' }}>
                <h2 className="text-gradient">TaskFlow</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Welcome, {user?.username}
                </div>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                {/* For a real app, you might map projects here. For now just Dashboard. */}
            </nav>

            <button onClick={logout} className="nav-item" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', marginTop: 'auto' }}>
                <LogOut size={20} color="var(--danger)" />
                <span style={{ color: 'var(--danger)' }}>Log out</span>
            </button>
        </aside>
    );
};

export default Sidebar;
