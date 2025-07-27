CREATE SCHEMA IF NOT EXISTS afonyapp;

CREATE TABLE IF NOT EXISTS afonyapp.users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email VARCHAR(40) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  cdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  type VARCHAR(6) NOT NULL DEFAULT 'user'
);

-- Az alábbi indexek automatikusan létrejönnek UNIQUE constraint miatt, nem kell kézzel létrehozni:
-- UNIQUE INDEX az email, password és id mezőkre BTREE típussal

-- Ha mégis explicit indexeket szeretnél, így néz ki:
-- CREATE UNIQUE INDEX users_pkey ON afonyapp.users USING BTREE (id);
-- CREATE UNIQUE INDEX users_email_key ON afonyapp.users USING BTREE (email);
-- CREATE UNIQUE INDEX users_password_key ON afonyapp.users USING BTREE (password);

-- 2. Tesztfelhasználók beszúrása
-- INSERT INTO afonyapp.users (email, password, type)
-- VALUES 
--   ('testuser1@example.com', '$2b$10$OmuHZM3ZAkRLU8zOzzqzOeMn/Yujgo9a5E8uRW9I3EvnDNF5hd0bq', 'user'),
--   ('testuser2@example.com', '$2b$10$xtPPPaEnRUsJSg.3YLUsoOpP7fObZ2WozNOMgYnvJ90T0xduZFtKu', 'user'),
--   ('admin@example.com',     '$2b$10$2shP2vwUJqulBIMLVgdRyuzKPktx7fXHOV4mxUFknmN8qxHTPL9ve', 'admin');

-- 🧪 Teszteléshez hasznos:
-- Email	Jelszó	Típus
-- testuser1@example.com	password123	user
-- testuser2@example.com	secret456	user
-- admin@example.com	admin789	admin