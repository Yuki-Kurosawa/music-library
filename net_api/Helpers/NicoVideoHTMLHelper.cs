using net_api.Models;
using System.Text.RegularExpressions;
using HtmlAgilityPack;

namespace net_api.Helpers
{
    public class NicoVideoHTMLHelper
    {
        public List<Metadata> Html2Metadata(string html)
        {
            var data = new List<Metadata>();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // 选取所有视频条目
            var nodes = doc.DocumentNode.SelectNodes("//li[contains(@class,'item') and @data-video-item]");
            if (nodes == null) return data;

            foreach (var node in nodes)
            {
                // 标题
                var titleNode = node.SelectSingleNode(".//p[contains(@class,'itemTitle')]/a");
                string title = titleNode?.GetAttributeValue("title", "")?.Trim() ?? "";

                // 视频链接
                string href = titleNode?.GetAttributeValue("href", "");
                string fromUrl = string.IsNullOrEmpty(href) ? "" : $"https://www.nicovideo.jp{href}";

                // 封面图片
                var imgNode = node.SelectSingleNode(".//img[contains(@class,'thumb')]");
                string imageUrl = imgNode?.GetAttributeValue("src", "") ?? "";

                // 艺术家（尝试从标题中提取 [xxx] 或 【xxx】 或 - xxx 形式）
                string artist = "";
                var m = Regex.Match(title, @"[\[【]([^\]】]+)[\]】]");
                if (m.Success)
                    artist = m.Groups[1].Value;
                else
                {
                    m = Regex.Match(title, @"- ([^-\[\]【】]+)$");
                    if (m.Success)
                        artist = m.Groups[1].Value.Trim();
                }

                // 若未提取到艺术家，尝试从描述中提取
                if (string.IsNullOrEmpty(artist))
                {
                    var descNode = node.SelectSingleNode(".//p[contains(@class,'itemDescription')]");
                    string desc = descNode?.GetAttributeValue("title", "") ?? "";
                    m = Regex.Match(desc, @"歌唱[:：]([^\s\[]+)");
                    if (m.Success)
                        artist = m.Groups[1].Value.Trim();
                }

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
    }
}