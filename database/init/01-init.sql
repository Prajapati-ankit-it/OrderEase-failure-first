-- Database initialization script for OrderEase
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional schemas if needed (optional)
-- CREATE SCHEMA IF NOT EXISTS orderease_schema;

-- Set up permissions (optional, for more complex setups)
-- GRANT ALL PRIVILEGES ON DATABASE orderease TO postgres;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'OrderEase database initialized successfully';
END $$;
