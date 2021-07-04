using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Asis.Ulasim.Models.Account;
using Asis.Ulasim.Models.Helpers;
using Asis.Ulasim.Models.Menu;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json;

namespace Asis.Ulasim.Controllers
{
    public abstract class BaseController : Controller
    {
        public enum ToastType
        {
            error,
            info,
            success,
            warning
        }

        private List<ApplicationUser> _applicationUser;
       // private List<RoleMenu> mRoleMenus = new List<RoleMenu>();

        protected BaseController()
        {
            _applicationUser = new List<ApplicationUser>();
        }

        public ApplicationUser UserInfo { get; set; }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
           
            //if (filterContext.HttpContext.Session.GetObject<ApplicationUser>("UserInfo") == null)
            if (filterContext.HttpContext.User.Identity.Name == null)
                filterContext.Result =
                    new RedirectToRouteResult(new RouteValueDictionary
                    {
                        {"controller", "Account"},
                        {"action", "Index"}
                    });

        #if (RELEASE)
            {
                  RoleMenu _roleMenu = new RoleMenu();
                 _roleMenu.RoleMenus = filterContext.HttpContext.Session.GetObject<List<RoleMenu>>("RoleMenuler"); 
                var pathControl = ((object[])filterContext.RouteData.Values.Values)[0];//HttpContext.Request.Path.Value;
                if (pathControl.ToString() != "Home"  && pathControl.ToString() != "UserSettings" && pathControl.ToString() != "Alarms" && pathControl.ToString() != "Authorize" && pathControl.ToString() != "DashTotalRevenueDay")
                {
                    bool roleMenu = _roleMenu.RoleMenus.Any(f => f.SubMenuUrl.Split('/')[0] == pathControl.ToString());
                    if (!roleMenu)
                    {
                        filterContext.Result =
                            new RedirectToRouteResult(new RouteValueDictionary
                            {
                                {"controller", "HttpError"},
                                {"action", "HttpError401"}
                            });
                    }
                }
            }
        #endif
            base.OnActionExecuting(filterContext);
        }

        public ApplicationUser ReMember()
        {
            if (HttpContext.User.Identity.Name != null)
            {
                UserInfo = (from u in HttpContext.User.Claims
                    select new ApplicationUser
                    {
                        UserId = Convert.ToInt32(HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId").Value),
                        UserName = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserName").Value,
                        FirstName = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "FirstName").Value,
                        LastName = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "LastName").Value,
                        UserEmail = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserEmail").Value,
                        IdentityNumber = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "IdentityNumber").Value,
                        UserMobile = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserMobile").Value,
                        UserPhoto = Encoding.ASCII.GetBytes(HttpContext.User.Claims
                            .FirstOrDefault(c => c.Type == "UserPhoto").Value)
                    }).FirstOrDefault();
                 
                return UserInfo;
            }


            return null;
        }

        public string ToastAlert(Enum type, string message, string title)
        {
            return @"toastr['" + type + "']('" + message + "', '" + title + "!')";
        }
    }
}