-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar JSONB,
  createdAt TIMESTAMP DEFAULT NOW(),
  isAdmin BOOLEAN DEFAULT FALSE
);

-- MAPS TABLE
CREATE TABLE IF NOT EXISTS maps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  previewImg VARCHAR(255),
  creator VARCHAR(255) NOT NULL,
  isPublished BOOLEAN DEFAULT FALSE,
  isDeleted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  lastUpdatedAt TIMESTAMP,
  locations JSONB,
  avgScore INTEGER DEFAULT 0,
  usersPlayed INTEGER DEFAULT 0,
  locationCount INTEGER DEFAULT 0,
  likes JSONB,
  bounds JSONB,
  scoreFactor INTEGER
);

-- GAMES TABLE
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  mapId INTEGER REFERENCES maps(id),
  mapName VARCHAR(255),
  userId INTEGER REFERENCES users(id),
  userName VARCHAR(255),
  userAvatar JSONB,
  gameSettings JSONB,
  rounds JSONB,
  guesses JSONB,
  round INTEGER,
  totalPoints INTEGER,
  totalDistance JSONB,
  totalTime INTEGER,
  difficulty VARCHAR(32),
  countryCode VARCHAR(8),
  challengeId INTEGER,
  createdAt TIMESTAMP DEFAULT NOW(),
  state VARCHAR(32),
  mode VARCHAR(32),
  streak INTEGER,
  isDailyChallenge BOOLEAN DEFAULT FALSE
);

-- CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  mapId INTEGER REFERENCES maps(id),
  gameSettings JSONB,
  rounds JSONB,
  guesses JSONB,
  playerId INTEGER REFERENCES users(id)
);

-- MAP_LEADERBOARD TABLE
CREATE TABLE IF NOT EXISTS map_leaderboard (
  id SERIAL PRIMARY KEY,
  mapId INTEGER REFERENCES maps(id),
  scores JSONB,
  avgScore INTEGER,
  usersPlayed INTEGER,
  dailyChallengeId INTEGER
);
