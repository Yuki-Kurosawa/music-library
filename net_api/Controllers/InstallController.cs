using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SQLite;
using F = System.IO.File;
using System.Text;

namespace net_api.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class InstallController : ControllerBase
	{
		private string database;

		public InstallController(IConfiguration configuration)
		{
			database = configuration.GetConnectionString("DefaultConnection");
		}

		[HttpGet]
		public string Install()
		{
			SQLiteConnection con = new SQLiteConnection(database);
			con.Open();

			SQLiteCommand cmd = new SQLiteCommand(con);
			cmd.CommandText = F.ReadAllText("..\\DATABASE.sql", Encoding.UTF8);
			cmd.ExecuteNonQuery();

			con.Close();
			return "OK";
		}

		[HttpGet]
		public string InitDB()
		{
			SQLiteConnection con = new SQLiteConnection(database);
			con.Open();

			SQLiteCommand cmd = new SQLiteCommand(con);
			cmd.CommandText = F.ReadAllText("..\\INITDB.sql", Encoding.UTF8);
			cmd.ExecuteNonQuery();

			con.Close();
			return "OK";
		}
    }
}
