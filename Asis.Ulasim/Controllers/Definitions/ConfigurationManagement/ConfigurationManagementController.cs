using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Asis.Ulasim.Models.Fills;
using Microsoft.AspNetCore.Mvc;

namespace Asis.Ulasim.Controllers.Definitions.ConfigurationManagement
{
    public class ConfigurationManagementController : BaseController
    {
        private readonly Models.Definitions.ConfigurationManagement.ConfigurationManagement _configuration;
        private readonly SchemaAndVersion _schemaAndVersion;
        List<string> listeValue = new List<string>();
        public ConfigurationManagementController()
        {
            _configuration = new Models.Definitions.ConfigurationManagement.ConfigurationManagement();
            _schemaAndVersion = new SchemaAndVersion();
        }
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult IndexTnj()
        {
            return View();
        }
        public JsonResult GetConfigurationManagement()
        {
            var result = _configuration.GetConfigurationManagement();
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
        public JsonResult GetSection(int schema, int version, int Id)
        {
            var result = _configuration.GetSection(schema, version, Id);
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
        [HttpPost]
        public IActionResult InsertConfigurationManagement(string values)
        {
            _configuration.InsertConfigurationManagement(values, ReMember().UserId);
            return Ok();
        }
        [HttpGet]
        public IActionResult InsertConfigurationManagementTnj(int capabilityId, int device_TypeId, int equipmentId, int configurationId)
        {
            _configuration.InsertConfigurationManagementTnj(capabilityId, device_TypeId, equipmentId, configurationId);
            return Ok();
        }
        [HttpPost]
        public JsonResult InsertSection(string values, int schema, int version, int? capability, int? deviceTypeId, int? equipment, int? configuration, int Id)
        {
            _configuration.InsertSection(values, schema, version, capability, deviceTypeId, equipment, configuration, ReMember().UserId);
            return GetSchemaAndVersion(Id);
        }
        public JsonResult InsertSectionTnj(string values, int schema, int version, int? capability, int? deviceTypeId, int? equipment, int? configuration, int Id)
        {
            _configuration.InsertSection(values, schema, version, capability, deviceTypeId, equipment, configuration, ReMember().UserId);
            return GetSchemaAndVersion(Id);
        }
        [HttpPut]
        public IActionResult UpdateConfigurationManagement(int key, string values, int capabilityConfigurationId)
        {
            _configuration.UpdateConfigurationManagement(key, values, capabilityConfigurationId, ReMember().UserId);
            return Ok();
        }
        [HttpGet]
        public IActionResult UpdateConfigurationManagementTnj(int capabilityConfigurationId, int capabilityId, int device_TypeId, int equipmentId, int configurationId)
        {
            _configuration.UpdateConfigurationManagementTnj(capabilityConfigurationId, capabilityId, device_TypeId, equipmentId, configurationId);
            return Ok();
        }
        [HttpPut]
        public JsonResult UpdateSection(int key, string values, int schema, int version, int? capability, int? deviceTypeId, int? equipment, int? configuration, int Id)
        {
            _configuration.UpdateSection(key, values, schema, version, capability, deviceTypeId, equipment, configuration, ReMember().UserId);
            return GetSchemaAndVersion(Id);
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
        public JsonResult FillSectionType()
        {
            var result = _configuration.GetFillSectionType();
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
        public JsonResult GetSchemaAndVersion(int Id)
        {
            var result = _schemaAndVersion.GetSchemaAndVersion(Id);
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
        [HttpGet]
        public JsonResult GetVersion(int schemaId, int version, int configuration)
        {
            var result = _schemaAndVersion.GetVersion(schemaId, version, configuration);
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }

        [HttpDelete]
        public IActionResult DeleteSection(int key)
        {
            _configuration.DeleteSection(key);
            return Ok();
        }
        [HttpDelete]
        public JsonResult DeleteSectionTnj(int key, int capabilityConfigurationId)
        {
            _configuration.DeleteSection(key);
            return GetSchemaAndVersion(capabilityConfigurationId);
        }
        [HttpGet]
        public JsonResult GetSchema(int? schema)
        {
            var result = _schemaAndVersion.GetSchema(schema);
            if (result != null)
            {
                return Json(result);
            }
            return Json(null);
        }
    }
}