using Asis.Ulasim.Context;
using StoredProcedureEFCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Asis.Ulasim.Models.Fills
{
    public class Device
    {
        public IQueryable<DeviceTypeModel> FillDeviceType()
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
                Console.WriteLine(e);
            }
            return result;
        }
        public IQueryable<DeviceModel> FillDevice()
        {
            IQueryable<DeviceModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Device")
                        .Exec(r => result = r.ToList<DeviceModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }
    }
    public class DeviceTypeModel
    {
        public int ID { get; set; }
        public string Name { get; set; }
    }
    public class DeviceModel
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public int? DeviceTypeId { get; set; }
        public int? NetworkId { get; set; }
    }
    
}
