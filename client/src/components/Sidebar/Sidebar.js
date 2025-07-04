import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaUsers,
    FaFileAlt,
    FaChevronLeft,
    FaChevronRight,
    FaUserTie,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';
import ClubSelector from '../ClubSelector/ClubSelector';
import './Sidebar.css';

const Sidebar = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [rakebackMenuOpen, setRakebackMenuOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleRakebackMenu = () => {
        setRakebackMenuOpen(!rakebackMenuOpen);
    };

    // Check if any rakeback-related page is active
    const isRakebackActive = location.pathname === '/rakeback-data' ||
        location.pathname === '/players-rb-list' ||
        location.pathname === '/agents-rb-list';

    return (
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <h1 className="app-title">AON</h1>
                <button
                    className="collapse-btn"
                    onClick={toggleSidebar}
                    aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
            </div>

            {/* Club Selector */}
            {!sidebarCollapsed && <ClubSelector />}

            <nav className="sidebar-nav">
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                    <span className="nav-icon"><FaTachometerAlt /></span>
                    <span className="nav-text">Dashboard</span>
                </Link>

                {/* Rakeback dropdown menu */}
                <div className={`nav-dropdown ${isRakebackActive ? 'active' : ''}`}>
                    <div
                        className={`nav-link dropdown-toggle ${isRakebackActive ? 'active' : ''}`}
                        onClick={toggleRakebackMenu}
                    >
                        <span className="nav-icon"><FaFileAlt /></span>
                        <span className="nav-text">Rakeback</span>
                        <span className="dropdown-icon">
                            {rakebackMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </span>
                    </div>

                    <div className={`dropdown-menu ${rakebackMenuOpen ? 'show' : ''}`}>
                        <Link to="/rakeback-data" className={`dropdown-item ${location.pathname === '/rakeback-data' ? 'active' : ''}`}>
                            <span className="nav-icon small"><FaFileAlt /></span>
                            <span className="nav-text">Rakeback Data</span>
                        </Link>
                        <Link to="/players-rb-list" className={`dropdown-item ${location.pathname === '/players-rb-list' ? 'active' : ''}`}>
                            <span className="nav-icon small"><FaUsers /></span>
                            <span className="nav-text">Players RB List</span>
                        </Link>
                        <Link to="/agents-rb-list" className={`dropdown-item ${location.pathname === '/agents-rb-list' ? 'active' : ''}`}>
                            <span className="nav-icon small"><FaUserTie /></span>
                            <span className="nav-text">Agents RB List</span>
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="sidebar-footer">
                <span className="footer-text">© 2025 Round Table</span>
            </div>
        </aside>
    );
};

export default Sidebar;