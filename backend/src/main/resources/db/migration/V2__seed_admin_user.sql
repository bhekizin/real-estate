-- Insert default admin user (password: admin123 - BCrypt encoded)
INSERT INTO users (first_name, last_name, email, password, role, active)
VALUES ('System', 'Admin', 'admin@realestate.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', TRUE);

-- Insert sample agent user (password: agent123 - BCrypt encoded)
INSERT INTO users (first_name, last_name, email, password, phone, role, active)
VALUES ('John', 'Agent', 'agent@realestate.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+27 71 234 5678', 'AGENT', TRUE);
