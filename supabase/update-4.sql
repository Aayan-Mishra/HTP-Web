-- Migration: Add total_boxes column to products table
-- Date: 2025
-- Description: Adds a total_boxes field to track container/packaging quantity

-- Add total_boxes column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS total_boxes INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN products.total_boxes IS 'Total number of boxes or containers for this product';
