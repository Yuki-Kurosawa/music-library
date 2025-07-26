#!/usr/bin/env python3
import json
import os
import requests
import pyotp
import logging
import argparse
import time

# 配置变量 - 置于脚本头部
BASE_URL = "https://your-default-base-url.com"
TOTP_KEY = "your-default-totp-key"

# 平台和分类映射关系（源自INITDB.sql）
PLATFORM_MAPPING = {
    'YouTube': 1,
    'NicoVideo': 2,
    'Bilibili': 3,
    'Amazon Music': 4
}

CATEGORY_MAPPING = {
    'POPS&アニメ': 1,
    'niconico&ボーカロイド': 2,
    '東方Project': 3,
    'ゲーム＆バラエティ': 4,
    'maimai': 5,
    'オンゲキ': 6,
    'CHUNITHM': 7,
    'イロドリミドリ': 8
}

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 解析命令行参数
def parse_arguments():
    parser = argparse.ArgumentParser(description='音乐数据导入工具')
    # 移除base-url和totp-key命令行参数
    # parser.add_argument('--base-url', required=True, help='服务器基础路径')
    # parser.add_argument('--totp-key', required=True, help='TOTP 密钥')
    parser.add_argument('--batch-size', type=int, default=10, help='批量导入大小，默认10条')
    parser.add_argument('--delay', type=int, default=500, help='请求间隔毫秒数，默认500ms')
    return parser.parse_args()

# 获取 TOTP 认证令牌
def get_totp_token(totp_key):
    totp = pyotp.TOTP(totp_key)
    return totp.now()

# 获取认证头
def get_auth_header(totp_key):
    totp_token = get_totp_token(totp_key)
    return {"Authorization": f"Bearer {totp_token}"}

# 导入单首歌曲到API
def import_single_song(song, base_url, totp_key):
    auth_header = get_auth_header(totp_key)
    if not auth_header:
        return False, "无法获取认证令牌"
    
    api_url = f"{base_url}/api/Songs"
    
    try:
        response = requests.post(
            api_url,
            headers=auth_header,
            json=song
        )
        
        if response.status_code == 201:
            return True, "导入成功"
        elif response.status_code == 409:
            return False, "歌曲已存在"
        else:
            return False, f"HTTP错误: {response.status_code} - {response.text}"
    except Exception as e:
        return False, f"请求错误: {str(e)}"

# 从list.txt导入数据
def import_from_list_file():
    list_path = 'list.txt'
    if not os.path.exists(list_path):
        logging.error(f"数据源文件 {list_path} 不存在")
        return [], []
    
    music_entries = []
    skipped_lines = []
    
    with open(list_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            # 跳过注释和空行
            if not line or line.startswith('#'):
                continue
            
            # 解析行数据
            try:
                # 处理带引号的字段
                if line.startswith('"'):
                    parts = line.split('","')
                    if len(parts) >= 2:
                        title = parts[0][1:].strip()  # 移除开头的引号
                        artist = parts[1].rsplit('"', 1)[0].strip()  # 移除结尾的引号
                        music_entries.append({
                            "Title": title,
                            "Artist": artist,
                            "CategoryId": 1,
                            "FromPlatform": 0,
                            "AddTime": int(time.time())
                        })
                    else:
                        skipped_lines.append(f"第 {line_num} 行: 格式错误 - {line}")
                else:
                    parts = line.split(',')
                    if len(parts) >= 2:
                        title = parts[0].strip()
                        artist = ','.join(parts[1:]).strip()
                        music_entries.append({
                            "Title": title,
                            "Artist": artist,
                            "CategoryId": 1,
                            "FromPlatform": 0,
                            "AddTime": int(time.time())
                        })
                    else:
                        skipped_lines.append(f"第 {line_num} 行: 格式错误 - {line}")
            except Exception as e:
                skipped_lines.append(f"第 {line_num} 行: 解析错误 - {str(e)}")
    
    return music_entries, skipped_lines

# 导入数据到API
def import_to_api(music_entries, args):
    if not music_entries:
        logging.info("没有要导入的音乐数据")
        return 0, []
    
    success_count = 0
    errors = []
    
    # 单首导入循环
    for index, song in enumerate(music_entries, 1):
        logging.info(f"正在导入第 {index}/{len(music_entries)} 首: {song['Title']} - {song['Artist']}")
        
        # 导入单首歌曲
        success, message = import_single_song(song, BASE_URL, TOTP_KEY)
        
        if success:
            success_count += 1
            logging.info(f"成功: {message}")
        else:
            errors.append(f"第 {index} 首 {song['Title']}: {message}")
            logging.warning(f"失败: {message}")
        
        # 添加延迟，最后一首不需要延迟
        if index < len(music_entries) and args.delay > 0:
            time.sleep(args.delay / 1000)
    
    return success_count, errors

# 主函数
def main():
    # 解析命令行参数
    args = parse_arguments()
    
    logging.info("===== 开始音乐数据导入 ====")
    logging.info(f"服务器基础路径: {args.base_url}")
    
    # 从list.txt导入
    logging.info("从list.txt导入数据...")
    list_entries, list_errors = import_from_list_file()
    
    if list_errors:
        logging.warning("解析list.txt时遇到问题:")
        for error in list_errors:
            logging.warning(f"- {error}")
    
    logging.info(f"从list.txt解析到 {len(list_entries)} 条有效记录")
    
    # 合并数据并去重
    all_entries = list_entries
    unique_entries = []
    seen = set()
    
    for entry in all_entries:
        key = f"{entry['Title']}|{entry['Artist']}"
        if key not in seen:
            seen.add(key)
            unique_entries.append(entry)
    
    logging.info(f"合并并去重后，共 {len(unique_entries)} 条记录待导入")
    
    # 导入到API
    if unique_entries:
        logging.info("开始导入数据到API...")
        success, import_errors = import_to_api(unique_entries, args)
        
        logging.info(f"===== 导入完成 ====")
        logging.info(f"成功导入: {success} 条")
        logging.info(f"失败: {len(import_errors)} 条")
        
        if import_errors:
            logging.warning("导入错误详情:")
            for error in import_errors:
                logging.warning(f"- {error}")
    else:
        logging.info("没有数据需要导入")

if __name__ == "__main__":
    main()