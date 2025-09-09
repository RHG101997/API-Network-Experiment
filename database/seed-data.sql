-- Insert sample users
INSERT INTO users (name, email) VALUES
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Bob Johnson', 'bob@example.com'),
('Alice Brown', 'alice@example.com'),
('Charlie Wilson', 'charlie@example.com');

-- Insert sample products
INSERT INTO products (name, price, category) VALUES
('Laptop', 999.99, 'Electronics'),
('Smartphone', 599.99, 'Electronics'),
('Coffee Mug', 12.99, 'Kitchen'),
('Book: JavaScript Guide', 29.99, 'Books'),
('Wireless Headphones', 149.99, 'Electronics'),
('Desk Chair', 199.99, 'Furniture'),
('Water Bottle', 19.99, 'Sports'),
('Notebook', 5.99, 'Office'),
('USB Cable', 9.99, 'Electronics'),
('Table Lamp', 39.99, 'Home');

-- Insert sample orders
INSERT INTO orders (user_id, total_amount) VALUES
(1, 1149.98),
(2, 179.97),
(1, 42.98),
(3, 599.99),
(4, 249.97);

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 999.99),
(1, 5, 1, 149.99),
(2, 3, 2, 12.99),
(2, 7, 1, 19.99),
(2, 8, 25, 5.99),
(3, 4, 1, 29.99),
(3, 3, 1, 12.99),
(4, 2, 1, 599.99),
(5, 6, 1, 199.99),
(5, 10, 1, 39.99),
(5, 9, 1, 9.99);