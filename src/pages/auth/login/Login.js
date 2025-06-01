import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import { Button, Form } from 'react-bootstrap';
import { API_URLS } from '../../../config';

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(API_URLS.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login failed:", errorData.message);
        setError(errorData.message || 'Login failed. Please try again.');
        return;
      }
  
      const result = await response.json();
      console.log("Login result:", result);
  
      localStorage.setItem("token", result.token);
      navigate(`/user/${result.userId}/edit`);
  
    } catch (error) {
      console.error("Network error:", error.message);
      setError('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className='center-form'>
      <Form onSubmit={handleSubmit}>
        <h1>Login</h1>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Button variant="dark" type="submit" className="w-100">
          Login
        </Button>
      </Form>
    </div>
  );
};

export default Login; 