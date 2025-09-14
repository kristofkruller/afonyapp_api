-- 🌻 INIT DB

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
  validated BOOLEAN NOT NULL DEFAULT false,
  nick TEXT DEFAULT ''
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

-- 🧪 Minden típus létrejött-e
-- SELECT n.nspname AS schema, t.typname AS enum_type, e.enumlabel AS value
-- FROM pg_type t
-- JOIN pg_enum e ON t.oid = e.enumtypid
-- JOIN pg_namespace n ON n.oid = t.typnamespace
-- WHERE n.nspname = 'afonyapp'
-- ORDER BY enum_type, e.enumsortorder;

-- 🌱 SEEDING 
-- 🫘 Insert sorrend: users → amount_options → delivery_options → crop → orders, így minden foreign key létező rekordra mutat.

-- 🌱 Tesztfelhasználók beszúrása
INSERT INTO afonyapp.users (email, "password", "type", validated, nick)
VALUES
  ('user1@example.com',  '$2b$10$OmuHZM3ZAkRLU8zOzzqzOeMn/Yujgo9a5E8uRW9I3EvnDNF5hd0bq', 'user',  true,  'User One'),
  ('user2@example.com',  '$2b$10$xtPPPaEnRUsJSg.3YLUsoOpP7fObZ2WozNOMgYnvJ90T0xduZFtKu', 'user',  true,  'User Two'),
  ('admin@example.com',  '$2b$10$2shP2vwUJqulBIMLVgdRyuzKPktx7fXHOV4mxUFknmN8qxHTPL9ve', 'admin', true,  'Admin');

-- 🌱 Amount options (kg, ár, érvényes-e)
INSERT INTO afonyapp.amount_options (kg, cost, isvalid)
VALUES
  (1,  1500.00, true),
  (2,  2800.00, true),
  (5,  6500.00, true),
  (10, 12000.00, false);

-- 🌱 Delivery options (város, ár, érvényes-e)
INSERT INTO afonyapp.delivery_options (city, cost, isvalid)
VALUES
  ('Házhozszállítás',   0, true),
  ('Budapest',    2500.00, true),
  ('Debrecen',    3000.00, true),
  ('Szeged',      2800.00, true),
  ('Pécs',        3500.00, false);

-- 🌱 Crop (időszak, helyszín, készlet)
INSERT INTO afonyapp.crop (available_start, available_end, available_note, "location", amount)
VALUES
  ('2025-01-01', '2025-01-01', 'Regisztrált új rendelés', 'Csemő', 0),
  ('2025-08-01', '2025-08-15', 'Korai szüret, kiváló minőség', 'Szekszárd', 200),
  ('2025-08-16', '2025-08-31', 'Másodszüret, magas cukortartalom', 'Villány', 300),
  ('2025-09-01', '2025-09-15', 'Utószüret, különleges aroma', 'Eger', 150);

-- 🌱 Orders (összekapcsolt táblák alapján)
INSERT INTO afonyapp.orders (
  cropid, deliverytype, deliverycity, deliveryaddress,
  email, "name", telephone, amountid, "status"
) VALUES
  (1, 'Személyes átvétel', 1, 'Kossuth Lajos utca 12.', 'user1@example.com', 'Kiss Péter', '+36201234567', 2, 'Beérkezett'),
  (2, 'Házhozszállítás',  2, 'Fő tér 5.',              'user2@example.com', 'Nagy Anna',  '+36203334455', 3, 'Értesített'),
  (3, 'Házhozszállítás',  3, 'Petőfi Sándor utca 8.',  'user1@example.com', 'Tóth Gábor', '+36209998877', 1, 'Megerősített');

