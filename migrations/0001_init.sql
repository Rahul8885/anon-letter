CREATE TABLE messages (
  id          TEXT     PRIMARY KEY,
  slug        TEXT     UNIQUE NOT NULL,
  template_id TEXT     NOT NULL,
  message     TEXT     NOT NULL CHECK(length(message) <= 800),
  from_hint   TEXT,
  bg_color    TEXT,
  accent      TEXT,
  font_key    TEXT,
  status      TEXT     DEFAULT 'sent'
               CHECK(status IN ('sent','read','reported','expired')),
  read_at     INTEGER,
  report_at   INTEGER,
  expires_at  INTEGER  NOT NULL,
  created_at  INTEGER  NOT NULL
);

CREATE INDEX idx_slug     ON messages(slug);
CREATE INDEX idx_expires  ON messages(expires_at);
CREATE INDEX idx_status   ON messages(status);

CREATE TABLE rate_limits (
  ip_hash      TEXT     NOT NULL,
  window_start INTEGER  NOT NULL,
  count        INTEGER  DEFAULT 0,
  PRIMARY KEY (ip_hash, window_start)
);
