using Asis.Ulasim.Context;
using DevExpress.Xpo;
using Newtonsoft.Json;
using StoredProcedureEFCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Exchange.WebServices.Data;
using static Asis.Ulasim.Controllers.Definitions.ConfigurationManagement.ConfigurationPublishmentController;
using DevExpress.XtraExport.Xls;
using NPOI.HSSF.Util;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage;
using Remotion.Linq.Parsing.ExpressionVisitors;
using DevExpress.XtraCharts;

namespace Asis.Ulasim.Models.Definitions.ConfigurationManagement
{
    public class ConfigurationManagement
    {
        public string OutMessage = "";
        public int OutId = 0;
        public IQueryable<CapabilityConfigurationModel> GetConfigurationManagement()
        {
            IQueryable<CapabilityConfigurationModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.SelectCapabilityConfiguration")
                        .Exec(r => result = r.ToList<CapabilityConfigurationModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }
        public IQueryable<ConfigurationModel> GetConfigurationManagementNew()
        {
            IQueryable<ConfigurationModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.ConfigurationManagementQ")
                    .Exec(r => result = r.ToList<ConfigurationModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }
        public IQueryable<SectionModel> GetSection(int schemaId, int version, int Id)
        {
            IQueryable<SectionModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.SelectSection")
                        .AddParam("schemaId", schemaId)
                        .AddParam("version", version)
                        .AddParam("capabilityConfigurationId", Id)
                        .Exec(r => result = r.ToList<SectionModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }
        public object InsertConfigurationManagement(string values, int userId)
        {
            using (var context = new TableContext())
            {
                var capabilityConfiguration = new CapabilityConfiguration();
                try
                {
                    values = values.Replace("true", "1").Replace("false", "0");
                    JsonConvert.PopulateObject(values, capabilityConfiguration);
                    capabilityConfiguration.GuidId = Guid.NewGuid();
                    context.CapabilityConfigurations.Add(capabilityConfiguration);
                    context.SaveChanges();
                }
                catch (Exception e)
                {
                    OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                    return OutMessage;
                }
                return capabilityConfiguration;
            }
        }
        public object InsertConfigurationManagementTnj(int capabilityId, int device_TypeId, int equipmentId, int configurationId)
        {
            using (var context = new TableContext())
            {
                var capabilityConfiguration = new CapabilityConfiguration();
                try
                {
                    capabilityConfiguration.GuidId = Guid.NewGuid();
                    capabilityConfiguration.CapabilityId = capabilityId;
                    capabilityConfiguration.DeviceTypeId = device_TypeId;
                    capabilityConfiguration.EquipmentId = equipmentId;
                    capabilityConfiguration.ConfigurationId = configurationId;
                    context.CapabilityConfigurations.Add(capabilityConfiguration);
                    context.SaveChanges();
                }
                catch (Exception e)
                {
                    OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                    return OutMessage;
                }
                return capabilityConfiguration;
            }
        }
        public int getParentId(List<Section> section, int ParentId, int revisionId)
        {
            var model = section.First(a => a.Id == ParentId);
            return (int)GetParentSections(revisionId, model.Item, model.Value);
        }
        public object InsertSection(string values, int schema, int version, int? capability, int? deviceTypeId, int? equipment, int? configuration, int userId)
        {
            using (var context = new TableContext())
            {
                var section = new Section();
                var capConfgModel = new CapabilityConfigurationRevision();
                var schemas = new Schemas();
                try
                {
                    JsonConvert.PopulateObject(values, section);
                    if (values != "{}" && values.Length > 15)
                    {
                        var edit = context.CapabilityConfigurations.Where(a => a.CapabilityId == capability && a.DeviceTypeId == deviceTypeId && a.EquipmentId == equipment && a.ConfigurationId == configuration).ToList();

                        var lastschema = context.CapabilityConfigurationRevisions.LastOrDefault(a => a.CapabilityConfigurationId == edit[0].ID && a.Schema == schema && a.Tracking == version);
                        if (schema == 0 && lastschema == null)
                        {

                            capConfgModel.Schema = 1;
                            capConfgModel.Major = 0;
                            capConfgModel.Minor = 0;
                            capConfgModel.Tracking = 0;
                            capConfgModel.RevisionDate = DateTime.Now;
                            capConfgModel.CapabilityConfigurationId = edit[0].ID;
                            context.CapabilityConfigurationRevisions.Add(capConfgModel);
                            context.SaveChanges();

                            var revisionId = context.CapabilityConfigurationRevisions.LastOrDefault(a => a.CapabilityConfigurationId == edit[0].ID);
                            JsonConvert.PopulateObject(values, section);
                            section.CapabilityConfigurationRevisionId = revisionId.ID;
                            section.IsActive = 1;
                            context.Sections.Add(section);
                            context.SaveChanges();
                        }
                        else
                        {
                            var oldrevisionId = context.CapabilityConfigurationRevisions.LastOrDefault(a => a.CapabilityConfigurationId == edit[0].ID);
                            var schm = oldrevisionId.Schema;
                            var schemaFind = context.Schema.Where(a => a.ID == schm).Count();
                            if (schemaFind == 0)
                            {
                                schemas.ParentId = schm;
                                schemas.ParentTypeId = 1;
                                context.Schema.Add(schemas);
                                context.SaveChanges();
                            }
                            capConfgModel.Schema = ++schm;
                            capConfgModel.Major = oldrevisionId.Major;
                            capConfgModel.Minor = oldrevisionId.Minor;
                            capConfgModel.Tracking = 0;
                            capConfgModel.RevisionDate = DateTime.Now;
                            capConfgModel.CapabilityConfigurationId = edit[0].ID;
                            context.CapabilityConfigurationRevisions.Add(capConfgModel);
                            context.SaveChanges();

                            var newrevisionId = context.CapabilityConfigurationRevisions.LastOrDefault(a => a.CapabilityConfigurationId == edit[0].ID);
                            section.CapabilityConfigurationRevisionId = newrevisionId.ID;
                            section.IsActive = 1;
                            List<Section> oldSection = new List<Section>();


                            var oldSectionrevisionId = context.CapabilityConfigurationRevisions.LastOrDefault(a => a.CapabilityConfigurationId == edit[0].ID && a.Schema == schema && a.Tracking == version);
                            oldSection = (List<Section>)GetSections(oldSectionrevisionId.ID.Value);
                            int newParentId = 0;
                            foreach (var item in oldSection)
                            {
                                if (item.ParentId != 0 && item.ParentId != null)
                                {
                                    newParentId = getParentId(oldSection, (int)item.ParentId, newrevisionId.ID.Value);
                                    //var model = oldSection.First(a => a.Id == item.ParentId);
                                    //newParentId = (int)GetParentSections(newrevisionId.ID.Value, model.Item, model.Value);
                                }
                                else
                                {
                                    newParentId = 0;
                                }
                                context.Sections.Add(new Section { CapabilityConfigurationRevisionId = newrevisionId.ID, Item = item.Item, Value = item.Value, IsActive = 1, ParentId = newParentId, Type = item.Type });
                                context.SaveChanges();//parentId almak için döngü içinde save ediliyor.
                            }

                            if (section.ParentId != 0 && section.ParentId != null)
                            {
                                newParentId = getParentId(oldSection, (int)section.ParentId, newrevisionId.ID.Value);
                                section.ParentId = newParentId;
                                //context.Sections.Add(section);
                                //context.SaveChanges();//parentId almak için döngü içinde save ediliyor.
                            }
                            context.Sections.Add(section);
                            context.SaveChanges();//parentId almak için döngü içinde save ediliyor.
                        }
                    }
                }
                catch (Exception e)
                {
                    OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                    return OutMessage;
                }
                return section;
            }
        }
        public object UpdateConfigurationManagement(int key, string values, int capabilityConfigurationId, int userId)
        {
            var capabilityConfiguration = new CapabilityConfiguration();
            // var section = new Section();
            //var capConfgModel = new CapabilityConfigurationRevision();
            try
            {
                using (var context = new TableContext())
                {
                    var capabilityConfigurations = context.CapabilityConfigurations.First(a => a.ID == key);
                    JsonConvert.PopulateObject(values, capabilityConfiguration);
                    capabilityConfigurations.CapabilityId = capabilityConfiguration.CapabilityId ?? capabilityConfigurations.CapabilityId;
                    capabilityConfigurations.ConfigurationId = capabilityConfiguration.ConfigurationId ?? capabilityConfigurations.ConfigurationId;
                    capabilityConfigurations.DeviceTypeId = capabilityConfiguration.DeviceTypeId ?? capabilityConfigurations.DeviceTypeId;
                    capabilityConfigurations.EquipmentId = capabilityConfiguration.EquipmentId ?? capabilityConfigurations.EquipmentId;
                    context.Entry(capabilityConfigurations).State = EntityState.Modified;
                    context.SaveChanges();

                    // return  GetConfigurationManagement();
                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                return OutMessage;
            }
            return null;
        }
        public object UpdateConfigurationManagementTnj(int capabilityConfigurationId, int? capabilityId, int? device_TypeId, int? equipmentId, int? configurationId)
        {
            try
            {
                using (var context = new TableContext())
                {
                    var capabilityConfigurations = context.CapabilityConfigurations.First(a => a.ID == capabilityConfigurationId);
                    capabilityConfigurations.CapabilityId = capabilityId ?? capabilityConfigurations.CapabilityId;
                    capabilityConfigurations.ConfigurationId = configurationId ?? capabilityConfigurations.ConfigurationId;
                    capabilityConfigurations.DeviceTypeId = device_TypeId ?? capabilityConfigurations.DeviceTypeId;
                    capabilityConfigurations.EquipmentId = equipmentId ?? capabilityConfigurations.EquipmentId;
                    context.Entry(capabilityConfigurations).State = EntityState.Modified;
                    context.SaveChanges();
                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                return OutMessage;
            }
            return null;
        }
        public object UpdateSection(int key, string values, int schema, int version, int? capability, int? deviceTypeId, int? equipment, int? configuration, int userId)
        {
            var section = new Section();
            var capConfgModel = new CapabilityConfigurationRevision();
            try
            {
                int newParentId = 0;
                using (var context = new TableContext())
                {
                    var edit = context.CapabilityConfigurations.Where(a => a.CapabilityId == capability && a.DeviceTypeId == deviceTypeId && a.EquipmentId == equipment && a.ConfigurationId == configuration).ToList();
                    var revisionId = context.CapabilityConfigurationRevisions.LastOrDefault(a => a.CapabilityConfigurationId == edit[0].ID);
                    var trac = revisionId.Tracking;
                    capConfgModel.Schema = revisionId.Schema;
                    capConfgModel.Major = revisionId.Major;
                    capConfgModel.Minor = revisionId.Minor;
                    capConfgModel.Tracking = ++trac;
                    capConfgModel.RevisionDate = DateTime.Now;
                    capConfgModel.CapabilityConfigurationId = edit[0].ID;
                    context.CapabilityConfigurationRevisions.Add(capConfgModel);
                    context.SaveChanges();
                    var newrevisionId = context.CapabilityConfigurationRevisions.LastOrDefault(a => a.CapabilityConfigurationId == edit[0].ID);

                    JsonConvert.PopulateObject(values, section);
                    section.CapabilityConfigurationRevisionId = newrevisionId.ID;

                    section.IsActive = 1;
                    List<Section> oldSection = new List<Section>();
                    List<Section> newSection = new List<Section>();
                    oldSection = (List<Section>)GetSections(revisionId.ID.Value);
                    foreach (var item in oldSection)
                    {
                        if (item.ParentId != 0 && item.ParentId != null)
                        {
                            newParentId = getParentId(oldSection, (int)item.ParentId, newrevisionId.ID.Value);
                        }
                        else
                        {
                            newParentId = 0;
                        }
                        if (item.Id != key)
                        {
                            context.Sections.Add(new Section { CapabilityConfigurationRevisionId = newrevisionId.ID, Item = item.Item, Value = item.Value, IsActive = 1, ParentId = newParentId, Type = item.Type });
                        }
                        else
                        {
                            context.Sections.Add(new Section { CapabilityConfigurationRevisionId = newrevisionId.ID, Item = section.Item ?? item.Item, Value = section.Value ?? item.Value, IsActive = 1, ParentId = newParentId, Type = section.Type ?? item.Type });
                        }
                        context.SaveChanges();
                    }
                    //context.Sections.Add(newSection);

                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                return OutMessage;
            }
            return section;
        }
        public object InsertConfigurationManagementNew(int? network, string deviceType, string device, string jsonEditor)
        {
            try
            {

                //sc
                var capConfgQModel = new ConfigurationManagementQ();
                using (var context = new TableContext())
                {
                    // capConfgQModel.DeviceTypeId = device;
                    capConfgQModel.Name = jsonEditor;
                    //capConfgQModel.RevisionId = Id;
                    capConfgQModel.Status = "Waiting";
                    context.ConfigurationManagementsQ.Add(capConfgQModel);
                    context.SaveChanges();
                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                return OutMessage;
            }
            return true;
        }
        public IQueryable<TypeModel> GetCapability()
        {
            IQueryable<TypeModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Capability")
                        .Exec(r => result = r.ToList<TypeModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }

        public IQueryable<TypeModel> GetFillSectionType()
        {
            IQueryable<TypeModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.SectionType")
                        .Exec(r => result = r.ToList<TypeModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }

        public IQueryable<TypeModel> GetDevice()
        {
            IQueryable<TypeModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Device")
                        .Exec(r => result = r.ToList<TypeModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }
        public IQueryable<Devices> GetDevicePublishList(string device)
        {
            IQueryable<Devices> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.DevicePublishList")
                        .AddParam("device", device)
                        .Exec(r => result = r.ToList<Devices>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }
        public IQueryable<DeviceTypeModel> GetDeviceType()
        {
            IQueryable<DeviceTypeModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.DeviceType")
                        .Exec(r => result = r.ToList<DeviceTypeModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }
        public IQueryable<TypeModel> GetEquipment()
        {
            IQueryable<TypeModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Equipment")
                        .Exec(r => result = r.ToList<TypeModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }
        public IQueryable<TypeModel> GetConfiguration()
        {
            IQueryable<TypeModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Configuration")
                        .Exec(r => result = r.ToList<TypeModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }
        public IQueryable<TypeModel> GetRevision()
        {
            IQueryable<TypeModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Revison")
                        .Exec(r => result = r.ToList<TypeModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }
        public string GetNetworkName(int networkId)
        {
            string network = "";
            try
            {
                using (var context = new TableContext())
                {
                    var networks = context.Network.First(a => a.ID == networkId);
                    network = networks.Name;

                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                return OutMessage;
            }
            return network;
        }
        public object GetCapabilityConfigurationRevisions(int capabilityConfigurationId)
        {
            var model = new CapabilityConfigurationRevision();
            try
            {
                using (var context = new TableContext())
                {
                    model = context.CapabilityConfigurationRevisions.Where(a => a.ID == capabilityConfigurationId).OrderByDescending(a => a.ID).FirstOrDefault();
                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                // return OutMessage;
            }
            return model;
        }
        public object GetSections(int capabilityConfigurationRevisionId)
        {
            var model = new List<Section>();
            try
            {
                using (var context = new TableContext())
                {
                    model = context.Sections.Where(a => a.CapabilityConfigurationRevisionId == capabilityConfigurationRevisionId && a.IsActive == 1).OrderBy(i => i.Id).ThenBy(i => i.ParentId).ToList();
                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
            }
            return model;
        }
        public object GetParentSections(int capabilityConfigurationRevisionId)
        {
            var model = new List<Section>();
            try
            {
                using (var context = new TableContext())
                {
                    model = context.Sections.Where(a => a.CapabilityConfigurationRevisionId == capabilityConfigurationRevisionId && a.IsActive == 1).OrderBy(i => i.Id).ThenBy(i => i.ParentId).ToList();
                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                // return OutMessage;
            }
            return model;
        }
        public int? GetParentSections(int capabilityConfigurationRevisionId, string item, string value)
        {
            try
            {
                using (var context = new TableContext())
                {
                    var model = context.Sections.First(a => a.CapabilityConfigurationRevisionId == capabilityConfigurationRevisionId && a.Item == item && a.Value == value && a.IsActive == 1);
                    return model.Id;
                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                return 0;
            }
        }
        public object GetConvertName(int id, int capabilityId, int deviceId, int equipmentId, int configurationId)
        {
            var model = new CapabilityConfModel();
            try
            {
                using (var context = new TableContext())
                {
                    var ıd = context.CapabilityConfigurationRevisions.First(a => a.ID == id);
                    model.ID = ıd.CapabilityConfigurationId;
                    var capability = capabilityId == 0 ? "" : context.Capabilitys.First(a => a.ID == capabilityId).Name;
                    model.Capability = capability;
                    var device = deviceId == 0 ? "" : context.Device.First(a => a.ID == deviceId).Name;
                    model.Device = device;
                    var equipment = equipmentId == 0 ? "" : context.Equipments.First(a => a.ID == equipmentId).Name;
                    model.Equipment = equipment;
                    var configuration = configurationId == 0 ? "" : context.Configurations.First(a => a.ID == configurationId).Name;
                    model.Configuration = configuration;
                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                return OutMessage;
            }
            return model;
        }


        public string GetConvertSectionTypeName(int id)
        {
            try
            {
                using (var context = new TableContext())
                {
                    var Id = context.SectionTypes.First(a => a.ID == id);

                    return Id.Name;
                }
            }
            catch (Exception e)
            {
                //OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                return "";
            }
        }
        public object GetConvertName(int id)
        {
            var model = new CapabilityConfModel();
            try
            {
                int capabilityId = 0;
                int deviceId = 0;
                int equipmentId = 0;
                int configurationId = 0;

                using (var context = new TableContext())
                {
                    var Id = context.CapabilityConfigurations.First(a => a.ID == id);
                    model.ID = Id.ID ?? 0;
                    capabilityId = Id.CapabilityId ?? 0;
                    deviceId = Id.DeviceTypeId ?? 0;
                    configurationId = Id.ConfigurationId ?? 0;
                    equipmentId = Id.EquipmentId ?? 0;

                    model.GuidId = Id.GuidId;

                    var capability = capabilityId == 0 ? "" : context.Capabilitys.First(a => a.ID == capabilityId).Name;
                    model.Capability = capability;
                    var device = deviceId == 0 ? "" : context.DeviceTypes.First(a => a.ID == deviceId).Name;
                    model.Device = device;
                    var equipment = equipmentId == 0 ? "" : context.Equipments.First(a => a.ID == equipmentId).Name;
                    model.Equipment = equipment;
                    var configuration = configurationId == 0 ? "" : context.Configurations.First(a => a.ID == configurationId).Name;
                    model.Configuration = configuration;
                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                return OutMessage;
            }
            return model;
        }
        public object DeleteSection(int id)
        {
            var section = new Section();
            try
            {
                using (var context = new TableContext())
                {
                    section = context.Sections.First(a => a.Id == id);
                    section.IsActive = 0;
                    context.Update(section);
                    context.SaveChanges();
                }
            }
            catch (Exception e)
            {
                OutMessage = !string.Equals(e.InnerException.Message, null) ? e.InnerException.Message : e.Message;
                return OutMessage;
            }
            return section;
        }
    }
    public class CapabilityConfigurationModel
    {
        public int? ID { get; set; }
        public int? CapabilityId { get; set; }
        public int? DeviceTypeId { get; set; }
        public int? EquipmentId { get; set; }
        public int? ConfigurationId { get; set; }
        //public int? Schema { get; set; }
        //public Int16? Major { get; set; }
        //public Int16? Minor { get; set; }
        //public Int16? Tracking { get; set; }
        //public string Item { get; set; }
        //public string Value { get; set; }
        public string Version { get; set; }
        public int CapabilityConfigurationId { get; set; }
        //public DateTime? RevisionDate { get; set; }
    }
    public class TypeModel
    {
        public int? ID { get; set; }
        public string Name { get; set; }
    }
    public class DeviceTypeModel
    {
        public int? ID { get; set; }
        public string Name { get; set; }
    }
    public class SectionModel
    {
        public int? Id { get; set; }
        public int? ParentId { get; set; }
        public string Item { get; set; }
        public string Value { get; set; }
        public string Type { get; set; }
        public int? CapabilityConfigurationRevisionId { get; set; }
    }
    public class ConfigurationModel
    {
        public int? ID { get; set; }
        public string Name { get; set; }
        public int? RevisionId { get; set; }
        public int? DeviceId { get; set; }
        public string RequestJson { get; set; }
        public string ResponseJson { get; set; }
        public string Status { get; set; }
    }
    public class CapabilityConfModel
    {
        public int? ID { get; set; }
        public string Capability { get; set; }
        public string Device { get; set; }
        public string Equipment { get; set; }
        public string Configuration { get; set; }
        public Guid GuidId { get; set; }


    }
}
