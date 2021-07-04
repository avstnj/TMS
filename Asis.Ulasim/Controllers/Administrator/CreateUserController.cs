using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Exchange.WebServices.Data;
using Asis.Ulasim.Models.Administrator;
using Asis.Ulasim.Models.Fills;
using Asis.Ulasim.Models.Helpers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using USHDLL;

namespace Asis.Ulasim.Controllers.Administrator
{
    public class CreateUserController : BaseController
    {
        private readonly CreateUser _createUser;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly Tasks _task;
        private readonly UsersByAuth _user;

        public CreateUserController(IHostingEnvironment hostingEnvironment)
        {
            _createUser = new CreateUser();
            _hostingEnvironment = hostingEnvironment;
            _task = new Tasks();
            _user = new UsersByAuth();
        }

        public IActionResult Index()
        {
            ViewBag.Roles = _createUser.FillRoles();
            ViewBag.Task = _task.FillTasks();
            return View();
        }

        public IActionResult IndexTnj()
        {
            ViewBag.Roles = _createUser.FillRoles();
            ViewBag.Task = _task.FillTasks();
            return View();
        }

        [HttpPost]
        public IActionResult PartialInsertUser(string userName, string password, string name, string surName, string identificationNo, string mobilNumber, string email, int userRole, int cityId, string channelCode, int task, string cityName)
        {
            var member = ReMember();
            _createUser.InsertUser(userName, password, name, surName, identificationNo, mobilNumber, email, userRole, cityId, channelCode, member.UserId, task);
            if (_createUser.OutId == 0)
            {
                SendMail(email, userName, password, cityName);
                return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                    ToastAlert(ToastType.success, _createUser.OutMessage, "Mesaj"));
            }

            if (_createUser.OutId == 1)
                return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                    ToastAlert(ToastType.error, _createUser.OutMessage, "Mesaj"));


