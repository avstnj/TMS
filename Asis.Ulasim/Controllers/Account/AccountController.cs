using Asis.Ulasim.Context;
using Asis.Ulasim.Models.Account;
using Asis.Ulasim.Models.Helpers;
using Asis.Ulasim.Models.Menu;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using StoredProcedureEFCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using USHDLL;
using System.Net.Http;
using IdentityModel.Client;

namespace Asis.Ulasim.Controllers.Account
{
    public class AccountController : Controller
    {
        private readonly Models.Account.Account _account;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly Models.Menu.GetMenu _getMenu;
        private readonly IStringLocalizer<HomeController> _localizer;
        public string OutMessage = "";

        public AccountController(IHostingEnvironment hostingEnvironment, IStringLocalizer<HomeController> localizer)
        {
            _account = new Models.Account.Account();
            _getMenu = new GetMenu();
            _localizer = localizer;
            _hostingEnvironment = hostingEnvironment;
        }

        public void ForgetPassword(string fullname, string email)
        {
            if (_account.ForgetPasswordControl(email, fullname))
            {
                var city = Startup.CityId;
                var randomPassword = GenerateRandomPassword();
                if (ModelState.IsValid)
                {
                    var Body = "";
                    var path = Path.Combine(_hostingEnvironment.WebRootPath + "\\Templates", "Email" + city + ".txt");
                    var mail = new MailMessage();
                    mail.To.Add(email);
                    mail.From = new MailAddress("bilet@asiselektronik.com.tr");
                    mail.Subject = "User Password e-Mail";

                    using (var sr = new StreamReader(path))
                    {
                        Body = sr.ReadToEnd();
                        Body = Body.Replace("{UserName}", fullname);
                        Body = Body.Replace("{Password}", randomPassword);
                    }

                    //string Body = _objModelMail.Body;
                    mail.Body = Body;
                    mail.IsBodyHtml = true;
                    var smtp = new SmtpClient();
                    smtp.Host = "mail.asiselektronik.com.tr";
                    smtp.Port = 587;
                    smtp.UseDefaultCredentials = false;
                    smtp.Credentials = new NetworkCredential("bilet@asiselektronik.com.tr", "bilet2435");
                    smtp.EnableSsl = true;
                    smtp.Send(mail);

                    _account.ForgetPassword(randomPassword, email, fullname);
                }
            }
            else
            {
                throw new Exception("Kullanıcı Adı ile Mail Adresi Uyuşmamaktadır..!");
            }
        }

        public static string GenerateRandomPassword(PasswordOptions opts = null)
        {
            if (opts == null)
                opts = new PasswordOptions
                {
                    RequiredLength = 8,
                    RequiredUniqueChars = 4,
                    RequireDigit = true,
                    RequireLowercase = true,
                    RequireNonAlphanumeric = true,
                    RequireUppercase = true
                };

            string[] randomChars =
            {
                "ABCDEFGHJKLMNOPQRSTUVWXYZ", // uppercase 
                "abcdefghijkmnopqrstuvwxyz", // lowercase
                "0123456789", // digits
                "!@$?_-" // non-alphanumeric
            };

            var rand = new Random(Environment.TickCount);
            var chars = new List<char>();

            if (opts.RequireUppercase)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[0][rand.Next(0, randomChars[0].Length)]);

            if (opts.RequireLowercase)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[1][rand.Next(0, randomChars[1].Length)]);

