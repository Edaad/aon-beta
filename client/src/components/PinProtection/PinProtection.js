import React, { useState, useEffect } from 'react';
import './PinProtection.css';

const PinProtection = ({ children, requiredPin = "1234" }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);

    // Check if already unlocked in this session
    useEffect(() => {
        const sessionUnlocked = sessionStorage.getItem('dashboard_unlocked');
        if (sessionUnlocked === 'true') {
            setIsUnlocked(true);
        }
    }, []);

    const handlePinSubmit = (e) => {
        e.preventDefault();

        if (enteredPin === requiredPin) {
            setIsUnlocked(true);
            setError('');
            // Store unlock status in session storage (clears when browser/tab closes)
            sessionStorage.setItem('dashboard_unlocked', 'true');
        } else {
            setError('Incorrect PIN. Please try again.');
            setAttempts(prev => prev + 1);
            setEnteredPin('');

            // Add a small delay after failed attempts
            if (attempts >= 2) {
                setError('Too many failed attempts. Please wait 5 seconds.');
                setTimeout(() => {
                    setError('Incorrect PIN. Please try again.');
                    setAttempts(0);
                }, 5000);
            }
        }
    };

    const handlePinChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 6) { // Limit to 6 digits
            setEnteredPin(value);
            if (error && attempts < 3) {
                setError('');
            }
        }
    };

    const handleLogout = () => {
        setIsUnlocked(false);
        setEnteredPin('');
        setError('');
        setAttempts(0);
        sessionStorage.removeItem('dashboard_unlocked');
    };

    // If unlocked, show the protected content with logout option
    if (isUnlocked) {
        return (
            <div className="protected-content">
                <div className="logout-header">
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Lock Dashboard"
                    >
                        🔒 Lock
                    </button>
                </div>
                {children}
            </div>
        );
    }

    // Show PIN entry form
    return (
        <div className="pin-protection-overlay">
            <div className="pin-protection-modal">
                <div className="pin-protection-header">
                    <h2>🔐 Dashboard Access</h2>
                    <p>Please enter the PIN to access the dashboard</p>
                </div>

                <form onSubmit={handlePinSubmit} className="pin-form">
                    <div className="pin-input-container">
                        <input
                            type="password"
                            value={enteredPin}
                            onChange={handlePinChange}
                            placeholder="Enter PIN"
                            className={`pin-input ${error ? 'error' : ''}`}
                            maxLength="6"
                            autoFocus
                            disabled={attempts >= 3}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="pin-submit-btn"
                        disabled={!enteredPin || attempts >= 3}
                    >
                        Unlock Dashboard
                    </button>
                </form>

                <div className="pin-hint">
                    <small>💡 Access is session-based and will expire when you close the browser</small>
                </div>
            </div>
        </div>
    );
};

export default PinProtection;
