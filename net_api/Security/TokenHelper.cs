
using Org.BouncyCastle.Utilities.Encoders;
using GoogleAuthenticator;
using TOTPVerify;

namespace net_api.Security
{
    public class TokenHelper
    {
        public static bool ValidateToken(string token, ApiAuthenticationOptions options)
        {
            // Do Empty Check
            if(string.IsNullOrEmpty(token))
            {
                return false;
            }

            int type = 0;

            // Check Token Format
            if(token.Length == 6 && int.TryParse(token,out _))
            {
                // Token Type 1: 6 digit dynamic token
                type = 1;
            }

            else
            {
                try
                {
                    //Token Type 2: Base64 encoded token
                    Base64.Decode(token);
                    type = 2;
                }
                catch
                {
                    
                }
            }

            if(type == 0)
            {
                // Unknow Token Type
                return false;
            }

            if (type == 1 && string.IsNullOrEmpty(options.TOTPKey))
            {
                return false;
            }

            if (type == 2 && string.IsNullOrEmpty(options.RSAKey))
            {
                return false;
            }

            return type == 1 ? VerifyTotpToken(token, options.TOTPKey) : VerifyDerToken(token, options.RSAKey);
        }

        private static bool VerifyDerToken(string token,string key)
        {
            return true;
        }

        private static bool VerifyTotpToken(string token,string key)
        {
            int.TryParse(token.TrimStart('0'), out int otp);

            int rtotp = TOTPGenerator.CalculateOneTimePassword(Base32.ToBytes(key));

            return otp == rtotp;
        }
    }
}