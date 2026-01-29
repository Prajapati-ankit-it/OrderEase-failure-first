-- Convert price fields from DOUBLE PRECISION (Float) to INTEGER (cents)
-- This migration converts all monetary values to cents to avoid floating-point precision errors
-- Example: $10.00 becomes 1000 cents

-- Step 1: Convert Food.price from Float to Int (multiply by 100 and round)
ALTER TABLE "foods" ALTER COLUMN "price" TYPE INTEGER USING ROUND("price" * 100);

-- Step 2: Convert OrderItem.price from Float to Int (multiply by 100 and round)
ALTER TABLE "order_items" ALTER COLUMN "price" TYPE INTEGER USING ROUND("price" * 100);

-- Step 3: Convert Payment.amount from Float to Int (multiply by 100 and round)
ALTER TABLE "payments" ALTER COLUMN "amount" TYPE INTEGER USING ROUND("amount" * 100);
