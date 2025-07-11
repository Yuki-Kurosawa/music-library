import { Song } from '@/types/database';
import { AppConfig } from './Config';

/**
 * API endpoints for the music library service.
 * 
 * This module provides functions to construct URLs for various API endpoints
 * related to songs, categories, and platforms.
 */

/*
 * NOTE: Due to WAF settings, API Endpoints can use GET and POST http methods only.
*/

export const ServiceAPI={
	GetSongs: (page: number) => `${AppConfig.ServerURL}api/songs?page=${page}`,
	GetSong: (id: number) => `${AppConfig.ServerURL}api/songs/${id}`,
	CreateSong: (song: Omit<Song, 'id'>) => `${AppConfig.ServerURL}api/songs`,
	UpdateSong: (id: number, song: Partial<Song>) => `${AppConfig.ServerURL}api/songs/${id}`,
	DeleteSong: (id: number) => `${AppConfig.ServerURL}api/songs/delete/${id}`,
	GetCategories: () => `${AppConfig.ServerURL}api/categories`,
	GetPlatforms: () => `${AppConfig.ServerURL}api/platforms`,
	GetPlatform: (id: number) => `${AppConfig.ServerURL}api/platforms/${id}`,
	SearchSongs: (type: string, category:number, query: string, page: number) => `${AppConfig.ServerURL}api/songs/search?type=${type}&category=${category}&query=${query}&page=${page}`,
	GetMetadatas: (platform: number, query: string) => `${AppConfig.ServerURL}api/metadata/search?platform=${platform}&query=${query}`
};