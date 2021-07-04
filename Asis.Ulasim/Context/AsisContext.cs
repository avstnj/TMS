using ACWSED;
using Asis.Ulasim.Models.ConstAndEnum;
using Asis.Ulasim.Models.Menu;
using Microsoft.EntityFrameworkCore;

namespace Asis.Ulasim.Context
{
    public class AsisContext : DbContext
    {
        private static string _connectionString;

        public AsisContext(CityCode _cityCode = (CityCode)0)
        {
            switch (_cityCode)
            {
                /*case CityCode.AA:
                    _connectionString = AESEncryption.DecryptString(Startup.ConnectionAuthString);
                    break;*/
                case 0:
                    _connectionString = AESEncryption.DecryptString(Startup.ConnectionDefaultString);
                    break;
                case CityCode.Maski:
                    _connectionString = AESEncryption.DecryptString(Startup.MaskiConnection);
                    break;
                case CityCode.AA:
                    _connectionString = AESEncryption.DecryptString(Startup.AAConnection);
                    break;
            }

        }


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(_connectionString); //, sqlServerOptions => sqlServerOptions.CommandTimeout(120)); //CommandTimeOut Sonradan eklendi. default 30 sn
            base.OnConfiguring(optionsBuilder);
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CapabilityConfiguration>().ToTable("CapabilityConfiguration", "def");
            modelBuilder.Entity<CapabilityConfiguration>().HasKey(p => new { p.ID });
            modelBuilder.Entity<CapabilityConfiguration>().Property(p => p.ID).UseSqlServerIdentityColumn();

            modelBuilder.Entity<Capability>().ToTable("Capability", "def");
            modelBuilder.Entity<Capability>().HasKey(p => new { p.ID });
            modelBuilder.Entity<Capability>().Property(p => p.ID).UseSqlServerIdentityColumn();

            modelBuilder.Entity<Section>().ToTable("Section", "def");
            modelBuilder.Entity<Section>().HasKey(p => new { p.Id });
            modelBuilder.Entity<Section>().Property(p => p.Id).UseSqlServerIdentityColumn();


            modelBuilder.Entity<SectionType>().ToTable("SectionType", "def");
            modelBuilder.Entity<SectionType>().HasKey(p => new { p.ID });
            modelBuilder.Entity<SectionType>().Property(p => p.ID).UseSqlServerIdentityColumn();

            modelBuilder.Entity<Equipment>().ToTable("Equipment", "def");
            modelBuilder.Entity<Equipment>().HasKey(p => new { p.ID });
            modelBuilder.Entity<Equipment>().Property(p => p.ID).UseSqlServerIdentityColumn();

            modelBuilder.Entity<Devices>().ToTable("Device", "def");
            modelBuilder.Entity<Devices>().HasKey(p => new { p.ID });
            modelBuilder.Entity<Devices>().Property(p => p.ID).UseSqlServerIdentityColumn();

            modelBuilder.Entity<DeviceTypes>().ToTable("DeviceType", "def");
            modelBuilder.Entity<DeviceTypes>().HasKey(p => new { p.ID });
            modelBuilder.Entity<DeviceTypes>().Property(p => p.ID).UseSqlServerIdentityColumn();


            modelBuilder.Entity<Networks>().ToTable("Network", "def");
            modelBuilder.Entity<Networks>().HasKey(p => new { p.ID });
            modelBuilder.Entity<Networks>().Property(p => p.ID).UseSqlServerIdentityColumn();

            modelBuilder.Entity<Configuration>().ToTable("Configuration", "def");
            modelBuilder.Entity<Configuration>().HasKey(p => new { p.ID });
            modelBuilder.Entity<Configuration>().Property(p => p.ID).UseSqlServerIdentityColumn();

            modelBuilder.Entity<Schemas>().ToTable("Schemas", "def");
            modelBuilder.Entity<Schemas>().HasKey(p => new { p.ID });
            modelBuilder.Entity<Schemas>().Property(p => p.ID).UseSqlServerIdentityColumn();

            modelBuilder.Entity<CapabilityConfigurationRevision>().ToTable("CapabilityConfigurationRevision", "def");
            modelBuilder.Entity<CapabilityConfigurationRevision>().HasKey(p => new { p.ID });
            modelBuilder.Entity<CapabilityConfigurationRevision>().Property(p => p.ID).UseSqlServerIdentityColumn();

            modelBuilder.Entity<ConfigurationManagementQ>().ToTable("ConfigurationManagementQ", "def");
            modelBuilder.Entity<ConfigurationManagementQ>().HasKey(p => new { p.ID });
            modelBuilder.Entity<ConfigurationManagementQ>().Property(p => p.ID).UseSqlServerIdentityColumn();
        }
        public DbSet<MainMenu> MainMenu { get; set; }

        public DbSet<SubMenu> SubMenu { get; set; }

    }

}
