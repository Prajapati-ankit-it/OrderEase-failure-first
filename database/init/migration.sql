-- =========================
-- ENUMS
-- =========================

CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

CREATE TYPE "OrderEventType" AS ENUM (
  'ORDER_REQUESTED',
  'ORDER_VALIDATED',
  'PAYMENT_INITIATED',
  'PAYMENT_SUCCEEDED',
  'PAYMENT_FAILED',
  'ORDER_CONFIRMED',
  'ORDER_CANCELLED'
);

CREATE TYPE "EventSource" AS ENUM (
  'USER',
  'SYSTEM',
  'PAYMENT_GATEWAY'
);

CREATE TYPE "PaymentStatus" AS ENUM (
  'INITIATED',
  'SUCCEEDED',
  'FAILED',
  'REFUNDED'
);

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");

INSERT INTO "users" ("id", "email", "password", "name", "role")
VALUES
  ('u_admin', 'admin@orderease.com', 'hashed_admin_pwd', 'Admin', 'ADMIN'),
  ('u_user1', 'user1@orderease.com', 'hashed_user_pwd', 'User One', 'USER');

CREATE TABLE "foods" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "category" TEXT NOT NULL,
  "image" TEXT,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

INSERT INTO "foods" ("id", "name", "description", "price", "category")
VALUES
  ('f_pizza', 'Pizza', 'Cheese Burst Pizza', 299.00, 'Fast Food'),
  ('f_burger', 'Burger', 'Veg Burger', 149.00, 'Fast Food');

CREATE TABLE "orders" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "idempotencyKey" TEXT UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "orders"
ADD CONSTRAINT "orders_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "orders" ("id", "userId", "idempotencyKey")
VALUES ('o_1001', 'u_user1', 'idem_order_1001');

CREATE TABLE "order_items" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "foodId" TEXT NOT NULL,
  "foodName" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "quantity" INTEGER NOT NULL,

  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "order_items"
ADD CONSTRAINT "order_items_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "orders"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items"
ADD CONSTRAINT "order_items_foodId_fkey"
FOREIGN KEY ("foodId") REFERENCES "foods"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "order_items"
("id", "orderId", "foodId", "foodName", "price", "quantity")
VALUES
  ('oi_1', 'o_1001', 'f_pizza', 'Pizza', 299.00, 1),
  ('oi_2', 'o_1001', 'f_burger', 'Burger', 149.00, 2);

CREATE TABLE "payments" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "status" "PaymentStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "payments"
ADD CONSTRAINT "payments_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "orders"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "payments"
("id", "orderId", "provider", "amount", "status")
VALUES
  ('pay_1001', 'o_1001', 'FAKE_GATEWAY', 597.00, 'SUCCEEDED');

CREATE TABLE "order_events" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "type" "OrderEventType" NOT NULL,
  "payload" JSONB NOT NULL,
  "causedBy" "EventSource" NOT NULL,
  "paymentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "order_events_orderId_createdAt_idx"
ON "order_events" ("orderId", "createdAt");

ALTER TABLE "order_events"
ADD CONSTRAINT "order_events_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "orders"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_events"
ADD CONSTRAINT "order_events_paymentId_fkey"
FOREIGN KEY ("paymentId") REFERENCES "payments"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "order_events"
("id", "orderId", "type", "payload", "causedBy")
VALUES
  ('e1', 'o_1001', 'ORDER_REQUESTED', '{"note":"User placed order"}', 'USER'),
  ('e2', 'o_1001', 'ORDER_VALIDATED', '{"cart":"validated"}', 'SYSTEM'),
  ('e3', 'o_1001', 'PAYMENT_INITIATED', '{"gateway":"FAKE_GATEWAY"}', 'SYSTEM');

INSERT INTO "order_events"
("id", "orderId", "type", "payload", "causedBy", "paymentId")
VALUES
  ('e4', 'o_1001', 'PAYMENT_SUCCEEDED', '{"txn":"success"}', 'PAYMENT_GATEWAY', 'pay_1001'),
  ('e5', 'o_1001', 'ORDER_CONFIRMED', '{"message":"Order confirmed"}', 'SYSTEM');

CREATE TABLE "idempotency_keys" (
  "key" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "response" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("key")
);

INSERT INTO "idempotency_keys"
("key", "requestHash", "response")
VALUES
  ('idem_order_1001', 'hash_cart_abc', '{"orderId":"o_1001"}');

CREATE TABLE "carts" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "carts_userId_key" ON "carts" ("userId");

ALTER TABLE "carts"
ADD CONSTRAINT "carts_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "cart_items" (
  "id" TEXT NOT NULL,
  "cartId" TEXT NOT NULL,
  "foodId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cart_items_cartId_foodId_key"
ON "cart_items" ("cartId", "foodId");

ALTER TABLE "cart_items"
ADD CONSTRAINT "cart_items_cartId_fkey"
FOREIGN KEY ("cartId") REFERENCES "carts"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cart_items"
ADD CONSTRAINT "cart_items_foodId_fkey"
FOREIGN KEY ("foodId") REFERENCES "foods"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

