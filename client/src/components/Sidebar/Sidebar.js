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
    FaChevronUp,
    FaCrown,
    FaCog
} from 'react-icons/fa';
import ClubSelector from '../ClubSelector/ClubSelector';
import './Sidebar.css';

const Sidebar = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [rakebackMenuOpen, setRakebackMenuOpen] = useState(false);
    const [mobileClubSelectorOpen, setMobileClubSelectorOpen] = useState(false);
    const [mobileRakebackMenuOpen, setMobileRakebackMenuOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleRakebackMenu = () => {
        setRakebackMenuOpen(!rakebackMenuOpen);
    };

    const toggleMobileClubSelector = () => {
        setMobileClubSelectorOpen(!mobileClubSelectorOpen);
        // Close rakeback menu if open
        if (mobileRakebackMenuOpen) {
            setMobileRakebackMenuOpen(false);
        }
    };

    const toggleMobileRakebackMenu = () => {
        setMobileRakebackMenuOpen(!mobileRakebackMenuOpen);
        // Close club selector if open
        if (mobileClubSelectorOpen) {
            setMobileClubSelectorOpen(false);
        }
    };

    const closeMobileMenus = () => {
        setMobileClubSelectorOpen(false);
        setMobileRakebackMenuOpen(false);
    };

    // Check if any rakeback-related page is active
    const isRakebackActive = location.pathname === '/rakeback-data' ||
        location.pathname === '/players-rb-list' ||
        location.pathname === '/agents-rb-list' ||
        location.pathname === '/super-agents-rb-list';

    return (
        <>
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
                            <Link to="/super-agents-rb-list" className={`dropdown-item ${location.pathname === '/super-agents-rb-list' ? 'active' : ''}`}>
                                <span className="nav-icon small"><FaCrown /></span>
                                <span className="nav-text">Super Agents RB List</span>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Rakeback Menu Button */}
                    <div className={`mobile-rakeback-menu-btn ${isRakebackActive ? 'active' : ''}`} onClick={toggleMobileRakebackMenu}>
                        <span className="nav-icon"><FaFileAlt /></span>
                        <span className="nav-text">Rakeback</span>
                    </div>

                    {/* Mobile Club Selector Button */}
                    <div className="mobile-club-selector-btn" onClick={toggleMobileClubSelector}>
                        <span className="nav-icon"><FaCog /></span>
                        <span className="nav-text">Clubs</span>
                    </div>
                </nav>

                {/* Desktop Club Selector */}
                {!sidebarCollapsed && (
                    <div className="desktop-club-selector">
                        <ClubSelector />
                    </div>
                )}

                <div className="sidebar-footer">
                    <span className="footer-text">© 2025 Round Table</span>
                </div>
            </aside>

            {/* Mobile Club Selector Overlay */}
            <div className={`club-selector-mobile ${mobileClubSelectorOpen ? 'visible' : ''}`}>
                <ClubSelector />
            </div>

            {/* Mobile Rakeback Menu Overlay */}
            <div className={`rakeback-menu-mobile ${mobileRakebackMenuOpen ? 'visible' : ''}`}>
                <div className="mobile-menu-header">
                    <h3>Rakeback Options</h3>
                </div>
                <div className="mobile-menu-list">
                    <Link
                        to="/rakeback-data"
                        className={`mobile-menu-item ${location.pathname === '/rakeback-data' ? 'active' : ''}`}
                        onClick={closeMobileMenus}
                    >
                        <span className="nav-icon"><FaFileAlt /></span>
                        <span className="nav-text">Rakeback Data</span>
                    </Link>
                    <Link
                        to="/players-rb-list"
                        className={`mobile-menu-item ${location.pathname === '/players-rb-list' ? 'active' : ''}`}
                        onClick={closeMobileMenus}
                    >
                        <span className="nav-icon"><FaUsers /></span>
                        <span className="nav-text">Players RB List</span>
                    </Link>
                    <Link
                        to="/agents-rb-list"
                        className={`mobile-menu-item ${location.pathname === '/agents-rb-list' ? 'active' : ''}`}
                        onClick={closeMobileMenus}
                    >
                        <span className="nav-icon"><FaUserTie /></span>
                        <span className="nav-text">Agents RB List</span>
                    </Link>
                    <Link
                        to="/super-agents-rb-list"
                        className={`mobile-menu-item ${location.pathname === '/super-agents-rb-list' ? 'active' : ''}`}
                        onClick={closeMobileMenus}
                    >
                        <span className="nav-icon"><FaCrown /></span>
                        <span className="nav-text">Super Agents RB List</span>
                    </Link>
                </div>
            </div>

            {/* Mobile Overlay to close menus */}
            {(mobileClubSelectorOpen || mobileRakebackMenuOpen) && (
                <div className="mobile-overlay" onClick={closeMobileMenus}></div>
            )}
        </>
    );
};

export default Sidebar;