using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using net_api.Models;
using System.Net.Http;
using System.Threading.Tasks;

namespace net_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CORSController : ControllerBase
    {
        [HttpGet]
        public async  Task<IActionResult> CORSGet([FromQuery]string url)
        {
            var client = new HttpClient(new HttpClientHandler
            {
                //UseProxy = true,
                //Proxy = new WebProxy("http://127.0.0.1:7890", false),
                ServerCertificateCustomValidationCallback = (_, _, _, _) => true,

            });

            client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36");

            try
            {
                var response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, new { error = "Remote API error" });

                // 读取响应内容为字节数组
                var contentBytes = await response.Content.ReadAsByteArrayAsync();
                // 获取响应的 Content-Type 头
                var contentType = response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
                // 获取响应的文件名（如果有）
                var contentDisposition = response.Content.Headers.ContentDisposition;
                var fileName = contentDisposition?.FileNameStar ?? contentDisposition?.FileName;

                // 将二进制内容返回给客户端
                return File(contentBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