            return null;
        }
        [HttpGet]
        public JsonResult PartialUserInfoModel(int userId)
        {
            var member = ReMember();
            var result = _createUser.FillUserInfo(userId);


            return Json(result);
        }
        [HttpPost]
        public IActionResult UpdateUser(int userId, string name, string surName, string identificationNo,
            string mobilNumber, string email, byte isAktine, int task)
        {
            var member = ReMember();

            _createUser.UpdateInfoUser(userId, name, surName, identificationNo, mobilNumber, email, member.UserId,
                isAktine, task);
            if (_createUser.OutId == 0)
                return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                    ToastAlert(ToastType.success, "Güncelleme Başarılı", "Mesaj"));
            return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                ToastAlert(ToastType.error, _createUser.OutMessage, "Mesaj"));
        }
        [HttpPost]
        public IActionResult DeleteUser(int userId)
        {
            var member = ReMember();
            _createUser.DeleteUserInfo(userId, member.UserId);
            if (_createUser.OutId == 0)
                return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                    ToastAlert(ToastType.success, "Güncelleme Başarılı", "Mesaj"));
            return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                ToastAlert(ToastType.error, _createUser.OutMessage, "Mesaj"));
        }
        public IActionResult GetUser()
        {
            var member = ReMember();

            var result = _user.FillUsersByAuth(member.UserId);

            return Json(result);
        }
        public static bool RedirectionCallback(string redirectionUrl)
        {
            var redirectionUri = new Uri(redirectionUrl);
            var result = redirectionUri.Scheme == "https";
            return result;
        }

        [HttpPost]
        public void PasswordUpdate(int userId, string userName, string email, string cityName)
        {
            var randomPassword = GenerateRandomPassword();
            var passWord = Crypto.Ush(randomPassword);
            var Body = "";
            var path = Path.Combine(_hostingEnvironment.WebRootPath + "\\Templates", "Email" + cityName + ".txt");
            using (var sr = new StreamReader(path))
            {
                Body = sr.ReadToEnd();
                Body = Body.Replace("{UserName}", userName);
                Body = Body.Replace("{Password}", randomPassword);
                string[] mailaddresslist = null;
                //mailaddresslist = new string[1] {"aslihanord@gmail.com"}; //Canlıya alınırken kapatılacak(2)
                mailaddresslist = new string[1] { email };
                MailHelper.SendEMail(mailaddresslist, "User Password e-Mail", Body);
                _createUser.ResetPasswordUser(userId, passWord, ReMember().UserId);
                #region OldMailSend


                //if (ModelState.IsValid)
                //{
                //    var Body = "";
                //    var path = Path.Combine(_hostingEnvironment.WebRootPath + "\\Templates", "Email" + cityName + ".txt");
                //    using (var sr = new StreamReader(path))
                //    {
                //        Body = sr.ReadToEnd();
                //        Body = Body.Replace("{UserName}", userName);
                //        Body = Body.Replace("{Password}", randomPassword);
                //    }
                //    var eposta = new MailMessage("bilet@asiselektronik.com.tr", email)
                //    {
                //        Subject = "User Password e-Mail",
                //        Body = Body,
                //        IsBodyHtml = true
                //    };

                //    SmtpClient smtp = new SmtpClient();
                //    smtp.Host = "mail.asiselektronik.com.tr";
                //    smtp.Port = 25;
                //    smtp.EnableSsl = false;
                //    smtp.UseDefaultCredentials = false;
                //    smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                //    NetworkCredential credentials = new NetworkCredential("Asis.local\bilet", "Qwe12345!");
                //    smtp.Credentials = credentials;
                //    try
                //    {
                //        var cityId = Startup.CityId;
                //        // Maili gönderdik.

                //        smtp.Send(eposta);
                //        eposta.Dispose();
                //        smtp.Dispose();
                //        _createUser.ResetPasswordUser(userId, passWord, ReMember().UserId);
                //    }
                //    catch (Exception e)
                //    {
                //        string error = e.Message;
                //        eposta.Dispose();
                //        smtp.Dispose();
                //    }


                //}

                #endregion
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
        [HttpPost]
        public void SendMail(string To, string UserName, string Password, string cityName)
        {
            var Body = "";
            string[] mailaddresslist = null;
            var path = Path.Combine(_hostingEnvironment.WebRootPath + "\\Templates", "Email" + cityName + ".txt");
            using (var sr = new StreamReader(path))
            {
                Body = sr.ReadToEnd();
                Body = Body.Replace("{UserName}", UserName);
                Body = Body.Replace("{Password}", Password);
            }
            mailaddresslist = new string[1] { To };
            MailHelper.SendEMail(mailaddresslist, "User Password e-Mail", Body);
            #region oldSendMailCreateUser
            //if (ModelState.IsValid)
            //{
            //    var Body = "";
            //    var path = Path.Combine(_hostingEnvironment.WebRootPath + "\\Templates", "Email" + cityName + ".txt");
            //    var mail = new MailMessage();
            //    mail.To.Add(To);
            //    mail.From = new MailAddress("bilet@asiselektronik.com.tr");
            //    mail.Subject = "User Password e-Mail";

            //    using (var sr = new StreamReader(path))
            //    {
            //        Body = sr.ReadToEnd();
            //        Body = Body.Replace("{UserName}", UserName);
            //        Body = Body.Replace("{Password}", Password);

            //    }
            //    var eposta = new MailMessage("bilet@asiselektronik.com.tr", To)
            //    {
            //        Subject = "User Password e-Mail",
            //        Body = Body,
            //        IsBodyHtml = true

            //    };
            //    NetworkCredential credentials = new NetworkCredential("Asis.local\bilet", "Qwe12345!");
            //    SmtpClient smtp = new SmtpClient();
            //    smtp.Host = "mail.asiselektronik.com.tr";
            //    smtp.Port = 25;
            //    smtp.Credentials = credentials;
            //    smtp.UseDefaultCredentials = false;
            //    smtp.EnableSsl = false;
            //    smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
            //    try
            //    {
            //        smtp.Send(eposta);
            //        eposta.Dispose();
            //        smtp.Dispose();
            //    }
            //    catch (Exception e)
            //    {
            //        string error = e.Message;
            //        eposta.Dispose();
            //        smtp.Dispose();
            //    }
            //}


            #endregion
        }

        public IActionResult GetUsers()
        {
            return PartialView("GetUsers", _createUser.FillUsers());
        }
    }
    public class MailHelper
    {
        // Note: To send email you need to add actual email id and credential so that it will work as expected
        private static readonly string EMAIL_SENDER = "bilet@asiselektronik.com.tr";//"bilet@asiselektronik.com.tr"; // change it to actual sender email id or get it from UI input
        private static readonly string EMAIL_USER = "bilet"; // change it to actual sender email id or get it from UI input
        private static readonly string EMAIL_CREDENTIALS = "Qwe12345!"; // Provide credentials
        private static readonly string SMTP_CLIENT = "mail.asiselektronik.com.tr"; // as we are using outlook so we have provided smtp-mail.outlook.com
        public static bool SendEMail(string[] recipient, string subject, string message)
        {
            try
            {
                var service = new ExchangeService(ExchangeVersion.Exchange2013)
                {
                    Credentials =
                    new WebCredentials(EMAIL_USER, EMAIL_CREDENTIALS),
                    TraceEnabled = true,
                    TraceFlags = TraceFlags.All
                };
                service.AutodiscoverUrl(EMAIL_SENDER,
                    RedirectionCallback);
                EmailMessage email = new EmailMessage(service);

                if (recipient != null)
                    foreach (string item in recipient)
                        email.ToRecipients.Add(item);

                email.Subject = subject;
                email.Body = new MessageBody(message);
                email.Body.BodyType = BodyType.HTML;
                email.SendAndSaveCopy();
                //email.Send();
                return true;
            }
            catch (Exception ex)
            {
                String exMessage = ex.Message;
                return false;
            }
        }
        public static bool RedirectionCallback(string redirectionUrl)
        {
            var redirectionUri = new Uri(redirectionUrl);
            var result = redirectionUri.Scheme == "https";
            return result;
        }
        //static bool RedirectionCallback(string url)
        //{
        //    return url.ToLower().StartsWith("http://");
        //}
    }
}