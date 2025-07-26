#!/usr/bin/env python3

import json
import os
from typing import List, Dict, Optional
from jsondata import Song, ChunithmSong, MaimaiSong, OngekiSong, ArcadeSong

def read_json_file(file_path: str) -> Dict:
    """读取JSON文件并返回解析后的字典"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"读取文件 {file_path} 失败: {e}")
        return {}

def create_song_objects(json_data: Dict, song_class) -> List:
    """根据JSON数据创建对应的歌曲对象列表"""
    songs = []
    # Handle both list and dict JSON structures
    songs_data = json_data if isinstance(json_data, list) else json_data.get('songs', [])
    for item in songs_data:
        # 创建基础Song对象属性
        song_base = {
            'title_hiragana': item.get('title_hiragana'),
            'title_katakana': item.get('title_katakana'),
            'title_romaji': item.get('title_romaji'),
            'category_id': item.get('category_id'),
            'platform_id': item.get('platform_id'),
            'image_url': item.get('image_url')
        }
        
        # 合并基础属性和游戏特定属性，避免重复参数
        song_data = song_base.copy()
        song_data.update(item)
        
        # 创建游戏特定对象
        game_song = song_class(** song_data)
        songs.append(game_song)
    return songs

def find_song_by_title(song_list: List, title: str) -> Optional:
    """根据标题在歌曲列表中查找歌曲"""
    for song in song_list:
        if song.title == title:
            return song
    return None

def generate_arcade_songs() -> List[ArcadeSong]:
    """生成ArcadeSong对象列表"""
    # 读取三个JSON文件
    chunithm_data = read_json_file('chunithm_songs.json')
    maimai_data = read_json_file('maimai_songs.json')
    ongeki_data = read_json_file('ongeki_songs.json')
    
    # 创建对应的歌曲对象列表
    chunithm_songs = create_song_objects(chunithm_data, ChunithmSong)
    maimai_songs = create_song_objects(maimai_data, MaimaiSong)
    ongeki_songs = create_song_objects(ongeki_data, OngekiSong)
    
    # 收集所有唯一的标题
    all_titles = set()
    all_titles.update(song.title for song in chunithm_songs)
    all_titles.update(song.title for song in maimai_songs)
    all_titles.update(song.title for song in ongeki_songs)
    
    # 根据标题创建ArcadeSong对象
    arcade_songs = []
    for title in all_titles:
        arcade_song = ArcadeSong(
            title=title,
            chunithm=find_song_by_title(chunithm_songs, title),
            maimai=find_song_by_title(maimai_songs, title),
            ongeki=find_song_by_title(ongeki_songs, title)
        )
        arcade_songs.append(arcade_song)
    
    return arcade_songs

def dataclass_to_dict(obj):
    """将dataclass对象转换为字典"""
    if hasattr(obj, '__dataclass_fields__'):
        result = {}
        for field in obj.__dataclass_fields__:
            value = getattr(obj, field)
            result[field] = dataclass_to_dict(value)
        return result
    elif isinstance(obj, list):
        return [dataclass_to_dict(item) for item in obj]
    else:
        return obj

if __name__ == '__main__':
    # 生成ArcadeSong对象列表
    arcade_songs = generate_arcade_songs()
    
    # 转换为字典列表
    arcade_songs_dict = [dataclass_to_dict(song) for song in arcade_songs]
    
    # 输出到JSON文件
    with open('arcade_songs_output.json', 'w', encoding='utf-8') as f:
        json.dump(arcade_songs_dict, f, ensure_ascii=False, indent=2)
    
    # 输出数据统计信息
    print("===== 数据统计结果 =====")
    total_songs = len(arcade_songs)
    print(f"总歌曲数量: {total_songs}")
    
    # 各平台单独收录统计
    chunithm_count = sum(1 for song in arcade_songs if song.chunithm is not None)
    maimai_count = sum(1 for song in arcade_songs if song.maimai is not None)
    ongeki_count = sum(1 for song in arcade_songs if song.ongeki is not None)
    
    print(f"\n各平台收录数量:")
    print(f"Chunithm: {chunithm_count}")
    print(f"Maimai: {maimai_count}")
    print(f"Ongeki: {ongeki_count}")
    
    # 多平台同时收录统计
    both_chunithm_maimai = sum(1 for song in arcade_songs if song.chunithm and song.maimai)
    both_chunithm_ongeki = sum(1 for song in arcade_songs if song.chunithm and song.ongeki)
    both_maimai_ongeki = sum(1 for song in arcade_songs if song.maimai and song.ongeki)
    all_three = sum(1 for song in arcade_songs if song.chunithm and song.maimai and song.ongeki)
    
    print(f"\n多平台同时收录数量:")
    print(f"Chunithm & Maimai: {both_chunithm_maimai}")
    print(f"Chunithm & Ongeki: {both_chunithm_ongeki}")
    print(f"Maimai & Ongeki: {both_maimai_ongeki}")
    print(f"三平台同时收录: {all_three}")
    print("=======================")