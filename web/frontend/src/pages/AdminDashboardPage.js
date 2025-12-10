import React, { useContext } from "react";
import styled from "styled-components";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

function AdminDashboardPage() {
  const { admin } = useContext(AuthContext);

  return (
    <Container>
      <Card>
        <Title>Admin Dashboard</Title>
        <Welcome>
          Welcome, <strong>{admin?.admin_name || "Admin"}</strong> ({admin?.role || "Role"})
        </Welcome>
      </Card>

      <Card style={{ marginTop: "2rem" }}>
        <Subtitle>Quick Actions</Subtitle>
        <Actions>
          <ActionButton as={Link} to="/shops">Manage Shops</ActionButton>
          <ActionButton as={Link} to="/items">Manage Items</ActionButton>
          <ActionButton as={Link} to="/orders">Manage Orders</ActionButton>
          <ActionButton as={Link} to="/users">Manage Users</ActionButton>
        </Actions>
      </Card>
    </Container>
  );
}

export default AdminDashboardPage;


const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #444;
`;

const Welcome = styled.p`
  font-size: 1.2rem;
  color: #555;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background-color: #2196f3;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
  text-align: center;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0b7dda;
  }
`;
