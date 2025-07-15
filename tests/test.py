import json
import requests
import os
import pyotp
import logging
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import load_pem_private_key
from cryptography.hazmat.backends import default_backend

# 配置日志记录
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 加载 appsettings.json 文件获取授权令牌
def get_auth_tokens():
    appsettings_path = 'e:/Repo/music_library/net_api/appsettings.json'
    if not os.path.exists(appsettings_path):
        logging.error(f"文件 {appsettings_path} 不存在")
        return None, None, None

    with open(appsettings_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
    # 获取 TOTPKey、RSAKey 和私钥
    totp_key = config.get('ApiKeyConfig', {}).get('TOTPKey')
    rsa_key = config.get('ApiKeyConfig', {}).get('RSAKey')
    # 从文件读取私钥
    privkey_path = 'e:/Repo/music_library/net_api/privkey.pem'
    if os.path.exists(privkey_path):
        with open(privkey_path, 'r', encoding='utf-8') as f:
            private_key = f.read()
    else:
        private_key = None
    return totp_key, rsa_key, private_key

# 使用 SHA256withRSA 算法签名数据，签名结果进行 Base64 编码
def sign_data(private_key_pem, data):
    # 加载私钥
    private_key = load_pem_private_key(
        private_key_pem.encode('utf-8'),
        password=None,
        backend=default_backend()
    )
    # 签名数据
    signature = private_key.sign(
        data.encode('utf-8'),
        padding.PKCS1v15(),
        hashes.SHA256()
    )
    # 对签名结果进行 Base64 编码
    return base64.b64encode(signature).decode('utf-8')

# 测试 API 端点
def test_api_with_token(api_url, token, token_type):
    logging.info(f"使用 {token_type} 进行测试")
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()  # 检查请求是否成功
        logging.info("请求成功，响应内容：")
        logging.info(response.text)
    except requests.exceptions.HTTPError as http_err:
        logging.error(f"HTTP 错误发生: {http_err}")
    except Exception as err:
        logging.error(f"其他错误发生: {err}")

def test_auth_api():
    totp_key, rsa_key, private_key = get_auth_tokens()
    api_url = "https://localhost.ksyuki.com:10443/api/Install/Auth"
    test_data = "test data"  # 用于签名的测试数据

    # 使用 TOTPKey 测试
    if totp_key:
        # 生成动态 TOTP 令牌
        totp = pyotp.TOTP(totp_key)
        totp_token = totp.now()
        test_api_with_token(api_url, totp_token, "TOTPKey")
    else:
        logging.info("未获取到 TOTPKey，跳过 TOTPKey 测试。")

    # 使用 RSAKey 测试
    if rsa_key and private_key:
        # 对数据进行 Base64 编码
        encoded_data = base64.b64encode(test_data.encode('utf-8')).decode('utf-8')
        # 生成签名并进行 Base64 编码
        rsa_token = sign_data(private_key, test_data)
        # 按照 $DATA.$SIGN 格式拼接编码后的数据和签名
        combined_token = f"{encoded_data}.{rsa_token}"
        test_api_with_token(api_url, combined_token, "RSAKey 签名")
    else:
        logging.info("未获取到 RSAKey 或私钥，跳过 RSAKey 测试。")

if __name__ == "__main__":
    test_auth_api()
