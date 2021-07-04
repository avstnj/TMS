using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Asis.Ulasim.Context;
using Asis.Ulasim.Models.ConstAndEnum;
using StoredProcedureEFCore;

namespace Asis.Ulasim.Models.Definitions.UserAuthorization
{
    public class UserDealerDef
    {
        public IQueryable<SelectUserDealerModel> SelectUserDeealer(int userId=-1)
        {
            IQueryable<SelectUserDealerModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("rpr.SelectDealers")
                        .AddParam("userId", userId)
                       // .AddParam("cityId", Const.CityId)
                        .Exec(r => result = r.ToList<SelectUserDealerModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }

        public void InsertUserDealer(int userId, string dealers, int countDel, int insUserId)
        {

            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.InsertUserDealers")
                        .AddParam("userId", userId)
                        .AddParam("cityId", Const.CityId)
                        .AddParam("dealers", dealers)
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

    //[ModelBinder]
    public class SelectUserDealerModel
    {
        // [Display(Name = "line_cd")]
        public string DealerCode { get; set; }

    }
}
