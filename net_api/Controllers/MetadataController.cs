using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using net_api.Models;
using System.Data.SQLite;
using System.Net;
using System.Net.Http;
using System.Net.Security;
using System.Threading.Tasks;

namespace net_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MetadataController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public MetadataController( IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] int platform, [FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { error = "Query is required" });

            // 从数据库获取平台的API地址
            string dbConn = _configuration.GetConnectionString("DefaultConnection");
            string? apiUrl;
            using (var con = new SQLiteConnection(dbConn))
            {
                apiUrl = con.QueryFirstOrDefault<string>(
                    "SELECT url FROM Platform WHERE id = @id",
                    new { id = platform }
                );
            }

            if (string.IsNullOrWhiteSpace(apiUrl))
                return NotFound(new { error = "Platform not found or URL is empty" });

            // 拼接远端API地址
            string url = $"{apiUrl}{Uri.EscapeDataString(query)}";

            var client = new HttpClient(new HttpClientHandler
            {
                //UseProxy = true,
                //Proxy = new WebProxy("http://127.0.0.1:7890", false),
                ServerCertificateCustomValidationCallback = (_,_,_,_) => true,
                
            });

            client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36");

            try
            {
                var response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, new { error = "Remote API error" });

                var html = await response.Content.ReadAsStringAsync();
                // 直接返回text/html内容
                return Html2Metadata(platform, html);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private IActionResult Html2Metadata(int platform, string html)
        {
            switch (platform)
            {
                case 1:
                    // Youtube
                    return Ok(new Helpers.YouTubeHTMLHelper().Html2Metadata(html));
                case 2:
                    // NicoVideo
                    return Ok(new Helpers.NicoVideoHTMLHelper().Html2Metadata(html));
                case 3:
                    // Bilibili
                    return Ok(new Helpers.BilibiliHTMLHelper().Html2Metadata(html));
                case 4:
                    // Amazon Music
                    return Ok(new Helpers.AmazonHTMLHelper().Html2Metadata(html));
                default:
                    // 默认处理逻辑
                    return Content(html, "text/html; charset=utf-8");
            }
        }   
    }
}
