using Microsoft.AspNetCore.Mvc;
using System.Data.SQLite;
using Dapper;
using net_api.Models;

namespace net_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly string _database;

        public CategoriesController(IConfiguration configuration)
        {
            _database = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet]
        public IActionResult GetCategories()
        {
            try
            {
                using var con = new SQLiteConnection(_database);
                var categories = con.Query("SELECT id, name, name_english FROM Category ORDER BY id asc").Select(q=>
                new {
                    id=q.id,
                    name=q.name,
                    name_english = q.name_english
                }).ToList();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetCategory(int id)
        {
            try
            {
                using var con = new SQLiteConnection(_database);
                var category = con.QueryFirstOrDefault<Category>(
                    "SELECT id, name, name_english FROM Category WHERE id = @id", new { id });
                if (category == null)
                    return NotFound(new { error = "Category not found" });
                return Ok(category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost,Authorize]
        public IActionResult CreateCategory([FromBody] CreateCategoryRequest request)
        {
            try
            {
                using var con = new SQLiteConnection(_database);
                var sql = "INSERT INTO Category (name, name_english) VALUES (@name, @name_english); SELECT last_insert_rowid();";
                var newId = con.ExecuteScalar<long>(sql, new { name = request.name, name_english = request.name_english });
                return CreatedAtAction(nameof(GetCategory), new { id = newId }, new { id = newId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("{id}"),Authorize]
        public IActionResult UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
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
                if (request.name_english != null)
                {
                    setParts.Add("name_english = @name_english");
                    parameters.Add("@name_english", request.name_english);
                }

                if (setParts.Count == 0)
                {
                    return BadRequest(new { error = "No fields to update" });
                }

                var sql = $"UPDATE Category SET {string.Join(", ", setParts)} WHERE id = @id";
                var rowsAffected = con.Execute(sql, parameters);

                if (rowsAffected == 0)
                {
                    return NotFound(new { error = "Category not found" });
                }

                return Ok(new { message = "Category updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("delete/{id}"),Authorize]
        public IActionResult DeleteCategory(int id)
        {
            try
            {
                using var con = new SQLiteConnection(_database);

                var count = con.ExecuteScalar<int>("SELECT COUNT(*) FROM Song WHERE category_id = @id", new { id });
                if (count > 0)
                {
                    return BadRequest(new { error = "Cannot delete category: it is being used by songs" });
                }

                var rowsAffected = con.Execute("DELETE FROM Category WHERE id = @id", new { id });

                if (rowsAffected == 0)
                {
                    return NotFound(new { error = "Category not found" });
                }

                return Ok(new { message = "Category deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class CreateCategoryRequest
    {
        public string name { get; set; } = string.Empty;
        public string name_english { get; set; } = string.Empty;
    }

    public class UpdateCategoryRequest
    {
        public string? name { get; set; }
        public string? name_english { get; set; }
    }
}