using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using GoogleAuthenticator;

namespace TOTPVerify
{
   public class TOTPGenerator
    {
        public static string OneTimePassword(byte[] Secret,string Identity,out string qrUrl)
        {
            string SecretBase32 = Base32.ToString(Secret);
            qrUrl=String.Format("otpauth://totp/{0}?secret={1}", Identity, SecretBase32);
            return CalculateOneTimePassword(Secret).ToString("000000");
        }

        public static int CalculateOneTimePassword(byte[] Secret)
        {
            // https://tools.ietf.org/html/rfc4226
            Int64 Timestamp = Convert.ToInt64(GetUnixTimestamp() / 30);
            var data = BitConverter.GetBytes(Timestamp).Reverse().ToArray();
            byte[] Hmac = new HMACSHA1(Secret).ComputeHash(data);
            int Offset = Hmac.Last() & 0x0F;
            int OneTimePassword = (
                                  ((Hmac[Offset + 0] & 0x7f) << 24) |
                                  ((Hmac[Offset + 1] & 0xff) << 16) |
                                  ((Hmac[Offset + 2] & 0xff) << 8) |
                                  (Hmac[Offset + 3] & 0xff)
                              ) % 1000000;
            return OneTimePassword;
        }

        private static Int64 GetUnixTimestamp()
        {
            return Convert.ToInt64(Math.Round((DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0)).TotalSeconds));
        }
    }
}
