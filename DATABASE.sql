-- Music Library Database Schema
-- SQLite Database

-- Create Category table
CREATE TABLE Category (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL UNIQUE,
    name_english TEXT NOT NULL UNIQUE
);

-- Create Platform table
CREATE TABLE Platform (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL UNIQUE,
    type INTEGER NOT NULL, -- 1: Video, 2: Music, 3: Online Store, 0: Other
    url TEXT
);

-- Create Song table
CREATE TABLE Song (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT,
    title_hiragana TEXT,
    title_katakana TEXT,
    title_romaji TEXT,
    artist TEXT NOT NULL,
	description TEXT,
    category_id INTEGER NOT NULL,
    add_time INTEGER NOT NULL,
    from_platform INTEGER,
    from_url TEXT,
    image_url TEXT,
    FOREIGN KEY (category_id) REFERENCES Category(id),
    FOREIGN KEY (from_platform) REFERENCES Platform(id)
);
