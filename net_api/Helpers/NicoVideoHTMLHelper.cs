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

            // ѡȡ������Ƶ��Ŀ
            var nodes = doc.DocumentNode.SelectNodes("//li[contains(@class,'item') and @data-video-item]");
            if (nodes == null) return data;

            foreach (var node in nodes)
            {
                // ����
                var titleNode = node.SelectSingleNode(".//p[contains(@class,'itemTitle')]/a");
                string title = titleNode?.GetAttributeValue("title", "")?.Trim() ?? "";

                // ��Ƶ����
                string href = titleNode?.GetAttributeValue("href", "");
                string fromUrl = string.IsNullOrEmpty(href) ? "" : $"https://www.nicovideo.jp{href}";

                // ����ͼƬ
                var imgNode = node.SelectSingleNode(".//img[contains(@class,'thumb')]");
                string imageUrl = imgNode?.GetAttributeValue("src", "") ?? "";

                // �����ң����Դӱ�������ȡ [xxx] �� ��xxx�� �� - xxx ��ʽ��
                string artist = "";
                var m = Regex.Match(title, @"[\[��]([^\]��]+)[\]��]");
                if (m.Success)
                    artist = m.Groups[1].Value;
                else
                {
                    m = Regex.Match(title, @"- ([^-\[\]����]+)$");
                    if (m.Success)
                        artist = m.Groups[1].Value.Trim();
                }

                // ��δ��ȡ�������ң����Դ���������ȡ
                if (string.IsNullOrEmpty(artist))
                {
                    var descNode = node.SelectSingleNode(".//p[contains(@class,'itemDescription')]");
                    string desc = descNode?.GetAttributeValue("title", "") ?? "";
                    m = Regex.Match(desc, @"�質[:��]([^\s\[]+)");
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