using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Asis.Ulasim.Context;
using Asis.Ulasim.Models.ConstAndEnum;
using StoredProcedureEFCore;

namespace Asis.Ulasim.Models.Definitions.UserAuthorization
{
    public class UserInstitutionDef
    {
        public IQueryable<SelectUserInstitutionModel> SelectUserInstitution(int userId = -1)
        {
            IQueryable<SelectUserInstitutionModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("rpr.SelectInstitutions")
                        .AddParam("userId", userId)
                        .Exec(r => result = r.ToList<SelectUserInstitutionModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }
        public void InsertUserInstitution(int userId, string institutions, int countDel, int insUserId)
        {

            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.InsertUserInstitutions")
                        .AddParam("userId", userId)
                        .AddParam("cityId", Const.CityId)
                        .AddParam("institutions", institutions)
                        .AddParam("countDel", countDel)
                        .AddParam("insUserId", insUserId)
                        .ExecNonQuery();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

        }
    }

    
    public class SelectUserInstitutionModel
    {
        public string InstitutionCode { get; set; }

    }
}
