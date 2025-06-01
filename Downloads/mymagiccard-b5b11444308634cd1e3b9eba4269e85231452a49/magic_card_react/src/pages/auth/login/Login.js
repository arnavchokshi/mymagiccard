import React, { useState} from 'react'
import { useNavigate, Link } from 'react-router-dom';
import "./Login.css"
import { Button, Form } from 'react-bootstrap';

export const Login = () => {

  const navigate = useNavigate(); // Now you can use the navigate function
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://mymagiccard.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login failed:", errorData.message);
        alert("Login failed: " + errorData.message);
        return;
      }
  
      const result = await response.json();
      console.log("Login result:", result);
  
      localStorage.setItem("token", result.token);
      navigate(`/user/${result.userId}/edit`);
  
    } catch (error) {
      console.error("Network error:", error.message);
      alert("Network error, please try again later.");
    } finally {
      setFormData({
        email: "",
        password: ""
      });
    }
  };
  


  return (
    <div className='center-form'>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          background: "url('/6436961_3312580.jpg') no-repeat center center fixed",
          backgroundSize: 'cover'
        }}
      />
      <Form onSubmit={handleSubmit}>
        <h1 className="gradient-heading">Login</h1>

        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleInputChange}
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
          />
        </Form.Group>

        <Button variant="dark" type="submit" className="w-100">
          Login
        </Button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span>Don't have an account? </span>
          <Link to="/register">Sign up</Link>
        </div>
      </Form>
    </div>
  )
}

export default Login;