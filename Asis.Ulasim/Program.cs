using Gelf.Extensions.Logging;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;

namespace Asis.Ulasim
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = BuildWebHost(args);         
            host.Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            new WebHostBuilder()

        .ConfigureAppConfiguration((webHostBuilderContext, configurationbuilder) =>
          {
              var environment = webHostBuilderContext.HostingEnvironment;
              string pathOfCommonSettingsFile = Path.Combine(environment.ContentRootPath, ".", "Common");
              configurationbuilder
                  //.AddJsonFile("appSettings.json", optional: true)
                  .AddJsonFile(Path.Combine(pathOfCommonSettingsFile, "CommonSettings.json"), optional: true, reloadOnChange: true);

              configurationbuilder.AddEnvironmentVariables();
          })
        .UseKestrel()
        .UseContentRoot(Directory.GetCurrentDirectory())
        .UseIISIntegration()
        .UseStartup<Startup>()
        .Build();
      
        private static void SetHost(Microsoft.AspNetCore.Server.Kestrel.Core.KestrelServerOptions options)
        {
            var configuration = (IConfiguration)options.ApplicationServices.GetService(typeof(IConfiguration));
            var host = configuration.GetSection("Asis.Ulasim").Get<Host>();
            foreach (var endpointKvp in host.Endpoints)
            {
                var endpointName = endpointKvp.Key;
                var endpoint = endpointKvp.Value;
                if (!endpoint.IsEnabled)
                {
                    continue;
                }

                var address = IPAddress.Parse(endpoint.Address);
                options.Listen(address, endpoint.Port, opt =>
                {
                    if (endpoint.Certificate != null)
                    {
                        switch (endpoint.Certificate.Source)
                        {
                            case "File":
                                opt.UseHttps(endpoint.Certificate.Path, endpoint.Certificate.Password);
                                break;
                            default:
                                throw new NotImplementedException($"The source {endpoint.Certificate.Source} is not yet implemented");
                        }

                        //opt.UseConnectionLogging();
                    }
                });

                options.UseSystemd();   //?
            }
        }
      

    }
    public class Host
    {
        public Dictionary<string, Endpoint> Endpoints { get; set; }
    }

    public class Endpoint
    {
        public bool IsEnabled { get; set; }
        public string Address { get; set; }
        public int Port { get; set; }
        public Certificate Certificate { get; set; }
    }

    public class Certificate
    {
        public string Source { get; set; }
        public string Path { get; set; }
        public string Password { get; set; }
    }
}
