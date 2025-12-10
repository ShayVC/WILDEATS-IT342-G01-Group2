import React from "react";
import styled from "styled-components";

function AdminDetailsPage({ admin }) {
  if (!admin) {
    return (
      <Container>
        <Card>
          <Title>Admin Details</Title>
          <Message>No admin selected.</Message>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Title>Admin Details</Title>
        <Detail><strong>ID:</strong> {admin.admin_ID}</Detail>
        <Detail><strong>Name:</strong> {admin.admin_name}</Detail>
        <Detail><strong>Email:</strong> {admin.admin_email}</Detail>
        <Detail><strong>Role:</strong> {admin.role}</Detail>
        <Detail><strong>Shop ID:</strong> {admin.shop_id}</Detail>
      </Card>
    </Container>
  );
}

export default AdminDetailsPage;


const Container = styled.div`
  max-width: 800px;
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
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const Detail = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin: 0.5rem 0;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: #888;
`;
