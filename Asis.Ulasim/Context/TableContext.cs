
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Asis.Ulasim.Context
{
    public class TableContext : AsisContext
    {

       
        public DbSet<CapabilityConfiguration> CapabilityConfigurations { get; set; }
        public DbSet<Capability> Capabilitys { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<SectionType> SectionTypes { get; set; }
        public DbSet<Devices> Device { get; set; }
        public DbSet<Equipment> Equipments { get; set; }
        public DbSet<Configuration> Configurations { get; set; }
        public DbSet<CapabilityConfigurationRevision> CapabilityConfigurationRevisions { get; set; }
        public DbSet<Schemas> Schema { get; set; }
        public DbSet<ConfigurationManagementQ> ConfigurationManagementsQ { get; set; }
     //   public DbSet<FakeTable> FakeTables { get; set; }
        public DbSet<DeviceTypes> DeviceTypes { get; set; }
        public DbSet<Networks> Network { get; set; }
    }
    #region Tables

    [Table("Network")]
    public class Networks
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public int MainNetworkId { get; set; }
    }
    [Table("CapabilityConfiguration")]
    public class CapabilityConfiguration
    {
        [Key]
        public int? ID { get; set; }
        public int? CapabilityId { get; set; }
        public int? DeviceTypeId { get; set; }
        public int? EquipmentId { get; set; }
        public int? ConfigurationId { get; set; }
        public Guid GuidId { get; set; }
    }

    [Table("Capability")]
    public class Capability
    {
        [Key]
        public int? ID { get; set; }
        public string Name { get; set; }
    }

    [Table("Section")]
    public class Section
    {
        public int? Id { get; set; }
        public int? ParentId { get; set; }
        public string Item { get; set; }
        public string Value { get; set; }
        public string Type { get; set; }

        public int? CapabilityConfigurationRevisionId { get; set; }
        public Byte? IsActive { get; set; }
    }


    [Table("SectionType")]
    public class SectionType
    {
        [Key]
        public int ID { get; set; }
        public string Name { get; set; }
    }

    [Table("Equipment")]
    public class Equipment
    {
        [Key]
        public int? ID { get; set; }
        public string Name { get; set; }
    }

    [Table("Device")]
    public class Devices
    {
        [Key]
        public int? ID { get; set; }
        public Guid DeviceRefranceID { get; set; }
        public string Name { get; set; }
        public int? DeviceTypeId { get; set; }
        public int? NetworkId { get; set; }
    }

    [Table("Configuration")]
    public class Configuration
    {
        [Key]
        public int? ID { get; set; }
        public string Name { get; set; }
    }

    [Table("[Schemas]")]
    public class Schemas
    {
        [Key]
        public int? ID { get; set; }
        public int? ParentId { get; set; }
        public int? ParentTypeId { get; set; }
    }
    [Table("CapabilityConfigurationRevision")]
    public class CapabilityConfigurationRevision
    {
        [Key]
        public int? ID { get; set; }
        public int? CapabilityConfigurationId { get; set; }
        public int? Schema { get; set; }
        public Int16? Major { get; set; }
        public Int16? Minor { get; set; }
        public Int16? Tracking { get; set; }
        public DateTime? RevisionDate { get; set; }
    }
    [Table("ConfigurationManagementQ")]
    public class ConfigurationManagementQ
    {
        [Key]
        public int? ID { get; set; }
        public string Name { get; set; }
        public int? RevisionId { get; set; }
        public int? DeviceTypeId { get; set; }
        public string RequestJson { get; set; }
        public string ResponseJson { get; set; }
        public string Status { get; set; }
    }
    //[Table("FakeTable")]
    //public class FakeTable
    //{
    //    [Key]
    //    public string BusLine { get; set; }
    //    public string BusStation { get; set; }
    //    public string VehicleId { get; set; }
    //    public string PAN { get; set; }
    //    public DateTime? CreateDate { get; set; }
    //}

    [Table("DeviceType")]
    public class DeviceTypes
    {
        [Key]
        public int? ID { get; set; }
        public string Name { get; set; }
    }
    #endregion



}





