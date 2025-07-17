using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SQLite;
using F = System.IO.File;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;

namespace net_api.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class InstallController : ControllerBase
	{
		private string database, datafile;

		public InstallController(IConfiguration configuration)
		{
			database = configuration.GetConnectionString("DefaultConnection");
            datafile = database.Replace("Data Source=", "").Trim(';').Trim();
        }

		[HttpGet,Route("Install"),Authorize]
		public string Install()
		{
			try
			{
				if(F.Exists(datafile))
				{
					return JsonConvert.SerializeObject(new { code = 500, message = "Database Already Exists" });
                }

                SQLiteConnection con = new SQLiteConnection(database);
				con.Open();

				SQLiteCommand cmd = new SQLiteCommand(con);
				cmd.CommandText = F.ReadAllText("DATABASE.sql", Encoding.UTF8);
				cmd.ExecuteNonQuery();

				con.Close();
				return JsonConvert.SerializeObject(new { code = 200, message = "Database Installed Successfully" });
			}
			catch
			{
                return JsonConvert.SerializeObject(new { code = 500, message = "Database Install Failed" });
            }
		}

		[HttpGet,Route("InitDB"),Authorize]
		public string InitDB()
		{
			try
			{

				if(!F.Exists(datafile))
				{
					return JsonConvert.SerializeObject(new { code = 404, message = "Database Not Found" });
                }

                SQLiteConnection con = new SQLiteConnection(database);
				con.Open();

				SQLiteCommand cmd = new SQLiteCommand(con);
				cmd.CommandText = F.ReadAllText("INITDB.sql", Encoding.UTF8);
				cmd.ExecuteNonQuery();

				con.Close();
                return JsonConvert.SerializeObject(new { code = 200, message = "Database Initialized Successfully" });
            }
			catch
			{
				return JsonConvert.SerializeObject(new { code = 500, message = "Database Initialize Failed" });
            }
        }

        [HttpGet, Route("DeleteDB"), Authorize]
        public string DeleteDB()
		{
			try
			{
				

				if (F.Exists(datafile))
				{
					F.Delete(datafile);
					return JsonConvert.SerializeObject(new { code = 200, message = "Database Ruined" });
				}
				else
				{
					return JsonConvert.SerializeObject(new { code = 404, message = "Database Not Found" });
				}
			}
			catch
			{
				return JsonConvert.SerializeObject(new { code = 500, message = "Database Delete Failed" });
			}
        }

        [HttpGet,Route("Auth"),Authorize]
		public string Auth ()
		{
			return "DONE";
		}
    }
}
