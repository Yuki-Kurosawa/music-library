namespace net_api.Models
{
    public class Platform
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public PlatformType Type { get; set; }
        public string? Url { get; set; }
    }

    public enum PlatformType
    {
        Other = 0,
        Video = 1,
        Music = 2,
        OnlineStore = 3
    }
}