using Asis.Ulasim.Context;
using StoredProcedureEFCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Asis.Ulasim.Models.Fills
{
    public class Network
    {
        public IQueryable<NetworkModel> FillNetwork()
        {
            IQueryable<NetworkModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Network")
                        .Exec(r => result = r.ToList<NetworkModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }
    }
    public class NetworkModel
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public int? MainNetworkId { get; set; }
    }
}
