using Asis.Ulasim.Context;
using Asis.Ulasim.Models.Helpers;
using Microsoft.AspNetCore.Http;
using StoredProcedureEFCore;
using System;
using System.Collections.Generic;
using System.Linq;


namespace Asis.Ulasim.Models.Menu
{
    public class GetMenu
    {
        public List<RoleMenu> GetRoleUsers(int? userId = 0)
        {
            List<RoleMenu> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.UserRoles")
                        //.AddParam("roleId", 0)
                        .AddParam("userId", userId)
                        .Exec(r => result = r.ToList<RoleMenu>());
                }

                
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            
            return result;
        }

        public List<RoleMenu> GetRoleMenus(int? userId = 0, int subMenuId = 0, string lang = "")
        {
            List<RoleMenu> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.RoleMenu")
                        .AddParam("userId", userId)
                        .AddParam("subMenuId", subMenuId)
                        .AddParam("lang", lang)
                        .Exec(r => result = r.ToList<RoleMenu>());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }

        public List<RoleMenu> GetMenus(int? userId)
        {
            var mAllRoleMenus = new List<RoleMenu>();
            try
            {
                var mUserRoles = GetRoleUsers( userId).ToList();
                if (mUserRoles.Count > 0)
                {
                    foreach (var userRole in mUserRoles)
                    {
                        var mRoleMenus = GetRoleMenus(userId, 0);
                        if (mRoleMenus != null && mRoleMenus.Count > 0)
                        {
                            foreach (var roleMenu in mRoleMenus)
                            {
                                if (mAllRoleMenus.All(a => a.SubMenuId != roleMenu.SubMenuId))
                                {
                                    mAllRoleMenus.Add(roleMenu);
                                }
                            }
                        }
                    }
                }

                return mAllRoleMenus;
            }
            catch
            {
                return null;
            }

        }

    }
}
