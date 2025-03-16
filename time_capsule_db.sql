-- Create Database
CREATE DATABASE IF NOT EXISTS time_capsule_db;

USE time_capsule_db;

SELECT * FROM capsules;

-- Capsules Table
CREATE TABLE capsules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capsule_type ENUM('private', 'public') NOT NULL,
    capsule_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    unlock_date DATE NOT NULL,
    message TEXT NOT NULL,
    public_preview TEXT,
    password_hash VARCHAR(255),
    media_url VARCHAR(255),
    is_opened BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_capsule_name_length CHECK (LENGTH(capsule_name) >= 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Access Tokens Table
CREATE TABLE access_tokens (
    token VARCHAR(255) PRIMARY KEY,
    capsule_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 30 DAY),

    FOREIGN KEY (capsule_id) 
        REFERENCES capsules(id) 
        ON DELETE CASCADE 
        ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes
CREATE INDEX idx_capsule_type ON capsules(capsule_type);
CREATE INDEX idx_unlock_date ON capsules(unlock_date);
CREATE INDEX idx_email ON capsules(email);
CREATE INDEX idx_access_token_capsule ON access_tokens(capsule_id);