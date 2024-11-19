import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';
import Scroll from './scroll';

const Login = () => {
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        userType: 'USER', // Default user type
    });

    const [monitoringData, setMonitoringData] = useState({
        userId: '',
        monitoringPassword: '',
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Handle login form input changes
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    // Handle parental monitoring input changes
    const handleMonitoringChange = (e) => {
        const { name, value } = e.target;
        setMonitoringData({ ...monitoringData, [name]: value });
    };

    // Change user type (USER / ADMIN)
    const handleUserTypeChange = (type) => {
        setLoginData({ ...loginData, userType: type });
    };

    // Handle login form submission
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        console.log('Login Data:', loginData); // Log login data before sending

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: loginData.email,
                password: loginData.password,
                userType: loginData.userType,
            });

            console.log('Login successful:', response.data); // Log the successful response
            setErrorMessage('');
            setSuccessMessage('Login successful!');

            // Storing user details in local storage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.user.userId);
            localStorage.setItem('userName', response.data.user.name);
            localStorage.setItem('userType', response.data.user.userType); // Store userType
            

            // Navigate based on user type
            if (response.data.user.userType === 'USER') {
                navigate('/dashboard');
            } else if (response.data.user.userType === 'ADMIN') {
                navigate('/admin-dashboard');
            }
        } catch (error) {
            const message = error.response?.data?.error || 'An error occurred';
            setErrorMessage(message);
            console.error('Error during login:', error);
        }
    };

    // Handle parental monitoring form submission
    const handleMonitoringSubmit = (e) => {
        e.preventDefault();
        console.log('Parental Monitoring submitted:', monitoringData);
        setSuccessMessage('Parental monitoring access granted successfully.');
        // Add your logic here to handle parental monitoring if necessary
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Login</h2>

                <div className="user-type-container">
                    <div
                        className={`user-type-button ${loginData.userType === 'USER' ? 'active' : ''}`}
                        onClick={() => handleUserTypeChange('USER')}
                    >
                        USER
                    </div>
                    <div
                        className={`user-type-button ${loginData.userType === 'ADMIN' ? 'active' : ''}`}
                        onClick={() => handleUserTypeChange('ADMIN')}
                    >
                        ADMIN
                    </div>
                    <div className={`indicator ${loginData.userType}`} />
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <form onSubmit={handleLoginSubmit}>
                    <div className="form-group">
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={loginData.email}
                                onChange={handleLoginChange}
                                required
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Password:
                            <input
                                type="password"
                                name="password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                required
                            />
                        </label>
                    </div>
                    <button type="submit">Submit</button>
                </form>

                <p>
                    New user? <Link to="/signup">Signup</Link> | <Link to="/forgot-password">Forgot Password?</Link>
                </p>
            </div>

            {/* Parental Monitoring Section */}
            <div className="monitoring-container">
                <h2>Parental Monitoring</h2>
                <form onSubmit={handleMonitoringSubmit}>
                    <div className="form-group">
                        <label>
                            User ID:
                            <input
                                type="text"
                                name="userId"
                                value={monitoringData.userId}
                                onChange={handleMonitoringChange}
                                required
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Password:
                            <input
                                type="password"
                                name="monitoringPassword"
                                value={monitoringData.monitoringPassword}
                                onChange={handleMonitoringChange}
                                required
                            />
                        </label>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </div>

            <Scroll />
        </div>
    );
};

export default Login;
