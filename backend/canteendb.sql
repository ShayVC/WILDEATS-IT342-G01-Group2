CREATE TABLE canteen (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    order_date DATETIME NOT NULL,
    total_price DOUBLE NOT NULL,
    items VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL
);