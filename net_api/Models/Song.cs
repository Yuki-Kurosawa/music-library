namespace net_api.Models
{
    public class Song
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? TitleHiragana { get; set; }
        public string? TitleKatakana { get; set; }
        public string? TitleRomaji { get; set; }
        public string Artist { get; set; } = string.Empty;

        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public long AddTime { get; set; }
        public int? FromPlatform { get; set; }
        public string? FromUrl { get; set; }
        public string? ImageUrl { get; set; }

        // Navigation properties
        public Category? Category { get; set; }
        public Platform? Platform { get; set; }
    }
}