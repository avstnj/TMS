using System.Collections.Generic;
using System.Net;
using System.Xml;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Data;
using System.Linq;
using DevExpress.Data.Linq.Helpers;
using System;
using System.Web;
using DevExpress.DashboardCommon.Native;
using DevExpress.DataProcessing;
using Asis.Ulasim.Helper;
using DevExpress.Data.Svg;
using DevExpress.PivotGrid.Criteria;
using System.Threading;
using System.Globalization;
using Microsoft.AspNetCore.Http.Extensions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Localization;
using Microsoft.AspNetCore.Localization;
using Asis.Ulasim.Models.Helpers;
using Asis.Ulasim.Models.Common;
using Microsoft.Extensions.Logging;
using Asis.Ulasim.Models;
using DevExtreme.AspNet.Mvc;
using DevExtreme.AspNet.Data;
using Asis.Ulasim.Models.Administrator;
using Asis.Ulasim.Models.Definitions.UserAuthorization;

namespace Asis.Ulasim.Controllers
{
    public class HomeController : BaseController
    {
       // private readonly Dashboards _dashboard;
        private readonly IStringLocalizer<HomeController> _localizer;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly Authorize _authorize;
    

        public HomeController(IStringLocalizer<HomeController> localizer, IHttpContextAccessor httpContextAccessor)
        {
            //_dashboard = new Dashboards();
            _localizer = localizer;
            _httpContextAccessor = httpContextAccessor;
            //_authorize = new Authorize();
            //_userPlates = new UserPlatesDef();
            //_userInstitution = new UserInstitutionDef();
            //_userRouteDef = new UserRouteDef();
            //_userDealer = new UserDealerDef();
        }
        public IActionResult Index()
        {
            //LogController log = new LogController();
            //log.SetLog(Startup.CityId, ReMember().UserId, 2, "Giriş Başarılı");
            ViewBag.CityId = Startup.CityId;
            var userId = Convert.ToInt32(HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId").Value);
           // var roles = _dashboard.GetRoles(userId).ToList();
       //     ViewBag.Roles = roles[0].RoleId;
            return View();
        }
        public IActionResult IndexTnj()
        {
            return View();
        }
        public IActionResult IndexRes()
        {
            return View();
        }
        //public IActionResult Dashboard()
        //{
        //    ValueHelper helper = new ValueHelper();
        //    DashboardData model = new DashboardData()
        //    {
        //        DashboardModel = _dashboard.GetDashboard("D"),
        //        UserInfo = _dashboard.GetUserItem(Convert.ToInt32(HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId").Value))
        //    };
        //    /******************************/
        //    List<CustomKeyValuePair> myList = new List<CustomKeyValuePair>();
        //    foreach (var item in _dashboard.GetDashboard("D").Where(item => model.UserInfo.Item2.Select(a => a.itemName == item.code).Any()))
        //    {
        //        myList.Add(new CustomKeyValuePair()
        //        {
        //            Key = helper.NameList.Where(a => a.Key == item.code).Single() != null ?
        //                helper.NameList.Where(a => a.Key == item.code).Single().Value : "",
        //            Value = item.value.ToString()
        //        });
        //    }
        //    return View(myList);
        //}
        //public JsonResult DashboardTimer(string queryBy)
        //{
        //    DashboardData model = new DashboardData()
        //    {
        //        DashboardModel = _dashboard.GetDashboard("D"),
        //        UserInfo = _dashboard.GetUserItem(Convert.ToInt32(HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId").Value))
        //    };
        //    try
        //    {
        //        var startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 0, 0, 0);
        //        var endDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 23, 59, 59);
        //        var maski = _dashboard.GetMaskiInformation(startDate, endDate);
        //        List<CustomKeyValuePair> myList = new List<CustomKeyValuePair>();
        //        foreach (var item in _dashboard.GetDashboard("D").Where(item => model.UserInfo.Item2.Select(a => a.itemName == item.code).Any()))
        //        {
        //            myList.Add(new CustomKeyValuePair()
        //            {
        //                Key = item.code,
        //                Value = item.value.ToString()
        //            });
        //        }
        //        myList.Add(new CustomKeyValuePair()
        //        {
        //            Key = "MaskiCount",
        //            Value = Convert.ToInt32(maski.ToList()[0].Adet).ToString()
        //        });
        //        myList.Add(new CustomKeyValuePair()
        //        {
        //            Key = "MaskiAmount",
        //            Value = Convert.ToDecimal(maski.ToList()[0].Tutar).ToString()
        //        });
        //        return Json(myList);
        //    }
        //    catch (Exception ex)
        //    {

        //        LogController log = new LogController();
        //        log.SetLog(Startup.CityId, ReMember().UserId, 2, ex.Message);
        //        return Json(ex.Message);
        //    }
        //}
        public ActionResult SetCulture(string culture)
        {
            var bm = new BaseModel();
            CultureInfo.CurrentCulture = new CultureInfo(culture, false);
            Response.Cookies.Append(
                CookieRequestCultureProvider.DefaultCookieName,
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
                new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
            );
            Thread.CurrentThread.CurrentCulture = CultureInfo.GetCultureInfo(culture);
            Thread.CurrentThread.CurrentUICulture = CultureInfo.GetCultureInfo(culture);
            return RedirectToAction("Index", new { culture = culture });
        }
    }
}