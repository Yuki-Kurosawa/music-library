using HtmlAgilityPack;
using net_api.Models;
using System.Collections.Generic;
using System.Web;

namespace net_api.Helpers
{
    public class BilibiliHTMLHelper
    {
        /// <summary>
        /// ����Bվ�������HTML����ȡ��Ƶ���Ԫ����
        /// </summary>
        /// <param name="html">Bվ�������ҳ��HTML</param>
        /// <returns>��ƵԪ�����б�</returns>
        public List<Metadata> Html2Metadata(string html)
        {
            var result = new List<Metadata>();
            if (string.IsNullOrEmpty(html)) return result;

            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // ����������Ƶ��Ƭ�ڵ�
            var cards = doc.DocumentNode.SelectNodes("//div[contains(@class, 'bili-video-card__wrap')]");
            if (cards == null) return result;

            foreach (var card in cards)
            {
                var url = GetAttributeValue(card, ".//a[@href]", "href");
                var cover = GetAttributeValue(card, ".//picture[contains(@class, 'bili-video-card__cover')]/img", "src");
                var title = GetInnerText(card, ".//h3[contains(@class, 'bili-video-card__info--tit')]");
                var author = GetInnerText(card, ".//span[contains(@class, 'bili-video-card__info--author')]");
                var authorUrl = GetAttributeValue(card, ".//a[contains(@class, 'bili-video-card__info--owner')]", "href");

                if (!string.IsNullOrEmpty(url))
                {
                    if (!url.StartsWith("http")) url = "https:" + url;
                    if (!string.IsNullOrEmpty(cover) && !cover.StartsWith("http")) cover = "https:" + cover;
                    if (!string.IsNullOrEmpty(authorUrl) && !authorUrl.StartsWith("http")) authorUrl = "https:" + authorUrl;

                    result.Add(new Metadata
                    {
                        Title = HttpUtility.HtmlDecode(title),
                        FromUrl = url,
                        ImageUrl = cover,
                        Artist = HttpUtility.HtmlDecode(author)
                    });
                }
            }

            return result;
        }

        private string GetAttributeValue(HtmlNode parentNode, string xpath, string attributeName)
        {
            var node = parentNode.SelectSingleNode(xpath);
            return node?.GetAttributeValue(attributeName, "");
        }

        private string GetInnerText(HtmlNode parentNode, string xpath)
        {
            var node = parentNode.SelectSingleNode(xpath);
            return node?.InnerText.Trim() ?? "";
        }
    }
}