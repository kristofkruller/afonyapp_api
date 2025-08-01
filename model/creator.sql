CREATE SCHEMA IF NOT EXISTS afonyapp;

-- Az alábbi indexek automatikusan létrejönnek UNIQUE constraint miatt, nem kell kézzel létrehozni:
-- UNIQUE INDEX pl. a users. email és id mezőkre BTREE típussal
-- Ha mégis explicit indexeket szeretnél, így néz ki:
-- CREATE UNIQUE INDEX users_pkey ON afonyapp.users USING BTREE (id);
-- CREATE UNIQUE INDEX users_email_key ON afonyapp.users USING BTREE (email);

CREATE TABLE IF NOT EXISTS afonyapp.users(
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email VARCHAR(255) NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  cdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "type" VARCHAR(10) NOT NULL DEFAULT 'user',
  validated BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS afonyapp.amount_options(
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  kg INTEGER NOT NULL,
  cost NUMERIC(10,2) NOT NULL,
  isvalid BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS afonyapp.delivery_options(
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  city VARCHAR(255) NOT NULL,
  cost NUMERIC(10,2) NOT NULL,
  isvalid BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS afonyapp.crop(
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  available_start DATE NOT NULL,
  available_end DATE NOT NULL,
  available_note TEXT NOT NULL,
  "location" VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL
);

CREATE TYPE afonyapp.delivery_method AS ENUM (
  'Személyes átvétel',
  'Házhozszállítás'
);

CREATE TYPE afonyapp.order_status AS ENUM (
  'Beérkezett',
  'Értesített',
  'Megerősített',
  'Teljesített',
  'Lemondott'
);

CREATE TABLE IF NOT EXISTS afonyapp.orders (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cropid INTEGER NOT NULL REFERENCES afonyapp.crop(id),
  deliverytype afonyapp.delivery_method NOT NULL,
  deliverycity INTEGER NOT NULL REFERENCES afonyapp.delivery_options(id),
  deliveryaddress VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL REFERENCES afonyapp.users(email),
  "name" VARCHAR(255) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  amountid INTEGER NOT NULL REFERENCES afonyapp.amount_options(id),
  "status" afonyapp.order_status NOT NULL,
  cdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
)

-- 🧪 Tesztfelhasználók beszúrása
-- INSERT INTO afonyapp.users (email, password, type, validated)
-- VALUES 
--   ('testuser1@example.com', '$2b$10$OmuHZM3ZAkRLU8zOzzqzOeMn/Yujgo9a5E8uRW9I3EvnDNF5hd0bq', 'user', true),
--   ('testuser2@example.com', '$2b$10$xtPPPaEnRUsJSg.3YLUsoOpP7fObZ2WozNOMgYnvJ90T0xduZFtKu', 'user', true),
--   ('admin@example.com',     '$2b$10$2shP2vwUJqulBIMLVgdRyuzKPktx7fXHOV4mxUFknmN8qxHTPL9ve', 'admin', true);

-- 🧪 Minden típus létrejött-e
-- SELECT n.nspname AS schema, t.typname AS enum_type, e.enumlabel AS value
-- FROM pg_type t
-- JOIN pg_enum e ON t.oid = e.enumtypid
-- JOIN pg_namespace n ON n.oid = t.typnamespace
-- WHERE n.nspname = 'afonyapp'
-- ORDER BY enum_type, e.enumsortorder;