-- Initial data for Music Library Database
-- Run this after creating the database schema

-- Insert Platforms
INSERT INTO Platform (name, type, url) VALUES
('YouTube', 1, 'https://www.youtube.com/results?search_query='),
('NicoVideo', 1, 'https://www.nicovideo.jp/search/'),
('Bilibili', 1, 'https://search.bilibili.com/all?keyword='),
('Amazon Music', 2, 'https://www.amazon.co.jp/s?k=');

-- Insert Categories
INSERT INTO Category (name, name_english) VALUES
('POPS&アニメ', 'POPS&ANIME'), -- anime songs and popular songs
('niconico&ボーカロイド', 'NICONICO&VOCALOID'), -- niconico and vocaloid songs
('東方Project', 'TOUHOU Project'), -- touhou project songs
('ゲーム＆バラエティ', 'GAME&VARIETY'), -- songs from games
('maimai', 'maimai'), -- songs from maimai
('オンゲキ', 'ONGEKI'), -- songs from ongeki
('CHUNITHM', 'CHUNITHM'), -- songs from chunithm
('イロドリミドリ','IRODORIMIDORI'); -- songs from IRODORIMIDORI, a Chunithm Idol Project
