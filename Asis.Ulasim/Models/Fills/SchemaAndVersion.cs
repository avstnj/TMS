using Asis.Ulasim.Context;
using StoredProcedureEFCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Asis.Ulasim.Models.Fills
{
    public class SchemaAndVersion
    {
        public object GetSchemaAndVersion(int Id)
        {
            List<CapabilityConfigurationRevision> schemas = new List<CapabilityConfigurationRevision>();
            try
            {
                using (var context = new TableContext())
                {
                    //var capConfId = context.CapabilityConfigurations.Where(a =>
                    //     a.CapabilityId == capability && a.DeviceTypeId == deviceTypeId && a.EquipmentId == equipment &&
                    //     a.ConfigurationId == configuration).ToList();
                    //    schemas = context.CapabilityConfigurationRevisions.Where(a => a.CapabilityConfigurationId == capConfId[0].ID).OrderByDescending(a=>a.ID).ToList();
                    schemas = context.CapabilityConfigurationRevisions.Where(a => a.CapabilityConfigurationId == Id).OrderByDescending(a => a.ID).ToList();
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return schemas;
        }
        public object GetVersion(int schemaId, int tracking, int configuration)
        {
            List<CapabilityConfigurationRevision> schemas = new List<CapabilityConfigurationRevision>();
            List<Section> sections = new List<Section>();
            try
            {
                using (var context = new TableContext())
                {
                    schemas = context.CapabilityConfigurationRevisions.Where(a => a.Tracking == tracking && a.Schema == schemaId && a.CapabilityConfigurationId == configuration).ToList();
                    sections = context.Sections.Where(a => a.CapabilityConfigurationRevisionId == schemas[0].ID && a.IsActive == 1).Select(x => new Section
                    {
                        CapabilityConfigurationRevisionId = x.CapabilityConfigurationRevisionId,
                        Id = x.Id,
                        IsActive = x.IsActive,
                        Item = x.Item,
                        ParentId = x.ParentId == null ? 0 : x.ParentId,
                        Type = x.Type,
                        Value = x.Value
                    }).ToList();
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return sections;
        }
        public IQueryable<SchemaModel> GetSchema(int? schema = -1)
        {
            IQueryable<SchemaModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Schema")
                        .AddParam("schema", schema)
                        .Exec(r => result = r.ToList<SchemaModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return result;
        }
    }
    public class SchemaModel
    {
        public int? ID { get; set; }
        public int? ParentId { get; set; }
        public int? ParentType { get; set; }
        public int? Schema { get; set; }
        public string Version { get; set; }
    }
}
