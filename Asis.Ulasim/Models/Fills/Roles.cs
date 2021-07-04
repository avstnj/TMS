using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Asis.Ulasim.Context;
using StoredProcedureEFCore;

namespace Asis.Ulasim.Models.Fills
{
    public class Roles
    {
        public string OutMessage = "";
        public int OutId = 0;

        public IQueryable<RoleModel> FillRoles(int roleId = 0)
        {
            IQueryable<RoleModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Roles")
                        .AddParam("roleId", roleId)
                        .Exec(r => result = r.ToList<RoleModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return result;
        }
    }
    public class RoleModel
    {
        public int Id { get; set; }
        public string RoleName { get; set; }
    }
}
