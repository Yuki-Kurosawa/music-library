
import { AlertWrap } from '@/components/ui/AlertWrap';
import { Song } from '@/types/database';
import { AppConfig } from './Config';
import { Strings } from './Strings';

/**
 * API endpoints for the music library service.
 * 
 * This module provides functions to construct URLs for various API endpoints
 * related to songs, categories, and platforms.
 */

/*
 * NOTE: Due to WAF settings, API Endpoints can use GET and POST http methods only.
*/

export const ServiceAPI = {
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

/**
 * 显示输入框让用户输入鉴权密钥
 * @returns 包含用户输入的鉴权密钥的 Promise
 */
const getAuthKeyFromUser = (): Promise<string> => {
  return new Promise((resolve) => {
    AlertWrap.prompt(
      Strings.api.authKey,
      Strings.api.authKeyMessage,
      (text) => resolve(text),
      'secure-text'
    );
  });
};

/**
 * 带鉴权的 API 调用封装函数
 * @param url - API 请求的 URL
 * @param method - HTTP 请求方法，如 'GET', 'POST' 等
 * @param body - 请求体数据，可选
 * @returns 包含响应数据的 Promise
 */
export const authenticatedApiCall = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any
): Promise<T> => {
  const authKey = await getAuthKeyFromUser();
  if (!authKey) {
    throw new Error(Strings.api.authKeyRequired);
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${authKey}`,
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const requestOptions: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/* API Fetch Wrapper with authentication */

export const ImageURLMap = (url: string | null | undefined): string => {
  
  const safeUrl = url ?? '';
  
  if (safeUrl.includes('hdslb.com')) {
    return `${AppConfig.ServerURL}api/CORS/?url=${encodeURIComponent(safeUrl)}`;
  }
  
  return safeUrl;
};