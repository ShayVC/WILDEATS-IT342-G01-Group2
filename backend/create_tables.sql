-- SQL script to create both users and shop_entity tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Insert sample data into users table
INSERT INTO users (name, email, password) VALUES 
('John Doe', 'john.doe@example.com', 'password123'),
('Jane Smith', 'jane.smith@example.com', 'password456'),
('Michael Johnson', 'michael.johnson@example.com', 'password789'),
('Emily Davis', 'emily.davis@example.com', 'passwordabc'),
('Robert Wilson', 'robert.wilson@example.com', 'passwordxyz');

-- Create shop_entity table
CREATE TABLE IF NOT EXISTS shop_entity (
    shop_id INT AUTO_INCREMENT PRIMARY KEY,
    shop_name VARCHAR(100) NOT NULL,
    contact_info INT NOT NULL
);

-- Insert sample data into shop_entity table
INSERT INTO shop_entity (shop_name, contact_info) VALUES 
--('Coffee Corner', 123456789),
--('Burger Palace', 987654321),
--('Salad Bar', 456789123),
--('Pizza Heaven', 789123456),
--('Sushi Express', 321654987);
