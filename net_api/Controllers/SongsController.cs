using Microsoft.AspNetCore.Mvc;
using System.Data.SQLite;
using Dapper;
using net_api.Models;
using Microsoft.AspNetCore.Authorization;

namespace net_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SongsController : ControllerBase
    {
        private readonly string _database;

        public SongsController(IConfiguration configuration)
        {
            _database = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet]
        public IActionResult GetSongs([FromQuery] int page = 1)
        {
            try
            {
                using var con = new SQLiteConnection(_database);
                int pageSize = 20;
                int offset = (page - 1) * pageSize;

                var sql = @"
                    SELECT s.id, s.title, s.title_hiragana, s.title_katakana, s.title_romaji, 
                           s.artist, s.description, s.category_id, s.add_time, s.from_platform, s.from_url, s.image_url,
                           c.name as category_name, c.name_english as category_name_english,
                           p.name as platform_name, p.type as platform_type, p.url as platform_url
                    FROM Song s
                    LEFT JOIN Category c ON s.category_id = c.id
                    LEFT JOIN Platform p ON s.from_platform = p.id
                    ORDER BY s.add_time DESC
                    LIMIT @pageSize OFFSET @offset";

                var songs = con.Query(sql, new { pageSize, offset }).Select(row => new
                {
                    id = row.id,
                    title = row.title,
                    title_hiragana = row.title_hiragana,
                    title_katakana = row.title_katakana,
                    title_romaji = row.title_romaji,
                    artist = row.artist,
                    description = row.description,
                    category_id = row.category_id,
                    add_time = row.add_time,
                    from_platform = row.from_platform ?? 0,
                    from_url = row.from_url,
                    image_url = row.image_url,
                    category = new
                    {
                        name = row.category_name,
                        name_english = row.category_name_english
                    },
                    platform = row.platform_name == null ? null : new
                    {
                        name = row.platform_name,
                        type = row.platform_type,
                        url = row.platform_url
                    }
                }).ToList();

                return Ok(new { songs, page, pageSize });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetSong(int id)
        {
            try
            {
                using var con = new SQLiteConnection(_database);

                var sql = @"
                    SELECT s.id, s.title, s.title_hiragana, s.title_katakana, s.title_romaji, 
                           s.artist, s.description, s.category_id, s.add_time, s.from_platform, s.from_url, s.image_url,
                           c.name as category_name, c.name_english as category_name_english,
                           p.name as platform_name, p.type as platform_type, p.url as platform_url
                    FROM Song s
                    LEFT JOIN Category c ON s.category_id = c.id
                    LEFT JOIN Platform p ON s.from_platform = p.id
                    WHERE s.id = @id";

                var row = con.QueryFirstOrDefault(sql, new { id });
                if (row == null)
                    return NotFound(new { error = "Song not found" });

                var song = new
                {
                    id = row.id,
                    title = row.title,
                    title_hiragana = row.title_hiragana,
                    title_katakana = row.title_katakana,
                    title_romaji = row.title_romaji,
                    artist = row.artist,
                    description = row.description,
                    category_id = row.category_id,
                    add_time = row.add_time,
                    from_platform = row.from_platform ?? 0,
                    from_url = row.from_url,
                    image_url = row.image_url,
                    category = new
                    {
                        name = row.category_name,
                        name_english = row.category_name_english
                    },
                    platform = row.platform_name == null ? null : new
                    {
                        name = row.platform_name,
                        type = row.platform_type,
                        url = row.platform_url
                    }
                };

                return Ok(song);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost,Authorize]
        public IActionResult CreateSong([FromBody] CreateSongRequest request)
        {
            try
            {
                using var con = new SQLiteConnection(_database);

                var sql = @"
                    INSERT INTO Song (title, title_hiragana, title_katakana, title_romaji, artist, description, category_id, add_time, from_platform, from_url, image_url)
                    VALUES (@title, @title_hiragana, @title_katakana, @title_romaji, @artist, @description, @category_id, @add_time, @from_platform, @from_url, @image_url);
                    SELECT last_insert_rowid();";

                var newId = con.ExecuteScalar<long>(sql, new
                {
                    title = request.title,
                    title_hiragana = request.title_hiragana,
                    title_katakana = request.title_katakana,
                    title_romaji = request.title_romaji,
                    artist = request.artist,
                    descriptiion = request.description,
                    category_id = request.category_id,
                    add_time = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    from_platform = request.from_platform,
                    from_url = request.from_url,
                    image_url = request.image_url
                });

                return CreatedAtAction(nameof(GetSong), new { id = newId }, new { id = newId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("{id}"),Authorize]
        public IActionResult UpdateSong(int id, [FromBody] UpdateSongRequest request)
        {
            try
            {
                using var con = new SQLiteConnection(_database);

                var setParts = new List<string>();
                var parameters = new DynamicParameters();
                parameters.Add("@id", id);

                if (request.title != null)
                {
                    setParts.Add("title = @title");
                    parameters.Add("@title", request.title);
                }
                if (request.title_hiragana != null)
                {
                    setParts.Add("title_hiragana = @title_hiragana");
                    parameters.Add("@title_hiragana", request.title_hiragana);
                }
                if (request.title_katakana != null)
                {
                    setParts.Add("title_katakana = @title_katakana");
                    parameters.Add("@title_katakana", request.title_katakana);
                }
                if (request.title_romaji != null)
                {
                    setParts.Add("title_romaji = @title_romaji");
                    parameters.Add("@title_romaji", request.title_romaji);
                }
                if (request.artist != null)
                {
                    setParts.Add("artist = @artist");
                    parameters.Add("@artist", request.artist);
                }
                if (request.description != null)
                {
                    setParts.Add("description = @description");
                    parameters.Add("@description", request.description);
                }
                if (request.category_id.HasValue)
                {
                    setParts.Add("category_id = @category_id");
                    parameters.Add("@category_id", request.category_id.Value);
                }
                if (request.from_platform.HasValue)
                {
                    setParts.Add("from_platform = @from_platform");
                    parameters.Add("@from_platform", request.from_platform.Value);
                }
                if (request.from_url != null)
                {
                    setParts.Add("from_url = @from_url");
                    parameters.Add("@from_url", request.from_url);
                }
                if (request.image_url != null)
                {
                    setParts.Add("image_url = @image_url");
                    parameters.Add("@image_url", request.image_url);
                }

                if (setParts.Count == 0)
                {
                    return BadRequest(new { error = "No fields to update" });
                }

                var sql = $"UPDATE Song SET {string.Join(", ", setParts)} WHERE id = @id";
                var rowsAffected = con.Execute(sql, parameters);

                if (rowsAffected == 0)
                {
                    return NotFound(new { error = "Song not found" });
                }

                return Ok(new { message = "Song updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("delete/{id}"),Authorize]
        public IActionResult DeleteSong(int id)
        {
            try
            {
                using var con = new SQLiteConnection(_database);

                var rowsAffected = con.Execute("DELETE FROM Song WHERE id = @id", new { id });

                if (rowsAffected == 0)
                {
                    return NotFound(new { error = "Song not found" });
                }

                return Ok(new { message = "Song deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("search")]
        public IActionResult SearchSongs([FromQuery] string type, [FromQuery] int category, [FromQuery] string query, [FromQuery] int page = 1)
        {
            try
            {
                using var con = new SQLiteConnection(_database);
                int pageSize = 20;
                int offset = (page - 1) * pageSize;

                string sql;
                DynamicParameters parameters = new();
                parameters.Add("@pageSize", pageSize);
                parameters.Add("@offset", offset);

                sql = @"
                    SELECT s.id, s.title, s.title_hiragana, s.title_katakana, s.title_romaji, 
                           s.artist, s.description, s.category_id, s.add_time, s.from_platform, s.from_url, s.image_url,
                           c.name as category_name, c.name_english as category_name_english,
                           p.name as platform_name, p.type as platform_type, p.url as platform_url
                    FROM Song s
                    LEFT JOIN Category c ON s.category_id = c.id
                    LEFT JOIN Platform p ON s.from_platform = p.id
                    WHERE 1=1 ";

                if (category != 0)
                {
                    sql += "AND s.category_id = @category_id ";
                    parameters.Add("@category_id", category);
                }

                if (!string.IsNullOrWhiteSpace(type) && !string.IsNullOrWhiteSpace(query))
                {
                    parameters.Add("@query", $"%{query}%");

                    switch (type.ToLower())
                    {
                        case "title":
                            sql += "AND (s.title LIKE @query OR s.title_hiragana LIKE @query " +
                                   "OR s.title_katakana LIKE @query OR s.title_romaji LIKE @query)";
                            break;
                        case "artist":
                            sql += "AND s.artist LIKE @query";
                            break;
                        case "all":
                            sql += "AND (s.title LIKE @query OR s.title_hiragana LIKE @query " +
                                   "OR s.title_katakana LIKE @query OR s.title_romaji LIKE @query " +
                                   "OR s.artist LIKE @query)";
                            break;
                        default:
                            return BadRequest(new { error = "Invalid search type" });
                    }
                }

                sql += " ORDER BY s.add_time DESC LIMIT @pageSize OFFSET @offset";

                var songs = con.Query(sql, parameters).Select(row => new
                {
                    id = row.id,
                    title = row.title,
                    title_hiragana = row.title_hiragana,
                    title_katakana = row.title_katakana,
                    title_romaji = row.title_romaji,
                    artist = row.artist,
                    description = row.description,
                    category_id = row.category_id,
                    add_time = row.add_time,
                    from_platform = row.from_platform ?? 0,
                    from_url = row.from_url,
                    image_url = row.image_url,
                    category = new
                    {
                        name = row.category_name,
                        name_english = row.category_name_english
                    },
                    platform = row.platform_name == null ? null : new
                    {
                        name = row.platform_name,
                        type = row.platform_type,
                        url = row.platform_url
                    }
                }).ToList();

                return Ok(new { songs, page, pageSize });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class CreateSongRequest
    {
        public string? title { get; set; }
        public string? title_hiragana { get; set; }
        public string? title_katakana { get; set; }
        public string? title_romaji { get; set; }
        public string artist { get; set; } = string.Empty;
        public string? description { get; set; }
        public int category_id { get; set; }
        public int? from_platform { get; set; }
        public string? from_url { get; set; }
        public string? image_url { get; set; }
    }

    public class UpdateSongRequest
    {
        public string? title { get; set; }
        public string? title_hiragana { get; set; }
        public string? title_katakana { get; set; }
        public string? title_romaji { get; set; }
        public string? artist { get; set; }
        public string? description { get; set; }
        public int? category_id { get; set; }
        public int? from_platform { get; set; }
        public string? from_url { get; set; }
        public string? image_url { get; set; }
    }
}