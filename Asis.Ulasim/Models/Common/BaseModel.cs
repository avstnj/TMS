using Asis.Ulasim.Models.ColumnCheck;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Asis.Ulasim.Models.Common
{
    public class BaseModel
    {
        public BaseModel()
        {
            //
        }

        public ColumnCheckResult ColumnCheck(string reportName, string columnName)
        {
            try
            {
                var cityName = CommonSettings.Settings().FirstOrDefault();
                //var serializer = new JavaScriptSerializer();
                var result = new ColumnCheckResult { IsColumnExists = false, Caption = "" };
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Common/" + cityName.CityName + "-DataGridSettings.json");

                using (var stream = new StreamReader(filePath))
                {
                    var json = stream.ReadToEnd();
                    var StationList = JsonConvert.DeserializeObject<ColumnCheckModel>(json);
                    //var StationList = serializer.Deserialize<ColumnCheckModel>(json);
                    foreach (var item in StationList.menuList)
                    {
                        if (item.name != reportName) continue;
                        foreach (var col in item.columns)
                        {
                            if (col.fieldName != columnName) continue;
                            result.IsColumnExists = true;
                            result.Caption = col.caption;
                            break;
                        }
                    }

                }
                return result;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }
        public string LogoCheck()
        {
            try
            {
                var cityName = CommonSettings.Settings().FirstOrDefault();
                //var serializer = new JavaScriptSerializer();
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Common/CommonSettings.json");
                var logo = "";
                using (var stream = new StreamReader(filePath))
                {
                    var json = stream.ReadToEnd();
                    var data = JsonConvert.DeserializeObject<MyDefaultSettings>(json);
                    logo = Path.Combine(Directory.GetCurrentDirectory() + data.DocumentLogo.ToString());
                }
                return logo;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }
        public string LanguageCheck()
        {
            try
            {
                var cityName = CommonSettings.Settings().FirstOrDefault();
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Common/" + cityName.CityName + "-DataGridSettings.json");
                using (var stream = new StreamReader(filePath))
                {
                    var json = stream.ReadToEnd();
                    var StationList = JsonConvert.DeserializeObject<ColumnCheckModel>(json);
                    return StationList.Language;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }
        public string DashboardCheck()
        {
            try
            {
                var cityName = CommonSettings.Settings().FirstOrDefault();
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Common/" + cityName.CityName + "-DataGridSettings.json");
                using (var stream = new StreamReader(filePath))
                {
                    var json = stream.ReadToEnd();
                    var StationList = JsonConvert.DeserializeObject<ColumnCheckModel>(json);
                    return StationList.Dashboard;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }
        public List<string> LanguageList()
        {
            try
            {
                var cityName = CommonSettings.Settings().FirstOrDefault();
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Common/" + cityName.CityName + "-DataGridSettings.json");
                List<string> langList = new List<string>();
                using (var stream = new StreamReader(filePath))
                {
                    var json = stream.ReadToEnd();
                    var languageList = JsonConvert.DeserializeObject<ColumnCheckModel>(json);
                    foreach (var item in languageList.langList)
                    {
                        foreach (var col in item.columns)
                        {
                            langList.Add(col.fieldName);
                        }
                    }
                }
                return langList;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }
        public class MyDefaultSettings
        {
            public string DocumentLogo { get; set; }
            public string İconSettings { get; set; }
            public string TitleSettings { get; set; }
        }
    }
}
