-- =============================================
-- LIMITLY - SaaS URL Shortener Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS limitly_db;
USE limitly_db;

-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  plan ENUM('free', 'pro') DEFAULT 'free',
  razorpay_subscription_id VARCHAR(255) NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(255) NULL,
  reset_token_expires TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- If users table already exists, run this to add the new columns:
-- ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
-- ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL;

-- If links table already exists, run this to add unique_visit support:
-- ALTER TABLE links MODIFY expiry_type ENUM('one_time','time_based','click_limit','never','unique_visit') DEFAULT 'one_time';

-- Links Table
CREATE TABLE links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  original_url TEXT NOT NULL,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NULL,
  is_expired BOOLEAN DEFAULT FALSE,
  is_password_protected BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255) NULL,
  expiry_type ENUM('one_time', 'time_based', 'click_limit', 'never', 'unique_visit') DEFAULT 'one_time',
  expiry_value INT NULL,              -- seconds for time_based, count for click_limit
  expires_at TIMESTAMP NULL,          -- for time_based expiry
  max_clicks INT NULL,                -- for click_limit expiry
  total_clicks INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  -- UTM Tracking Parameters
  utm_source   VARCHAR(255) NULL,
  utm_medium   VARCHAR(255) NULL,
  utm_campaign VARCHAR(255) NULL,
  utm_content  VARCHAR(255) NULL,
  utm_term     VARCHAR(255) NULL,
  utm_id       VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- If links table already exists, run these:
-- ALTER TABLE links ADD COLUMN utm_source   VARCHAR(255) NULL;
-- ALTER TABLE links ADD COLUMN utm_medium   VARCHAR(255) NULL;
-- ALTER TABLE links ADD COLUMN utm_campaign VARCHAR(255) NULL;
-- ALTER TABLE links ADD COLUMN utm_content  VARCHAR(255) NULL;
-- ALTER TABLE links ADD COLUMN utm_term     VARCHAR(255) NULL;
-- ALTER TABLE links ADD COLUMN utm_id       VARCHAR(255) NULL;

-- Click Analytics Table
CREATE TABLE click_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  link_id INT NOT NULL,
  ip_address VARCHAR(50) NULL,
  user_agent TEXT NULL,
  country VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  referer VARCHAR(255) NULL,
  device_type ENUM('mobile', 'desktop', 'tablet', 'unknown') DEFAULT 'unknown',
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);

-- Payment Orders Table
CREATE TABLE payment_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  razorpay_order_id VARCHAR(255) NOT NULL,
  razorpay_payment_id VARCHAR(255) NULL,
  amount INT NOT NULL,              -- in paise (₹499 = 49900)
  currency VARCHAR(10) DEFAULT 'INR',
  status ENUM('created', 'paid', 'failed') DEFAULT 'created',
  plan VARCHAR(50) DEFAULT 'pro',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- QR Codes Table
CREATE TABLE qrcodes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NULL,
  destination_url TEXT NOT NULL,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  fg_color VARCHAR(10) DEFAULT '#000000',
  bg_color VARCHAR(10) DEFAULT '#ffffff',
  total_scans INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- vCards Table
CREATE TABLE vcards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  job_title VARCHAR(150) NULL,
  company VARCHAR(150) NULL,
  email VARCHAR(150) NULL,
  phone VARCHAR(30) NULL,
  website VARCHAR(255) NULL,
  address TEXT NULL,
  bio TEXT NULL,
  total_scans INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Forms Table
CREATE TABLE forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  fields JSON NOT NULL,
  total_responses INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Form Responses Table
CREATE TABLE form_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  response_data JSON NOT NULL,
  ip_address VARCHAR(50) NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Indexes for Performance
CREATE INDEX idx_links_short_code ON links(short_code);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_click_logs_link_id ON click_logs(link_id);
CREATE INDEX idx_click_logs_clicked_at ON click_logs(clicked_at);
CREATE INDEX idx_qrcodes_short_code ON qrcodes(short_code);
CREATE INDEX idx_vcards_short_code ON vcards(short_code);
CREATE INDEX idx_forms_short_code ON forms(short_code);
