using Asis.Ulasim.Context;
using Asis.Ulasim.Models.ConstAndEnum;
using Microsoft.AspNetCore.Mvc;
using StoredProcedureEFCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;


namespace Asis.Ulasim.Models.Fills
{
    public class UsersByAuth
    {

        public IQueryable<UsersByAuthModel> FillUsersByAuth(int userId = -1)
        {
            IQueryable<UsersByAuthModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.UsersByAuth")
                        .AddParam("userId", userId)
                        .Exec(r => result = r.ToList<UsersByAuthModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }
    }
    [ModelBinder]
    public class UsersByAuthModel
    {
        [Display(Name = "UserId")]
        public int UserId { get; set; }
        [Display(Name = "UserName")]
        public string UserName { get; set; }
    }
}
