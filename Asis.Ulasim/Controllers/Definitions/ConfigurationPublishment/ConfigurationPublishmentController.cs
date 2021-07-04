using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Asis.Ulasim.Context;
using Asis.Ulasim.Models.Definitions.ConfigurationManagement;
using Asis.Ulasim.Models.Fills;
using DevExpress.DataProcessing;
using DevExpress.XtraRichEdit.Layout;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Exchange.WebServices.Data;
using Newtonsoft.Json;
using NLog.LayoutRenderers.Wrappers;
using NLog.Targets;
using NPOI.SS.Formula.Functions;


namespace Asis.Ulasim.Controllers.Definitions.ConfigurationManagement
{
    public class ConfigurationPublishmentController : BaseController
    {
        private readonly Models.Definitions.ConfigurationManagement.ConfigurationManagement _configuration;
        public ConfigurationPublishmentController()
        {
            _configuration = new Models.Definitions.ConfigurationManagement.ConfigurationManagement();
        }
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult IndexTnj()
        {
            return View();
        }
        public JsonResult GetConfigurationPublishment()
        {
            var result = _configuration.GetConfigurationManagement();
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
        public JsonResult GetJsonConvert(int currentKey, int capabilityId, int deviceId, int equipmentId, int configurationId)
        {
            var result = _configuration.GetConvertName(currentKey, capabilityId, deviceId, equipmentId, configurationId);
            if (result != null)
            {
                string jsonString = System.Text.Json.JsonSerializer.Serialize(result);
                return Json(result);
            }
            return Json(null);
        }
        [HttpGet]
        public JsonResult GetConfigurationPublishmentNew()
        {
            var result = _configuration.GetConfigurationManagementNew();
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
        [HttpGet]
        public ActionResult GetConfigurationPublishmentNewPartial()
        {
            //var result = _configuration.GetConfigurationManagementNew();
            //if (result != null)
            //{
            //    return Json(result);
            //}
            //return Json(null);
            return PartialView("_PartialConfigurationManagementQ");
        }
        [HttpGet]
        public List<ConfigurationModel> GetConfigurationPublishmentNewTnj()
        {
            var result = _configuration.GetConfigurationManagementNew();
            if (result != null)
            {
                return result.ToList();
            }
            return null;
        }
        [HttpGet]
        public JsonResult FillCapability()
        {
            var result = _configuration.GetCapability();
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
        [HttpGet]
        public JsonResult FillDevice()
        {
            var result = _configuration.GetDevice();
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
        [HttpGet]
        public JsonResult FillDeviceType()
        {
            var result = _configuration.GetDeviceType();
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
        [HttpGet]
        public List<Devices> FillDevicePublishList(string device)
        {
            var result = _configuration.GetDevicePublishList(device);
            if (result != null)
            {
                List<Devices> devices = new List<Devices>();
                foreach (var item in result)
                {
                    devices.Add(item);
                }
                return devices;
            }
            return null;
        }
        [HttpGet]
        public JsonResult FillEquipment()
        {
            var result = _configuration.GetEquipment();
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
        [HttpGet]
        public JsonResult FillConfiguration()
        {
            var result = _configuration.GetConfiguration();
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
        [HttpGet]
        public JsonResult FillRevision()
        {
            var result = _configuration.GetRevision();
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
        [HttpPost]
        public IActionResult SendConfigurationPublishment(int Id, string jsonEditor)
        {
            try
            {
                var returnjson = PostPublishing(jsonEditor);
                var capConfgQModel = new ConfigurationManagementQ();
                using (var context = new TableContext())
                {
                    var capabilitymodelRevisions = (CapabilityConfigurationRevision)_configuration.GetCapabilityConfigurationRevisions(Id);
                    var capabilitymodel = (CapabilityConfModel)_configuration.GetConvertName(capabilitymodelRevisions.CapabilityConfigurationId ?? 0);
                    capConfgQModel.Name = capabilitymodel.Capability.ToString() + "." + capabilitymodel.Device.ToString() + "." + capabilitymodel.Equipment.ToString() + "." + capabilitymodel.Configuration.ToString() + ".json";
                    capConfgQModel.RevisionId = Id;
                    capConfgQModel.RequestJson = jsonEditor;
                    capConfgQModel.ResponseJson = returnjson.Value.ToString();
                    capConfgQModel.Status = "Waiting";
                    context.ConfigurationManagementsQ.Add(capConfgQModel);
                    context.SaveChanges();
                }
                return Json(returnjson.Value);
            }
            catch (Exception ex)
            {
                return null;
            }
        }
        public IActionResult InsertConfigurationPublishment(int Id, int network, string deviceTypeId, string device)
        {
            RequestContent requestContent = new RequestContent();
            List<Devices> lst = new List<Devices>();
            RequestHeader requestHeader = new RequestHeader();

            lst = FillDevicePublishList(device);
            requestHeader.Network = _configuration.GetNetworkName(network);
            requestHeader.Devices = new List<Guid>();
            foreach (var item in lst)
            {
                requestHeader.Devices.Add(item.DeviceRefranceID);
            }

            RequestVersion requestVersion = new RequestVersion();

            var objectversion = (CapabilityConfigurationRevision)_configuration.GetCapabilityConfigurationRevisions(Id);
            requestVersion.Major = objectversion.Major ?? 0;
            requestVersion.Minor = objectversion.Minor ?? 0;
            requestVersion.Schema = objectversion.Schema ?? 0;
            requestVersion.Tracking = objectversion.Tracking.ToString();

            int capabilityConfigurationRevisionId = objectversion.ID.Value;
            int capabilityConfigurationId = objectversion.CapabilityConfigurationId.Value;
            requestContent.Version = requestVersion;



            var objectsections = (List<Section>)_configuration.GetParentSections(capabilityConfigurationRevisionId);

            List<RequestSection> hierarchy = new List<RequestSection>();
            hierarchy = objectsections
                            .Where(c => c.ParentId == 0)
                            .Select(c => new RequestSection()
                            {
                                Id = c.Id ?? 0,
                                Item = c.Item,
                                Type = c.Type == "" ? "" : _configuration.GetConvertSectionTypeName(Convert.ToInt32(c.Type)),
                                Value = c.Value,
                                //ParentId = c.ParentId ?? 0,
                                //Values = GetChildren(objectsections, c.Id ?? 0)
                                section = null,
                                values = GetChildren(objectsections, c.Id ?? 0)
                            })
                            .ToList();

            HieararchyWalk(hierarchy);


            requestContent.section = hierarchy;

            var modelcontent = (CapabilityConfModel)_configuration.GetConvertName(capabilityConfigurationId);
            requestContent.Id = (int)modelcontent.ID;
            requestContent.Capability = modelcontent.Capability;
            requestContent.Configuration = modelcontent.Configuration;
            requestContent.Device = modelcontent.Device;
            requestContent.Equipment = modelcontent.Equipment;

            RequestRoot requestRoot = new RequestRoot();

            requestRoot.Content = requestContent;
            requestRoot.Header = requestHeader;
            string jsonString = "";
            jsonString = System.Text.Json.JsonSerializer.Serialize(requestRoot);
            //jsonString = jsonString.Replace(@"," + '"' + "Values" + '"' + ":[]", "");
            jsonString = jsonString.Replace(@"," + '"' + "Values" + '"' + ":[]", "");
            jsonString = jsonString.Replace(@"," + '"' + "section" + '"' + ":null", "");
            jsonString = jsonString.Replace(@"," + '"' + "section" + '"' + ":[]", "");
            jsonString = jsonString.Replace(@"," + '"' + "values" + '"' + ":[{}]", "");
            jsonString = jsonString.Replace(@"" + '"' + "ParentId" + '"' + ":" + 0 + ",", "");


            foreach (var item in objectsections)
            {
                //jsonString = jsonString.Replace(@"" + '"' + "Id" + '"' + ":" + item.Id.ToString() + ",", "");
                //jsonString = jsonString.Replace(@"" + '"' + "ParentId" + '"' + ":" + item.ParentId.ToString() + ",", "");


                jsonString = jsonString.Replace(@"" + '"' + "Id" + '"' + ":" + "" + 0 + ",", "");
                jsonString = jsonString.Replace(@"" + '"' + "Item" + '"' + ":null" + ",", "");
                jsonString = jsonString.Replace(@"" + '"' + "Value" + '"' + ":null" + ",", "");
                jsonString = jsonString.Replace(@"" + '"' + "Type" + '"' + ":null" + ",", "");
                //jsonString = jsonString.Replace(@"," + '"' + "Item" + '"' + ":null,", "");
                //jsonString = jsonString.Replace(@"," + '"' + "Value" + '"' + ":null,", "");
                //jsonString = jsonString.Replace(@"," + '"' + "Type" + '"' + ":null,", "");
                //jsonString = jsonString.Replace(@"," + '"' + "CapabilityConfigurationRevisionId" + '"' + ":null,", "");
                //jsonString = jsonString.Replace(@"," + '"' + "IsActive" + '"' + ":null", "");
                jsonString = jsonString.Replace(@"," + '"' + "CapabilityConfigurationRevisionId" + '"' + ":null", "");
                jsonString = jsonString.Replace(@"," + '"' + "IsActive" + '"' + ":null", "");

                jsonString = jsonString.Replace(@"," + '"' + "values" + '"' + ":null", "");
                jsonString = jsonString.Replace(@"" + '"' + "values" + '"' + ":null", "");
                jsonString = jsonString.Replace(@"," + '"' + "values" + '"' + ":[]", "");
                jsonString = jsonString.Replace(@"," + '"' + "section" + '"' + ":null", "");
                jsonString = jsonString.Replace(@"," + '"' + "section" + '"' + ":[]", "");
                jsonString = jsonString.Replace(@"," + '"' + "values" + '"' + ":[{}]", "");
                jsonString = jsonString.Replace(@"" + '"' + "Id" + '"' + ":" + item.Id.ToString() + ",", "");
                jsonString = jsonString.Replace(@"" + '"' + "ParentId" + '"' + ":" + item.ParentId + ",", "");

            }
            return Json(jsonString);
        }




        public List<RequestSection> GetChildren(List<Section> requestSections, int parentId)
        {
            List<RequestSection> requestSection = new List<RequestSection>();
            List<Section> sections = new List<Section>();

            if (parentId > 0)
            {
                List<Section> tempSection = requestSections
                       .Where(c => c.ParentId == parentId)
                       .ToList();

                foreach (var item in tempSection)
                {

                    sections.Add(new Section()
                    {
                        Id = item.Id ?? 0,
                        Item = item.Item,
                        Type = item.Type == "" ? "" : _configuration.GetConvertSectionTypeName(Convert.ToInt32(item.Type)),
                        Value = item.Value,
                        ParentId = item.ParentId ?? -1
                        //Values = GetChildren(parentSections, c.Id ?? 0)
                    });
                }

                requestSection.Add(
                    new RequestSection()
                    {
                        section = sections
                    });


            }
            return requestSection;

            //return requestSections
            //    .Where(c => c.ParentId == parentId)
            //    .Select(c => new RequestSection
            //    {
            //        Id = c.Id ?? 0,
            //        Item = c.Item,
            //        Type = c.Type == "" ? "" : _configuration.GetConvertSectionTypeName(Convert.ToInt32(c.Type)),
            //        Value = c.Value,
            //        ParentId = c.ParentId ?? 0,
            //        Values = GetChildren(requestSections, c.Id ?? 0)
            //    })
            //    .ToList();
        }
        public static void HieararchyWalk(List<RequestSection> hierarchy)
        {
            if (hierarchy != null)
            {
                foreach (var item in hierarchy)
                {
                    HieararchyWalk(item.values);
                }
            }
        }

        public JsonResult PostPublishing(string jsonData)
        {
            try
            {
                var content = new StringContent(jsonData, Encoding.UTF8, "application/json");
                content.Headers.Add("X-Asis-Key", "06795D9D-A770-44B9-9B27-03C6ABDB1BAE");
                HttpClient client = new HttpClient();
                var json = Monitoring.MonitoringController.Get("AsisConfiguration/Configuration/Publish", client, content).Result;
                ResponseRoot obuDiagnosticData = JsonConvert.DeserializeObject<ResponseRoot>(json);
                return Json(json);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }
        public class ResponseHeader
        {
            public int id { get; set; }
        }
        public class ResponsDeviceStatu
        {
            public string device { get; set; }
            public string state { get; set; }
            public string description { get; set; }
        }
        public class ResponsContent
        {
            public List<ResponsDeviceStatu> deviceStatus { get; set; }
        }
        public class ResponseRoot
        {
            public ResponseHeader header { get; set; }
            public ResponsContent content { get; set; }
        }

        public class RequestRoot
        {
            public RequestHeader Header { get; set; }
            public RequestContent Content { get; set; }
        }

        //public interface ISection
        //{
        //    [JsonProperty("Item")]
        //    string Item { get; set; }
        //    [JsonProperty("Value")]
        //    string Value { get; set; }
        //    [JsonProperty("Type")]
        //    string Type { get; set; }
        //}
        public class RequestContent
        {
            [JsonProperty("Id")]
            public int Id { get; set; }
            [JsonProperty("Capability")]
            public string Capability { get; set; }
            [JsonProperty("Device")]
            public string Device { get; set; }
            [JsonProperty("Equipment")]
            public string Equipment { get; set; }
            [JsonProperty("Configuration")]
            public string Configuration { get; set; }
            [JsonProperty("Version")]
            public RequestVersion Version { get; set; }
            [JsonProperty("section")]
            public List<RequestSection> section { get; set; }
        }

        public class RequestHeader
        {
            [JsonProperty("Network")]
            public string Network { get; set; }
            [JsonProperty("Devices")]
            public List<Guid> Devices { get; set; }
        }
        public class RequestSection //: ISection
        {
            [JsonProperty("Id")]
            public int Id { get; set; }

            [JsonProperty("ParentId")]
            public int ParentId { get; set; }

            [JsonProperty("Item")]
            public string Item { get; set; }
            [JsonProperty("Value")]
            public string Value { get; set; }
            [JsonProperty("Type")]
            public string Type { get; set; }

            [JsonProperty("section", NullValueHandling = NullValueHandling.Ignore)]
            public List<Section> section { get; set; }

            [JsonProperty("Values", NullValueHandling = NullValueHandling.Ignore)]
            public List<RequestSection> values { get; set; }
        }
        //public class SubSection
        //{
        //    [JsonProperty("Section")]
        //    public List<RequestSection> Sections { get; set; }
        //}
        public class RequestVersion
        {
            public long Schema { get; set; }
            public long Major { get; set; }
            public long Minor { get; set; }
            public string Tracking { get; set; }
        }







    }
}