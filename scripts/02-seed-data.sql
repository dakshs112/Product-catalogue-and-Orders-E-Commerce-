-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, stock_quantity) VALUES
('Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 199.99, '/placeholder.svg?height=300&width=300', 'Electronics', 50),
('Smartphone', 'Latest model smartphone with advanced camera features', 899.99, '/placeholder.svg?height=300&width=300', 'Electronics', 25),
('Laptop', 'Powerful laptop for work and gaming', 1299.99, '/placeholder.svg?height=300&width=300', 'Electronics', 15),
('Coffee Maker', 'Automatic coffee maker with programmable settings', 149.99, '/placeholder.svg?height=300&width=300', 'Home & Kitchen', 30),
('Running Shoes', 'Comfortable running shoes for all terrains', 129.99, '/placeholder.svg?height=300&width=300', 'Sports & Outdoors', 75),
('Backpack', 'Durable backpack perfect for travel and daily use', 79.99, '/placeholder.svg?height=300&width=300', 'Fashion', 40),
('Desk Chair', 'Ergonomic office chair with lumbar support', 299.99, '/placeholder.svg?height=300&width=300', 'Furniture', 20),
('Water Bottle', 'Insulated stainless steel water bottle', 24.99, '/placeholder.svg?height=300&width=300', 'Sports & Outdoors', 100),
('Bluetooth Speaker', 'Portable Bluetooth speaker with excellent sound quality', 89.99, '/placeholder.svg?height=300&width=300', 'Electronics', 60),
('Yoga Mat', 'Non-slip yoga mat for exercise and meditation', 39.99, '/placeholder.svg?height=300&width=300', 'Sports & Outdoors', 80);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see order items for their own orders
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Users can only see and modify their own cart items
CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can modify own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Products are publicly readable
CREATE POLICY "Products are publicly readable" ON products FOR SELECT TO public USING (true);
