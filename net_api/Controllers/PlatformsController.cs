using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Data.SQLite;
using Dapper;
using net_api.Models;
using Microsoft.AspNetCore.Authorization;

namespace net_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlatformsController : ControllerBase
    {
        private readonly string _database;

        public PlatformsController(IConfiguration configuration)
        {
            _database = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet]
        public IActionResult GetPlatforms()
        {
            try
            {
                using var con = new SQLiteConnection(_database);
                var platforms = con.Query<Platform>("SELECT id, name, type, url FROM Platform ORDER BY id asc").ToList();
                return Ok(platforms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetPlatform(int id)
        {
            try
            {
                using var con = new SQLiteConnection(_database);
                var platform = con.QueryFirstOrDefault<Platform>(
                    "SELECT id, name, type, url FROM Platform WHERE id = @id", new { id });
                if (platform == null)
                    return NotFound(new { error = "Platform not found" });
                return Ok(platform);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost,Authorize]
        public IActionResult CreatePlatform([FromBody] CreatePlatformRequest request)
        {
            try
            {
                using var con = new SQLiteConnection(_database);
                var sql = "INSERT INTO Platform (name, type, url) VALUES (@name, @type, @url); SELECT last_insert_rowid();";
                var newId = con.ExecuteScalar<long>(sql, new { name = request.name, type = request.type, url = request.url });
                return CreatedAtAction(nameof(GetPlatform), new { id = newId }, new { id = newId });
            }
            catch (SQLiteException ex) when (ex.ResultCode == SQLiteErrorCode.Constraint)
            {
                return BadRequest(new { error = "Platform name must be unique" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("{id}"),Authorize]
        public IActionResult UpdatePlatform(int id, [FromBody] UpdatePlatformRequest request)
        {
            try
            {
                using var con = new SQLiteConnection(_database);

                var setParts = new List<string>();
                var parameters = new DynamicParameters();
                parameters.Add("@id", id);

                if (request.name != null)
                {
                    setParts.Add("name = @name");
                    parameters.Add("@name", request.name);
                }
                if (request.type.HasValue)
                {
                    setParts.Add("type = @type");
                    parameters.Add("@type", request.type.Value);
                }
                if (request.url != null)
                {
                    setParts.Add("url = @url");
                    parameters.Add("@url", request.url);
                }

                if (setParts.Count == 0)
                {
                    return BadRequest(new { error = "No fields to update" });
                }

                var sql = $"UPDATE Platform SET {string.Join(", ", setParts)} WHERE id = @id";
                var rowsAffected = con.Execute(sql, parameters);

                if (rowsAffected == 0)
                {
                    return NotFound(new { error = "Platform not found" });
                }

                return Ok(new { message = "Platform updated successfully" });
            }
            catch (SQLiteException ex) when (ex.ResultCode == SQLiteErrorCode.Constraint)
            {
                return BadRequest(new { error = "Platform name must be unique" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("delete/{id}"),Authorize]
        public IActionResult DeletePlatform(int id)
        {
            try
            {
                using var con = new SQLiteConnection(_database);

                var count = con.ExecuteScalar<int>("SELECT COUNT(*) FROM Song WHERE from_platform = @id", new { id });
                if (count > 0)
                {
                    return BadRequest(new { error = "Cannot delete platform: it is being used by songs" });
                }

                var rowsAffected = con.Execute("DELETE FROM Platform WHERE id = @id", new { id });

                if (rowsAffected == 0)
                {
                    return NotFound(new { error = "Platform not found" });
                }

                return Ok(new { message = "Platform deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class CreatePlatformRequest
    {
        public string name { get; set; } = string.Empty;
        public int type { get; set; }
        public string? url { get; set; }
    }

    public class UpdatePlatformRequest
    {
        public string? name { get; set; }
        public int? type { get; set; }
        public string? url { get; set; }
    }
}