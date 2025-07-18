 /*
 * Represents the type of a platform.
 * 1: Video Platform
 * 2: Music Streaming Platform
 * 3: Online Store
 * 0: Other
 */
export enum PlatformType {
  Other = 0,
  Video = 1,
  Music = 2,
  OnlineStore = 3,
}

/**
 * Corresponds to the `Platform` table in the database.
 */
export type Platforms = {
  id: number;
  name: string;
  type: PlatformType;
  url: string;
};

/**
 * Corresponds to the `Category` table in the database.
 */
export type Category = {
  id: number;
  name: string;
  name_english: string;
};


/**
 * Corresponds to the `Song` table in the database.
 */
export type Song = {
  id: number;
  title?: string;
  title_hiragana?: string;
  title_katakana?: string;
  title_romaji?: string;
  artist: string;
  description?: string;
  category_id: number;
  add_time: number;
  from_platform?: number;
  from_url?: string;
  image_url?: string;
};

/*
 * This is use for Metadata searching via API endpoints, no database table needed
*/
export type Metadata = {
    title?: string;
    artist: string;
    fromUrl?: string;
    imageUrl?: string;
}

