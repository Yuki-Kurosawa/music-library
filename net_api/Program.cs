using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Swagger;
using System.Net;
using net_api.Security;

namespace net_api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // 配置Kestrel
            builder.WebHost.ConfigureKestrel(serverOptions =>
            {
                serverOptions.ConfigureHttpsDefaults(listenOptions =>
                {
                    listenOptions.SslProtocols = System.Security.Authentication.SslProtocols.Tls12 | System.Security.Authentication.SslProtocols.Tls13;
                });
            });

            // Add services to the container.

            // 添加 CORS 服务
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    builder =>
                    {
                        builder.AllowAnyOrigin()     // 允许任何来源
                               .AllowAnyMethod()     // 允许任何 HTTP 方法
                               .AllowAnyHeader();    // 允许任何头部
                    });
            });

            builder.Services.Configure<ApiAuthenticationOptions>(builder.Configuration.GetSection("ApiKeyConfig"));


            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen((options)=>{
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "Music Library API", Version = "v3" }); 
                options.AddSecurityDefinition("Bearer",
                       new OpenApiSecurityScheme()
                       {
                           Description = "API Key or Token",
                           Name = "Authorization",
                           In = ParameterLocation.Header,
                           Type = SecuritySchemeType.ApiKey,
                           Scheme = "ApiAuth",
                           BearerFormat = "JWT"
                       });
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme, Id = "Bearer"
                                }
                            },
                            new List<string>()
                        }
                });
            });

            builder.Services.AddSpaStaticFiles(options =>
            {
                options.RootPath = "wwwroot"; // 设置静态文件根目录
            });

            builder.Services.AddAuthentication("ApiAuth")
                .AddApiAuthentication(options => { });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger(options =>
                {
                    options.OpenApiVersion = OpenApiSpecVersion.OpenApi2_0;
                });
                app.UseSwaggerUI(options=>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Music Library API");
                });
            }

            // 启用 CORS 中间件
            app.UseCors("AllowAll");

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.UseStaticFiles();

            app.UseSpa(app=>
            {
                app.Options.SourcePath = "wwwroot"; // 设置静态文件根目录
            });

            app.MapControllers();

            app.Run();
        }
    }
}
