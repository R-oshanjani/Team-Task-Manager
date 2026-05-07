import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register, user } = useContext(AuthContext);

    if (user) {
        return <Navigate to="/" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
        } catch (err) {
            if (err.response && err.response.data) {
                const data = err.response.data;
                const messages = Object.values(data).flat();
                setError(messages[0] || 'Registration failed.');
            } else {
                setError('Failed to connect to the server. Is it running?');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-box animate-fade-in">
                <h2 className="text-gradient" style={{ marginBottom: '24px', textAlign: 'center', fontSize: '2rem' }}>Create Account</h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                        Sign Up
                    </button>
                </form>
                <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
