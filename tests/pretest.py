import json
import os
import secrets
import base64
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend

# 生成符合 Base32 编码的 TOTP 密钥
def generate_totp_key():
    # 生成 20 字节的随机字节
    random_bytes = secrets.token_bytes(20)
    # 将随机字节转换为 Base32 编码的字符串
    totp_key = base64.b32encode(random_bytes).decode('utf-8')
    return totp_key

# 生成 RSA 密钥对，保留 PEM 格式
def generate_rsa_key_pair():
    # 使用默认后端生成 RSA 私钥
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    public_key = private_key.public_key()

    # 以 PKCS#1 格式序列化私钥
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    # 移除 PEM 格式的页眉、页脚和换行符
    processed_private_key = private_pem.decode('utf-8').replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace("\n", "")
    processed_public_key = public_pem.decode('utf-8').replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", "").replace("\n", "")
    return processed_private_key, processed_public_key

# 更新 appsettings.json 文件
def update_appsettings():
    appsettings_path = './music_library/net_api/appsettings.json'
    if not os.path.exists(appsettings_path):
        print(f"文件 {appsettings_path} 不存在")
        return

    # 读取 appsettings.json 文件
    with open(appsettings_path, 'r', encoding='utf-8') as f:
        config = json.load(f)

    # 生成并更新 TOTP 密钥
    totp_key = generate_totp_key()
    config['ApiKeyConfig']['TOTPKey'] = totp_key

    # 生成并更新 RSA 密钥
    private_key, public_key = generate_rsa_key_pair()
    config['ApiKeyConfig']['RSAKey'] = public_key

    # 保存更新后的配置
    with open(appsettings_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)

    # 保存私钥到 privkey.pem
    privkey_path = './music_library/net_api/privkey.pem'
    with open(privkey_path, 'w', encoding='utf-8') as f:
        f.write(private_key)

    print("appsettings.json 文件已更新，私钥已保存到 privkey.pem")

if __name__ == "__main__":
    update_appsettings()
