using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Asis.Ulasim.Models.Administrator;
using Asis.Ulasim.Models.Definitions.UserAuthorization;
using Microsoft.AspNetCore.Mvc;

namespace Asis.Ulasim.Controllers.Administrator
{
    public class AuthorizeController : BaseController
    {
        private readonly Authorize _authorize;
        //private readonly UserPlatesDef _userPlates;
        //private readonly UserInstitutionDef _userInstitution;
        //private readonly UserRouteDef _userRouteDef;
        //private readonly UserDealerDef _userDealer;

        public AuthorizeController()
        {
            _authorize = new Authorize();
            //_userPlates = new UserPlatesDef();
            //_userInstitution = new UserInstitutionDef();
            //_userRouteDef = new UserRouteDef();
            //_userDealer = new UserDealerDef();
        }

        public IActionResult Index()
        {
            try
            {
                CultureInfo ci = CultureInfo.CurrentCulture;
                string lang = ci.TwoLetterISOLanguageName.ToUpper();
                ViewBag.Roles = _authorize.FillRoles();
                ViewBag.MenuList = _authorize.GetMenuList(lang);
                return View();
            }
            catch (Exception e)
            {
                var error = e.Message;
                return null;
            }
        }

        public IActionResult IndexTnj()
        {
            try
            {
                CultureInfo ci = CultureInfo.CurrentCulture;
                string lang = ci.TwoLetterISOLanguageName.ToUpper();
                ViewBag.Roles = _authorize.FillRoles();
                ViewBag.MenuList = _authorize.GetMenuList(lang);
                return View();
            }
            catch (Exception e)
            {
                var error = e.Message;
                return null;
            }
        }

        #region User & Role
        [HttpGet]
        public JsonResult RoleStatus(int userId)
        {
            var result = _authorize.RoleStatus(userId);
            return Json(result);
        }
        [HttpGet]
        public JsonResult RoleNames()
        {
            var result = _authorize.FillRoles();
            return Json(result);
        }
        [HttpGet]
        public JsonResult RoleNamesParameter(int roleId)
        {
            var result = _authorize.FillRoles(roleId);
            return Json(result);
        }

        //[HttpGet]
        //public JsonResult RoleAuthorize(int userId)
        //{
        //    var res = "";
        //    var res2 = "";
        //    var res3 = "";
        //    var res4 = "";
        //    var result = _authorize.GetRoleAuthorize(userId);
        //    if (result.Count() > 0)
        //    {
        //        var userPlate = _userPlates.SelectUserPlates();
        //        if (userPlate != null && userPlate.Any())
        //            res = string.Join(",", userPlate.Select(s => s.Plates).ToList());
        //        var countDel = 0;
        //            var ok = 0;
        //            try
        //            {
        //                foreach (var plate in res.Split(","))
        //                {
        //                    _userPlates.InsertUserPlates(userId, plate, countDel, userId);
        //                    countDel = 1;
        //                    ok = 1;
        //                }
        //            }
        //            catch (Exception ex)
        //            {
        //                var error = ex.Message;
        //            }

        //        var userCorps = _userInstitution.SelectUserInstitution();
        //        if (userCorps != null && userCorps.Any())
        //            res2 = string.Join(",", userCorps.Select(s => s.InstitutionCode).ToList());
        //        var countDel2 = 0;
        //        var ok2 = 0;
        //        try
        //        {
        //            foreach (var corps in res2.Split(","))
        //            {
        //                _userInstitution.InsertUserInstitution(userId, corps, countDel2, userId);
        //                countDel2 = 1;
        //                ok2 = 1;
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            var error = ex.Message;
        //        }

        //        var userRoute = _userRouteDef.SelectUserLine();
        //        if (userRoute != null && userRoute.Any())
        //            res3 = string.Join(",", userRoute.Select(s => s.RouteCode).ToList());
        //        var countDel3 = 0;
        //        var ok3 = 0;
        //        try
        //        {
        //            foreach (var corps in res3.Split(","))
        //            {
        //                _userRouteDef.InsertUserRoute(userId, corps, countDel3, userId);
        //                countDel3 = 1;
        //                ok3 = 1;
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            var error = ex.Message;
        //        }

        //        var userDealer = _userDealer.SelectUserDeealer();
        //        if (userDealer != null && userDealer.Any())
        //            res4 = string.Join(",", userDealer.Select(s => s.DealerCode).ToList());
        //        var countDel4 = 0;
        //        var ok4 = 0;
        //        try
        //        {
        //            foreach (var corps in res4.Split(","))
        //            {
        //                _userDealer.InsertUserDealer(userId, corps, countDel4, userId);
        //                countDel4 = 1;
        //                ok4 = 1;
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            var error = ex.Message;
        //        }
        //    }
        //    return Json(0);
        //}

        [HttpPost]
        public JsonResult InsertUserRoleChange(string roleId, int userId)
        {
            var result = _authorize.InsertUserRoleChange(roleId, userId);
            return Json(_authorize.OutId);
        }
        [HttpPost]
        public JsonResult InsertNewRole(string roleName)
        {
            var result = _authorize.InsertNewRole(roleName);
            return Json(_authorize.OutId);
        }
        [HttpPost]
        public JsonResult EditRole(int roleId, string roleName)
        {
            var result = _authorize.EditRole(roleId, roleName);
            return Json(_authorize.OutId);
        }
        [HttpPost]
        public JsonResult DeleteRole(int roleId)
        {
            var result = _authorize.DeleteRole(roleId);
            return Json(_authorize.OutId);
        }
        #endregion

        #region Role & Menu
        [HttpGet]
        public JsonResult MenuRoleStatus(int roleId)
        {
            var result = _authorize.MenuRoleStatus(roleId);
            return Json(result);
        }
        [HttpPost]
        public JsonResult InsertRoleMenuChange(int roleId, string subMenuId)
        {
            var result = _authorize.InsertRoleMenuChange(roleId, subMenuId);
            return Json(_authorize.OutId);
        }
        #endregion
    }

}