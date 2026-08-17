-- PokePanion community meta — D1 schema
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  day TEXT NOT NULL,
  battle TEXT NOT NULL,
  species TEXT NOT NULL,
  ability TEXT DEFAULT '',
  item TEXT DEFAULT '',
  nature TEXT DEFAULT '',
  moves TEXT DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_logs_day ON logs(day);
CREATE INDEX IF NOT EXISTS idx_logs_species ON logs(species);
CREATE TABLE IF NOT EXISTS ipcount (
  ip TEXT NOT NULL,
  day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip, day)
);
