using HtmlAgilityPack;
using net_api.Models;
using System.Collections.Generic;
using System.Web;

namespace net_api.Helpers
{
    public class AmazonHTMLHelper
    {
        /// <summary>
        /// ����Amazon�������HTML����ȡ��Ƶ���Ԫ����
        /// </summary>
        /// <param name="html">Amazon�������ҳ��HTML</param>
        /// <returns>��ƵԪ�����б�</returns>
        public List<Metadata> Html2Metadata(string html)
        {
            var result = new List<Metadata>();
            if (string.IsNullOrEmpty(html)) return result;

            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // �����������������
            var items = doc.DocumentNode.SelectNodes("//div[contains(@class, 's-result-item') and @data-asin and @data-asin!='']");
            if (items == null) return result;

            foreach (var item in items)
            {
                // ����
                var titleNode = item.SelectSingleNode(".//h2//span");
                var title = titleNode?.InnerText?.Trim() ?? "";

                // ����ҳ����
                var urlNode = item.SelectSingleNode(".//a[@href]");
                var url = urlNode?.GetAttributeValue("href", "");
                if (!string.IsNullOrEmpty(url) && !url.StartsWith("http"))
                    url = "https://www.amazon.co.jp" + url;

                // ͼƬ
                var imgNode = item.SelectSingleNode(".//img[contains(@class, 's-image')]");
                var img = imgNode?.GetAttributeValue("src", "");

                // ������/����
                var artistNode = item.SelectSingleNode(".//div[contains(@class, 'a-row')]/span[contains(@class, 'a-size-base')]");
                var artist = artistNode?.InnerText?.Trim() ?? "";

                if (!string.IsNullOrEmpty(title) && !string.IsNullOrEmpty(url))
                {
                    result.Add(new Metadata
                    {
                        Title = HttpUtility.HtmlDecode(title),
                        FromUrl = url,
                        ImageUrl = img,
                        Artist = HttpUtility.HtmlDecode(artist)
                    });
                }
            }

            return result;
        }
    }
}