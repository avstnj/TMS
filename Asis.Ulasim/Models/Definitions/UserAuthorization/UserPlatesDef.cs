using Asis.Ulasim.Context;
using Asis.Ulasim.Models.ConstAndEnum;
using StoredProcedureEFCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Asis.Ulasim.Models.Fills;

namespace Asis.Ulasim.Models.Definitions.UserAuthorization
{
    public class UserPlatesDef
    {
        public IQueryable<PlatesModel> SelectUserPlates(int? userId = -1)
        {
            IQueryable<PlatesModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("rpr.SelectPlates")
                        .AddParam("userId", userId)
                        .Exec(r => result = r.ToList<PlatesModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }
        public IQueryable<PlatesModel> SelectUserPlate(int? userId = 0)
        {
            IQueryable<PlatesModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("rpr.SelectPlates")
                        .AddParam("userId", userId)
                        .Exec(r => result = r.ToList<PlatesModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }
        public IQueryable<GroupCorporateItem> SelectUserPlateCorporate()
        {
            IEnumerable<GroupCorporateItem> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("rpr.SelectGroupPlates")
                        .AddParam("userId", -1)
                        .AddParam("cityId", Const.CityId)
                    .Exec(r => result = r.ToList<PlatesCorporateModel>().Where(q => q.plate != null && q.corporateCode != null).GroupBy(q => q.corporateCode)
                            .Select(q => new GroupCorporateItem() { CorporateCode = q.Key.ToString(), DataList = q.Select(s => s.plate).ToList()}));
                    //.Exec(r => result = r.ToList<PlatesCorporateModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result.AsQueryable();
        }
        public void InsertUserPlates(int userId, string plates, int countDel, int insUserId)
        {

            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.InsertUserPlates")
                        .AddParam("userId", userId)
                        .AddParam("cityId", Const.CityId)
                        .AddParam("plates", plates)
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

    public class PlatesModel
    {
        public string Plates { get; set; }
    }

    public class PlatesCorporateModel
    {
        public int? userCode { get; set; }
        public string plate { get; set; }
        public int? city { get; set; }
        //public DateTime? insertDate { get; set; }
        public int? valNo { get; set; }
        public string corporateCode { get; set; }
    }
    public class GroupCorporateItem
    {
        public string CorporateCode { get; set; }
        public List<string> DataList { get; set; }
    }
}
