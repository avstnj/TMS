using System;
using Asis.Ulasim.Controllers;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.IO;

namespace Asis.Ulasim.Models.Common
{
    public class CommonSettings
    {
        public static IConfiguration AppSetting { get; }
        static CommonSettings()
        {        AppSetting = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile(@".\Common\CommonSettings.json", optional: true, reloadOnChange: true)
                .Build();
        }

        public static List<SettingsModel> Settings()
        {
            List<SettingsModel> result = new List<SettingsModel>();
            try
            {
                result.Add(new SettingsModel
                {
                    CityName = CommonSettings.AppSetting["WeatherSettings:CityName"],
                    CityId = CommonSettings.AppSetting["WeatherSettings:CityId"]
                });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
           

            return result;
        }
        // Kullanımı // var deneme = CommonSettings.Settings().FirstOrDefault();
    }

    public class SettingsModel 
    {
        public string CityId { get; set; }
        public string CityName { get; set; }
        
    }
}
