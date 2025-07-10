using net_api.Models;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace net_api.Helpers
{
    public class YouTubeHTMLHelper
    {
        public List<Metadata> Html2Metadata(string html)
        {
            var data = new List<Metadata>();

            // 1. 提取 ytInitialData 的 JSON
            var match = Regex.Match(html, @"var ytInitialData\s*=\s*(\{.*?\});", RegexOptions.Singleline);
            if (!match.Success)
                return data;

            string json = match.Groups[1].Value;

            // 2. 反序列化为 JsonDocument
            using var doc = JsonDocument.Parse(json);

            // 3. 递归查找所有 videoRenderer
            foreach (var video in FindVideoRenderers(doc.RootElement))
            {
                // 标题
                string title = video.TryGetProperty("title", out var titleObj) && titleObj.TryGetProperty("runs", out var runs) && runs.GetArrayLength() > 0
                    ? runs[0].GetProperty("text").GetString() ?? ""
                    : "";

                // 艺术家
                string artist = video.TryGetProperty("longBylineText", out var bylineObj) && bylineObj.TryGetProperty("runs", out var aruns) && aruns.GetArrayLength() > 0
                    ? aruns[0].GetProperty("text").GetString() ?? ""
                    : "";

                // 视频链接
                string fromUrl = video.TryGetProperty("navigationEndpoint", out var navObj) &&
                                 navObj.TryGetProperty("commandMetadata", out var cmdMeta) &&
                                 cmdMeta.TryGetProperty("webCommandMetadata", out var webCmd) &&
                                 webCmd.TryGetProperty("url", out var urlProp)
                    ? "https://www.youtube.com" + urlProp.GetString()
                    : "";

                // 封面图片
                string imageUrl = video.TryGetProperty("thumbnail", out var thumbObj) &&
                                  thumbObj.TryGetProperty("thumbnails", out var thumbsArr) &&
                                  thumbsArr.ValueKind == JsonValueKind.Array && thumbsArr.GetArrayLength() > 0
                    ? thumbsArr[thumbsArr.GetArrayLength() - 1].GetProperty("url").GetString() ?? ""
                    : "";

                data.Add(new Metadata
                {
                    Title = title,
                    Artist = artist,
                    FromUrl = fromUrl,
                    ImageUrl = imageUrl
                });
            }

            return data;
        }

        // 递归查找所有 videoRenderer
        private IEnumerable<JsonElement> FindVideoRenderers(JsonElement element)
        {
            if (element.ValueKind == JsonValueKind.Object)
            {
                foreach (var prop in element.EnumerateObject())
                {
                    if (prop.Name == "videoRenderer")
                        yield return prop.Value;
                    foreach (var child in FindVideoRenderers(prop.Value))
                        yield return child;
                }
            }
            else if (element.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in element.EnumerateArray())
                {
                    foreach (var child in FindVideoRenderers(item))
                        yield return child;
                }
            }
        }
    }
}