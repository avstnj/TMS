using Asis.Ulasim.Context;
using Asis.Ulasim.Models.ConstAndEnum;
using StoredProcedureEFCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Asis.Ulasim.Models.Definitions.UserAuthorization
{
    public class UserRouteDef
    {
        public IQueryable<SelectUserLineModel> SelectUserLine(int userId = -1)
        {
            IQueryable<SelectUserLineModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("rpr.SelectRoutes")
                        .AddParam("userId", userId)
                        .AddParam("cityId", Const.CityId)
                        .Exec(r => result = r.ToList<SelectUserLineModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }
        public void InsertUserRoute(int userId, string routeCode,int countDel,int insUserId)
        {

            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.InsertUserRoutes")
                        .AddParam("userId", userId)
                        .AddParam("routes", routeCode)
                        .AddParam("cityId", Const.CityId)
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
        public IQueryable<GroupCorporateItemRoute> SelectUserRouteTown(int? userId)
        {
            IEnumerable<GroupCorporateItemRoute> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("rpr.SelectGroupRoutes")
                        .AddParam("userId", userId)
                        .Exec(r => result = r.ToList<RoutesCorporateModel>().Where(q => q.RouteCode != null).GroupBy(q => q.TownName)
                            .Select(q => new GroupCorporateItemRoute() { TownName = q.Key.ToString(), List = q.Select(s => s.RouteCode).ToList() }));
                    //.Exec(r => result = r.ToList<PlatesCorporateModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result.AsQueryable();
        }

    }
    //[ModelBinder]
    public class SelectUserLineModel
    {
        // [Display(Name = "line_cd")]
        public string RouteCode { get; set; }
        public string RouteName { get; set; }

    }

    public class RoutesCorporateModel
    {
        public string RouteCode { get; set; }
        public string TownName { get; set; }
        public int? TownId { get; set; }
    }
    public class GroupCorporateItemRoute
    {
        public string TownName { get; set; }
        public List<string> List { get; set; }
    }
}
