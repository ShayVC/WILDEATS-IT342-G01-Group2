-- SQL script to recreate the users table
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);


INSERT INTO users (name, email, password) VALUES 
('John Doe', 'john.doe@example.com', 'password123'),
('Jane Smith', 'jane.smith@example.com', 'password456'),
('Michael Johnson', 'michael.johnson@example.com', 'password789'),
('Emily Davis', 'emily.davis@example.com', 'passwordabc'),
('Robert Wilson', 'robert.wilson@example.com', 'passwordxyz');

