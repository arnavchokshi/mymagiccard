import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';  // Add this import for useNavigate
import "./Signup.css";

const Signup = () => {

  const navigate = useNavigate(); // Now you can use the navigate function
  const [formData, setFormData] = useState({
    email: '',
    name: '',
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
      const response = await fetch("https://mymagiccard.onrender.com/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json(); // Fixed the typo from "respone" to "response"
      console.log(result);
      navigate("/login");  // Redirect to login after successful signup
    } catch (error) {
      console.error(error.message);  // Fixed the typo from "error.essage" to "error.message"
    } finally {
      setFormData({
        email: "",
        name: "",
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
        <h1 className="gradient-heading">Signup</h1>

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

        <Form.Group controlId="formBasicName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Enter Name"
            value={formData.name}
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
          Signup
        </Button>
      </Form>
    </div>
  );
};

export default Signup;