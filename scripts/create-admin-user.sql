-- Insert an initial admin user with the correct domain
INSERT INTO admin_users (email, name)
VALUES ('admin@logisticcanada.ca', 'Admin User')
ON CONFLICT (email) DO NOTHING;
