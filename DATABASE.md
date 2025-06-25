Music Library Database Schema Details
=====

Database Engine: SQLite

Tables
-----

Properties:<br/>
PK: Primary Key<br/>
NN: Not Null<br/>
UQ: Unique<br/>
AI: Auto Increment<br/>
FK: Foreign Key<br/>
DIC: Dictionary<br/>

### Category

| Column Name | Type | Description | Properties |
|-------------|------|-------------|-----------|
| id          | int  | Category ID | PK,NN,AI |
| name        | text | Category Name | NN,UQ |

### Platform

| Column Name | Type | Description | Properties |
|-------------|------|-------------|-----------|
| id          | int  | Platform ID | PK,NN,AI |
| name        | text | Platform Name | NN,UQ |
| type        | int | Platform Type | NN,DIC(1: Video, 2: Music, 3: Online Store, 0: Other)  |
| url         | text | Platform Search Base URL |  |

### Song

| Column Name | Type | Description | Properties |
|-------------|------|-------------|-----------|
| id          | int  | Song ID | PK,NN,AI |
| title       | text | Song Title |  |
| title_hiragana | text | Song Title in Hiragana |  |
| title_katakana | text | Song Title in Katakana |  |
| title_romaji | text | Song Title in Romaji or English |  |
| artist      | text | Song Artist | NN |
| category_id | int  | Song Category ID | FK,NN |
| add_time    | long | Song Add Time | NN |
| from_platform | int | Song Source Platform ID | FK  |
| from_url    | text | Song Source URL |  |
| image_url   | text | Song Thumbnail Image URL |  |