CREATE SCHEMA IF NOT EXISTS afonyapp;

-- Az alábbi indexek automatikusan létrejönnek UNIQUE constraint miatt, nem kell kézzel létrehozni:
-- UNIQUE INDEX pl. a users. email és id mezőkre BTREE típussal
-- Ha mégis explicit indexeket szeretnél, így néz ki:
-- CREATE UNIQUE INDEX users_pkey ON afonyapp.users USING BTREE (id);
-- CREATE UNIQUE INDEX users_email_key ON afonyapp.users USING BTREE (email);

-- 🧪 Tesztfelhasználók beszúrása
-- INSERT INTO afonyapp.users (email, password, type, validated)
-- VALUES 
--   ('testuser1@example.com', '$2b$10$OmuHZM3ZAkRLU8zOzzqzOeMn/Yujgo9a5E8uRW9I3EvnDNF5hd0bq', 'user', true),
--   ('testuser2@example.com', '$2b$10$xtPPPaEnRUsJSg.3YLUsoOpP7fObZ2WozNOMgYnvJ90T0xduZFtKu', 'user', true),
--   ('admin@example.com',     '$2b$10$2shP2vwUJqulBIMLVgdRyuzKPktx7fXHOV4mxUFknmN8qxHTPL9ve', 'admin', true);

CREATE TABLE IF NOT EXISTS users(
  "id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "cdate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "type" VARCHAR(10) NOT NULL DEFAULT 'user',
  "validated" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS amount_options(
  "id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "kg" INTEGER NOT NULL,
  "cost" NUMERIC(10,2) NOT NULL,
  "isvalid" BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS delivery_options(
  "id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "city" VARCHAR(255) NOT NULL,
  "cost" NUMERIC(10,2) NOT NULL,
  "isvalid" BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS crop(
  "id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "availableStart" DATE NOT NULL,
  "availableEnd" DATE NOT NULL,
  "availableNote" TEXT NOT NULL,
  "location" VARCHAR(255) NOT NULL,
  "amount" INTEGER NOT NULL
);

CREATE TYPE delivery_method AS ENUM (
  "Személyes átvétel",
  "Házhozszállítás"
);

CREATE TYPE order_status AS ENUM (
  "Beérkezett",
  "Értesített",
  "Megerősített",
  "Teljesített",
  "Lemondott"
);

CREATE TABLE IF NOT EXISTS orders(
  "id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "cropid" INTEGER NOT NULL REFERENCES crop('id'),
  "deliverytype" delivery_method NOT NULL,
  "deliverycity" INTEGER NOT NULL REFERENCES delivery_options('id'),
  "deliveryaddress" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL REFERENCES users('email'),
  "name" VARCHAR(255) NOT NULL,
  "telephone" VARCHAR(20) NOT NULL,
  "amountid" INTEGER NOT NULL REFERENCES amount_options('id'),
  "status" order_status NOT NULL,
  "cdate" DATE NOT NULL
);