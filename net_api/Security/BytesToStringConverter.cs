using System;
using System.Globalization;

namespace GoogleAuthenticator
{
    public class BytesToStringConverter
    {
        public byte[] StringToBytes(string value)
        {
            try
            {
                return Convert.FromHexString(value);
            }
            catch (FormatException)
            {
                return new byte[0];
            }
        }

        public string BytesToString(byte[] value)
        {
            if (value == null)
            {
                return string.Empty;
            }
            return Convert.ToHexString(value);
        }
    }
}
