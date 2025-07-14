using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Net;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace net_api.Security
{
    public class ApiAuthenticationOptions:AuthenticationSchemeOptions
    {
        public const string Scheme = "ApiAuth";
        public string TOTPKey { get; set; } = string.Empty;

        public string RSAKey { get; set; } = string.Empty; 
    }

    public class ApiAuthenticationHandler : AuthenticationHandler<ApiAuthenticationOptions>
    {
        private IOptionsMonitor<ApiAuthenticationOptions> _options;

        public ApiAuthenticationHandler(IOptionsMonitor<ApiAuthenticationOptions> options, ILoggerFactory logger, UrlEncoder encoder)
            : base(options, logger, encoder)
        {
            _options = options;
        }

        [Obsolete]
        public ApiAuthenticationHandler(IOptionsMonitor<ApiAuthenticationOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock)
            : base(options, logger, encoder, clock)
        {
            _options = options;
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            string authorization = Request.Headers.Authorization.ToString();
            string token = null;

            if (string.IsNullOrEmpty(authorization))
            {
                return Task.FromResult(AuthenticateResult.NoResult());
            }

            if (authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                token = authorization.Substring("Bearer ".Length).Trim();
            }
            else
            {
                token = authorization.Trim();
            }


            bool ret = TokenHelper.ValidateToken(token, _options.CurrentValue);

            if(ret)
            {
                return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(
                    new System.Security.Claims.ClaimsPrincipal(new List<ClaimsIdentity>(new[] { 
                    new ClaimsIdentity(new List<Claim>(new []{ 
                        new Claim(ClaimTypes.Name,"api admin")
                    }),ApiAuthenticationOptions.Scheme)
                    })),
                    Scheme.Name
                )));
            }
            else
            {
                return Task.FromResult(AuthenticateResult.Fail("Invalid token"));
            }

        }
    }

    public static class AuthenticationBuilderExtensions
    {
        public static AuthenticationBuilder AddApiAuthentication(this AuthenticationBuilder authenticationBuilder, Action<ApiAuthenticationOptions> options)
        {
            return authenticationBuilder.AddScheme<ApiAuthenticationOptions, ApiAuthenticationHandler>(ApiAuthenticationOptions.Scheme, options);
        }
    }
}
