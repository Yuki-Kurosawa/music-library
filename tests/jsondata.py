#!/usr/bin/env python3

from dataclasses import dataclass
from typing import Optional, List

@dataclass
class Song:
    """Base class for all song types with common fields"""
    id: Optional[str] = None
    title: Optional[str] = None
    artist: Optional[str] = None
    title_hiragana: Optional[str] = None
    title_kana: Optional[str] = None
    title_katakana: Optional[str] = None
    title_romaji: Optional[str] = None
    category_id: Optional[int] = None
    platform_id: Optional[int] = None
    image_url: Optional[str] = None
    image: Optional[str] = None

@dataclass
class ChunithmSong(Song):
    """Song class for Chunithm-specific data"""
    catname: Optional[str] = None
    newflag: Optional[str] = None
    reading: Optional[str] = None
    lev_bas: Optional[str] = None
    lev_adv: Optional[str] = None
    lev_exp: Optional[str] = None
    lev_mas: Optional[str] = None
    lev_ult: Optional[str] = None
    we_kanji: Optional[str] = None
    we_star: Optional[str] = None

@dataclass
class MaimaiSong(Song):
    """Song class for Maimai-specific data"""
    kanji: Optional[str] = None
    catcode: Optional[str] = None
    release: Optional[str] = None
    sort: Optional[str] = None
    version: Optional[str] = None
    lev_bas: Optional[str] = None
    lev_adv: Optional[str] = None
    lev_exp: Optional[str] = None
    lev_mas: Optional[str] = None
    lev_remas: Optional[str] = None
    lev_utage: Optional[str] = None
    dx_lev_bas: Optional[str] = None
    dx_lev_adv: Optional[str] = None
    dx_lev_exp: Optional[str] = None
    dx_lev_mas: Optional[str] = None 
    dx_lev_remas: Optional[str] = None    
    key: Optional[str] = None
    date: Optional[str] = None
    comment: Optional[str] = None
    buddy: Optional[str] = None

@dataclass
class OngekiSong(Song):
    """Song class for Ongeki-specific data"""
    title_sort: Optional[str] = None
    new: Optional[str] = None
    date: Optional[str] = None
    chap_id: Optional[str] = None
    chapter: Optional[str] = None
    character: Optional[str] = None
    chara_id: Optional[str] = None
    category: Optional[str] = None
    category_id: Optional[str] = None
    lunatic: Optional[str] = None
    bonus: Optional[str] = None
    copyright1: Optional[str] = None
    lev_bas: Optional[str] = None
    lev_adv: Optional[str] = None
    lev_exc: Optional[str] = None
    lev_mas: Optional[str] = None
    lev_lnt: Optional[str] = None

@dataclass
class ArcadeSong:
    """Class containing arcade-specific song objects"""
    title: Optional[str] = None
    chunithm: Optional[ChunithmSong] = None
    maimai: Optional[MaimaiSong] = None
    ongeki: Optional[OngekiSong] = None

@dataclass
class SongJSON:
    songs: List[Song | ChunithmSong | MaimaiSong | OngekiSong]

# Export all classes
__all__ = ["Song", "ChunithmSong", "MaimaiSong", "OngekiSong", "ArcadeSong"]