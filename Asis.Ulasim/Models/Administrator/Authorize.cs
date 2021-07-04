using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Asis.Ulasim.Context;
using DevExpress.XtraRichEdit.Model;
using StoredProcedureEFCore;

namespace Asis.Ulasim.Models.Administrator
{
    public class Authorize
    {
        public string OutMessage = "";
        public int OutId = 0;

        #region User & Role

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
                OutId = 1;
                OutMessage = e.Message;
            }

            return result;
        }
        public IQueryable<RoleStatusModel> RoleStatus(int userId)
        {
            IQueryable<RoleStatusModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.RoleStatus")
                        .AddParam("userId", userId)
                        .Exec(r => result = r.ToList<RoleStatusModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                OutMessage = e.Message;
            }

            return result;
        }
        public IQueryable<RoleStatusModel> GetRoleAuthorize(int userId)
        {
            IQueryable<RoleStatusModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.RolesAuthorize")
                        .AddParam("userId", userId)
                        .Exec(r => result = r.ToList<RoleStatusModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                OutMessage = e.Message;
            }
            return result;
        }
        public async Task InsertUserRoleChange(string roleId, int userId)
        {
            try
            {
                using (var context = new AsisContext())
                {
                    await context.LoadStoredProc("def.DmlAuthorizeRole")
                        .AddParam("dml", "USER_ROLE_CHANGE")
                        .AddParam("roleId", roleId)
                        .AddParam("userId", userId)
                        .ExecNonQueryAsync();
                    OutId = 0;
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                OutMessage = e.Message;
            }


        }
        public async Task InsertNewRole(string roleName)
        {
            try
            {
                using (var context = new AsisContext())
                {
                    await context.LoadStoredProc("def.DmlAuthorizeRole")
                        .AddParam("dml", "NEW_ROLE")
                        .AddParam("roleName", roleName)
                        .ExecNonQueryAsync();
                    OutId = 0;
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                OutMessage = e.Message;
            }
        }
        public async Task EditRole(int roleId, string roleName)
        {
            try
            {
                using (var context = new AsisContext())
                {
                    await context.LoadStoredProc("def.DmlAuthorizeRole")
                        .AddParam("dml", "EDIT_ROLE")
                        .AddParam("roleId", roleId)
                        .AddParam("roleName", roleName)
                        .ExecNonQueryAsync();
                    OutId = 0;
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                OutMessage = e.Message;
            }
        }
        public async Task DeleteRole(int roleId)
        {
            try
            {
                using (var context = new AsisContext())
                {
                    await context.LoadStoredProc("def.DmlAuthorizeRole")
                        .AddParam("dml", "DELETE_ROLE")
                        .AddParam("roleId", roleId)
                        .ExecNonQueryAsync();
                    OutId = 0;
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                OutMessage = e.Message;
            }
        }

        #endregion

        #region Role & Menu

        public IQueryable<MenuListModel> GetMenuList(string lang)
        {
            IQueryable<MenuListModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("rpr.MenuList")
                        .AddParam("Lang", "EN")
                        .Exec(r => result = r.ToList<MenuListModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                OutMessage = e.Message;
            }

            return result;
        }
        public IQueryable<MenuRoleStatusModel> MenuRoleStatus(int roleId)
        {
            IQueryable<MenuRoleStatusModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.MenuRoleStatus")
                        .AddParam("roleId", roleId)
                        .Exec(r => result = r.ToList<MenuRoleStatusModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                OutMessage = e.Message;
            }

            return result;
        }

        public async Task InsertRoleMenuChange(int roleId, string subMenuId)
        {
            try
            {
                using (var context = new AsisContext())
                {
                    await context.LoadStoredProc("def.DmlAuthorizeMenu")
                        .AddParam("dml", "ROLE_MENU_CHANGE")
                        .AddParam("roleId", roleId)
                        .AddParam("subMenuId", subMenuId)
                        .ExecNonQueryAsync();
                    OutId = 0;
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                OutMessage = e.Message;
            }


        }

        #endregion


    }

    public class RoleModel
    {
        public int Id { get; set; }
        public string RoleName { get; set; }
    }

    public class RoleStatusModel
    {
        public int RoleId { get; set; }
        public int UserId { get; set; }
        public string CheckStatus { get; set; }
    }
    public class MenuListModel
    {
        public int? MainMenuId { get; set; }
        public int? SubMenuRecId { get; set; }
        public int? SubMenuId { get; set; }
        public string MainMenuName { get; set; }
        public string SubMenuName { get; set; }
        public string SubMenuUrl { get; set; }
        public string Category { get; set; }
    }
    public class MenuRoleStatusModel
    {
        public int Id { get; set; }
        public int RoleId { get; set; }
        public int SubMenuId { get; set; }
    }
}
