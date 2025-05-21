import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_URLS } from '../../config';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log("Token used for request:", token);
        
        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/login");
          return;
        }
        
        console.log("Making request to API");
        const response = await fetch(API_URLS.users, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error ${response.status}:`, errorText);
          throw new Error(`API returned ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response data:", result);
        
        // Safe handling for any response format
        if (Array.isArray(result)) {
          setUsers(result);
        } else if (result.users && Array.isArray(result.users)) {
          setUsers(result.users);
        } else if (typeof result === 'object' && result !== null) {
          // Handle single user object or other object responses
          // Convert to array if it's a user object
          if (result.name || result.email) {
            setUsers([result]);
          } else {
            console.warn("Unexpected object format:", result);
            setUsers([]);
          }
        } else {
          console.error("Unexpected response format:", result);
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(`Failed to load users: ${error.message}`);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h1 className="text-center">Dashboard</h1>
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : error ? (
            <p className="text-center text-danger">{error}</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user._id || index}>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center">No users found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;