            if (opts.RequireDigit)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[2][rand.Next(0, randomChars[2].Length)]);

            if (opts.RequireNonAlphanumeric)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[3][rand.Next(0, randomChars[3].Length)]);

            for (var i = chars.Count;
                i < opts.RequiredLength
                || chars.Distinct().Count() < opts.RequiredUniqueChars;
                i++)
            {
                var rcs = randomChars[rand.Next(0, randomChars.Length)];
                chars.Insert(rand.Next(0, chars.Count),
                    rcs[rand.Next(0, rcs.Length)]);
            }

            return new string(chars.ToArray());
        }


        #region " Login / Logout / Access Denied "

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult IndexTnj()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        [ValidateAntiForgeryToken]

        #region Eski Login
        /* public IActionResult Index(LoginViewModel model)
         {
             List<ApplicationUser> user = new List<ApplicationUser>();
             if (!ModelState.IsValid)
                 return View(model);

             using (var context = new AsisContext(CityCode.AA))
             {
                 var passWord = Crypto.Ush(model.Password);

                 context.LoadStoredProc("dbo.WebAuthentication")
                                     .AddParam("UserName", model.UserName)
                                     .AddParam("UserPassword", passWord)
                                     .Exec(r => user = r.ToList<ApplicationUser>());



                 if (user != null && user != null & user.Count > 0)
                 {
                    
                     //  _applicationUser.UserInfo.Add(user.FirstOrDefault());


                     //HttpContext.Session.SetObjectAsJson("UserInfo", user[0]);
                     //HttpContext.Session.SetObjectAsJson("RoleMenu", GetMenu.GetMenus(user[0].UserId).ToList());

                     var _applicationUser = (from u in user
                         select new ApplicationUser
                         {
                             UserId = u.UserId,
                             UserName = u.UserName,
                             FirstName = u.FirstName,
                             LastName = u.LastName,
                             IdentityNumber = u.IdentityNumber,
                             UserMobile = u.UserMobile,
                             UserPhoto = u.UserPhoto,
                             RoleId = u.RoleId
                         }).FirstOrDefault();

                     HttpContext.Session.SetObject("UserInfo", _applicationUser);

                     RoleMenu.RoleMenus = GetMenu.GetMenus(user[0].UserId).ToList();
                     return RedirectToAction("Index", "Home");
                 }
                 else
                 {
                     ModelState.AddModelError(string.Empty, "Giriş Başarısız. Kullanıcı Adınızı veya Şifrenizi Kontrol Ediniz..!");
                     return View(model);
                 }
             }

         }*/


        #endregion

        public async Task<IActionResult> Index(LoginViewModel model)
        {
            var controllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
            var actionName = this.ControllerContext.RouteData.Values["action"].ToString();
            var user = new List<ApplicationUser>();
            if (!ModelState.IsValid)
            {
                ModelState.AddModelError(string.Empty,
                    "Giriş Başarısız. Kullanıcı Adınızı veya Şifrenizi Kontrol Ediniz..!");
                return View(model);
            }

            try
            {
                using (var context = new AsisContext())
                {
                    var passWord = Crypto.Ush(model.Password);
                    await context.LoadStoredProc("fill.Authentication")
                        .AddParam("UserName", model.UserName)
                        .AddParam("UserPassword", passWord)
                        .ExecAsync(async r => user = await r.ToListAsync<ApplicationUser>());
                    OutMessage = "Giriş Başarılı";
                    if (user != null && (user != null) & (user.Count > 0))
                    {
                        var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Name, model.UserName),
                        new Claim("UserId", user.FirstOrDefault().UserId.ToString()),
                        new Claim("UserName", user.FirstOrDefault().UserName),
                        new Claim("FirstName",
                            user.FirstOrDefault().FirstName != null ? user.FirstOrDefault().FirstName : ""),
                        new Claim("LastName",
                            user.FirstOrDefault().LastName != null ? user.FirstOrDefault().LastName : ""),
                        new Claim("UserEmail", user.FirstOrDefault().UserEmail),
                        new Claim("IdentityNumber",
                            user.FirstOrDefault().IdentityNumber != null ? user.FirstOrDefault().IdentityNumber : ""),
                        new Claim("UserMobile",
                            user.FirstOrDefault().UserMobile != null ? user.FirstOrDefault().UserMobile : ""),
                        new Claim("UserPhoto",
                            Encoding.ASCII.GetString(user.FirstOrDefault().UserPhoto) != null
                                ? Encoding.ASCII.GetString(user.FirstOrDefault().UserPhoto)
                                : "")
                    };

                        var userIdentity = new ClaimsIdentity(claims, "UserInfo");
                        var principal = new ClaimsPrincipal(userIdentity);
                        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

                        // await HttpContext.Authentication.SignInAsync("idsrv.2FA", new ClaimsPrincipal(id));

                        HttpContext.Session.SetObject("RoleMenuler", _getMenu.GetMenus(user[0].UserId).ToList());
                        HttpContext.Session.SetObject("IsRoles", IsRole(_getMenu.GetRoleUsers(user[0].UserId)));
                        CultureInfo ci = CultureInfo.CurrentCulture;
                        HttpContext.Session.SetObject("Dil", ci);
                        //return RedirectToAction("Index", "Home", new {culture="en-US"});
                        return RedirectToAction("Index", "Home");
                    }
                    ModelState.AddModelError(string.Empty,
                        "Giriş Başarısız. Kullanıcı Adınızı veya Şifrenizi Kontrol Ediniz..!");
                    return View(model);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return View(model);
        }



        public async Task<bool> IndexTnj2(LoginViewModel model)
        {

            // var user = new List<ApplicationUser>();
            // var passWord = Crypto.Ush(model.Password);



            var client = new HttpClient();
            var disco = client.GetDiscoveryDocumentAsync("https://localhost:5001").Result;
            if (disco.IsError)
            {
                throw new ApplicationException(disco.Error);
                //return Json(disco.Error);
            }
            var tokenResponse = client.RequestPasswordTokenAsync(new PasswordTokenRequest
            {
                Address = disco.TokenEndpoint,

                ClientId = "tms",
                ClientSecret = "511536EF-F270-4058-80CA-1C89C192F69A",

                UserName = model.UserName,
                Password = model.Password,

                Scope = "asis openid asis.configuration"
            }).Result;
            if (tokenResponse.IsError)
            {
                //  return Json(tokenResponse.Error);
            }

            //Request to api with access token
            client.SetBearerToken(tokenResponse.AccessToken);


            //   var response = client.GetAsync("https://localhost:5005/api/WeatherForecast").Result;
            //  var content = response.Content.ReadAsStringAsync().Result;

            //ViewBag.Json = JArray.Parse(content).ToString();
            //return Json(content);
            ////return View();


            //try
            //{
            //    using (var context = new AsisContext())
            //    {

            //        await context.LoadStoredProc("fill.Authentication")
            //            .AddParam("UserName", model.UserName)
            //            .AddParam("UserPassword", passWord)
            //            .ExecAsync(async r => user = await r.ToListAsync<ApplicationUser>());
            //        OutMessage = "Giriş Başarılı";
            //        if (user != null && (user != null) & (user.Count > 0))
            //        {
            //            await _log.InsertLog(controllerName, actionName, "LOGIN", 200, OutMessage, user.FirstOrDefault().UserId);
            //            var claims = new List<Claim>
            //        {
            //            new Claim(ClaimTypes.Name, model.UserName),
            //            new Claim("UserId", user.FirstOrDefault().UserId.ToString()),
            //            new Claim("UserName", user.FirstOrDefault().UserName),
            //            new Claim("FirstName",
            //                user.FirstOrDefault().FirstName != null ? user.FirstOrDefault().FirstName : ""),
            //            new Claim("LastName",
            //                user.FirstOrDefault().LastName != null ? user.FirstOrDefault().LastName : ""),
            //            new Claim("UserEmail", user.FirstOrDefault().UserEmail),
            //            new Claim("IdentityNumber",
            //                user.FirstOrDefault().IdentityNumber != null ? user.FirstOrDefault().IdentityNumber : ""),
            //            new Claim("UserMobile",
            //                user.FirstOrDefault().UserMobile != null ? user.FirstOrDefault().UserMobile : ""),
            //            new Claim("UserPhoto",
            //                Encoding.ASCII.GetString(user.FirstOrDefault().UserPhoto) != null
            //                    ? Encoding.ASCII.GetString(user.FirstOrDefault().UserPhoto)
            //                    : "")
            //        };

            //            var userIdentity = new ClaimsIdentity(claims, "UserInfo");
            //            var principal = new ClaimsPrincipal(userIdentity);
            //            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            //            // await HttpContext.Authentication.SignInAsync("idsrv.2FA", new ClaimsPrincipal(id));

            //            HttpContext.Session.SetObject("RoleMenuler", _getMenu.GetMenus(user[0].UserId).ToList());
            //            HttpContext.Session.SetObject("IsRoles", IsRole(_getMenu.GetRoleUsers(user[0].UserId)));
            //            CultureInfo ci = CultureInfo.CurrentCulture;
            //            HttpContext.Session.SetObject("Dil", ci);
            //            //return RedirectToAction("Index", "Home", new {culture="en-US"});
            //            //return RedirectToAction("Index", "Home");
            //            return true;
            //        }
            //        await _log.InsertLog(controllerName, actionName, "LOGOUT", 200, "Giriş Başarısız!", 0);
            //        //ModelState.AddModelError(string.Empty,
            //        //    "Giriş Başarısız. Kullanıcı Adınızı veya Şifrenizi Kontrol Ediniz..!");
            //        return false;
            //    }
            //}
            //catch (Exception ex)
            //{
            //    Console.WriteLine(ex.Message);
            //}
            return false;
        }
        [HttpPost]
        public async Task<bool> IndexTnj(LoginViewModel model)
        {
            var controllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
            var actionName = this.ControllerContext.RouteData.Values["action"].ToString();
            var user = new List<ApplicationUser>();

            try
            {
                using (var context = new AsisContext())
                {
                    var passWord = Crypto.Ush(model.Password);
                    await context.LoadStoredProc("fill.Authentication")
                        .AddParam("UserName", model.UserName)
                        .AddParam("UserPassword", passWord)
                        .ExecAsync(async r => user = await r.ToListAsync<ApplicationUser>());
                    OutMessage = "Giriş Başarılı";
                    if (user != null && (user != null) & (user.Count > 0))
                    {
                      //  await _log.InsertLog(controllerName, actionName, "LOGIN", 200, OutMessage, user.FirstOrDefault().UserId);
                        var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Name, model.UserName),
                        new Claim("UserId", user.FirstOrDefault().UserId.ToString()),
                        new Claim("UserName", user.FirstOrDefault().UserName),
                        new Claim("FirstName",
                            user.FirstOrDefault().FirstName != null ? user.FirstOrDefault().FirstName : ""),
                        new Claim("LastName",
                            user.FirstOrDefault().LastName != null ? user.FirstOrDefault().LastName : ""),
                        new Claim("UserEmail", user.FirstOrDefault().UserEmail),
                        new Claim("IdentityNumber",
                            user.FirstOrDefault().IdentityNumber != null ? user.FirstOrDefault().IdentityNumber : ""),
                        new Claim("UserMobile",
                            user.FirstOrDefault().UserMobile != null ? user.FirstOrDefault().UserMobile : ""),
                        new Claim("UserPhoto",
                            Encoding.ASCII.GetString(user.FirstOrDefault().UserPhoto) != null
                                ? Encoding.ASCII.GetString(user.FirstOrDefault().UserPhoto)
                                : "")
                    };

                        var userIdentity = new ClaimsIdentity(claims, "UserInfo");
                        var principal = new ClaimsPrincipal(userIdentity);
                        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

                        // await HttpContext.Authentication.SignInAsync("idsrv.2FA", new ClaimsPrincipal(id));

                        HttpContext.Session.SetObject("RoleMenuler", _getMenu.GetMenus(user[0].UserId).ToList());
                        HttpContext.Session.SetObject("IsRoles", IsRole(_getMenu.GetRoleUsers(user[0].UserId)));
                        CultureInfo ci = CultureInfo.CurrentCulture;
                        HttpContext.Session.SetObject("Dil", ci);
                        //return RedirectToAction("Index", "Home", new {culture="en-US"});
                        //return RedirectToAction("Index", "Home");
                        return true;
                    }
                    //ModelState.AddModelError(string.Empty,
                    //    "Giriş Başarısız. Kullanıcı Adınızı veya Şifrenizi Kontrol Ediniz..!");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return false;
        }

        public bool IsRole(List<RoleMenu> roles)
        {
            for (int i = 0; i < roles.Count; i++)
            {
                if (roles[i].RoleId == 1 || roles[i].RoleId == 19)
                {
                    return true;
                }
            }

            return false;
        }

        /*public IActionResult Logout()
        {
            HttpContext.Session.Remove("UserInfo");
            HttpContext.Session.Clear();
            return RedirectToAction("Index", "Account");
        }*/
        public async Task<IActionResult> Logout()
        {
            //HttpContext.Session.Clear();
            await HttpContext.SignOutAsync();
            return RedirectToAction("IndexTnj", "Account");
        }

        public IActionResult AccessDenied()
        {
            return View();
        }


        #endregion
    }
}