using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Text;
using Asis.Ulasim.Models.Definitions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace Asis.Ulasim.Controllers.Definitions
{
    public class UserSettingsController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly UserSettings _UserSettings;

        public UserSettingsController(IHostingEnvironment hostingEnvironment)
        {
            _UserSettings = new UserSettings();
            _hostingEnvironment = hostingEnvironment;
        }

        public IActionResult Index()
        {
            return View();
        }
        public IActionResult IndexTnj()
        {
            return View();
        }

        [HttpPost]
        public IActionResult PartialUpdateUser(string userName, string name, string surName, string identificationNo,
            string mobilNumber, string email)
        {
            var member = ReMember();
            _UserSettings.UpdateUser(userName, name, surName, identificationNo, mobilNumber, email, member.UserId);
            if (_UserSettings.OutId == 0)
                return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                    ToastAlert(ToastType.success, _UserSettings.OutMessage, "Mesaj"));
            return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                ToastAlert(ToastType.warning, _UserSettings.OutMessage, "Mesaj"));
        }

        [HttpPost]
        public IActionResult PartialChangePasswordUser(string userName, string password, string email)
        {
            var member = ReMember();
            _UserSettings.ChangePassword(userName, password, member.UserId);
            if (_UserSettings.OutId == 0)
            {
                SendMail(email, userName, password);
                return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                    ToastAlert(ToastType.success, _UserSettings.OutMessage, "Mesaj"));
            }

            return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                ToastAlert(ToastType.warning, _UserSettings.OutMessage, "Mesaj"));
        }

        [HttpPost]
        public IActionResult PartialLoadImage(string userName, string userPhoto)
        {
            var member = ReMember();
            var bytToPhoto = Encoding.ASCII.GetBytes(userPhoto);
            _UserSettings.LoadImage(userName, bytToPhoto, member.UserId);
            if (_UserSettings.OutId == 0)
                return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                    ToastAlert(ToastType.success, _UserSettings.OutMessage, "Mesaj"));
            return PartialView("~/Views/Shared/_PartialAlert.cshtml",
                ToastAlert(ToastType.warning, _UserSettings.OutMessage, "Mesaj"));
        }

        [HttpPost]
        public void SendMail(string to, string userName, string password)
        {
            if(ModelState.IsValid)
            {
                var Body = "";
                var path = Path.Combine(_hostingEnvironment.WebRootPath + "\\Templates", "EmailChangePassword.txt");
                var mail = new MailMessage();
                    mail.To.Add(to);
                    mail.From = new MailAddress("bilet@asiselektronik.com.tr");
                    mail.Subject = "User Password e-Mail";
                using (var sr = new StreamReader(path))
                {
                    Body = sr.ReadToEnd();
                    Body = Body.Replace("{UserName}", userName);
                    Body = Body.Replace("{Password}", password);
                }
                mail.Body = Body;
                mail.IsBodyHtml = true;
                var smtp = new SmtpClient();
                smtp.Host = "mail.asiselektronik.com.tr";
                smtp.Port = 25;
                smtp.EnableSsl = false;
                smtp.UseDefaultCredentials = false;
                smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                NetworkCredential credentials = new NetworkCredential("Asis.local\bilet", "Qwe12345!");
                smtp.Credentials = credentials;
                try
                {
                    smtp.Send(mail);
                    mail.Dispose();
                    smtp.Dispose();
                }
                catch (Exception e)
                {
                    string error = e.Message;
                    mail.Dispose();
                    smtp.Dispose();
                }
            }
            //if (ModelState.IsValid)
            //{
            //    var Body = "";
            //    var path = Path.Combine(_hostingEnvironment.WebRootPath + "\\Templates", "Email.txt");
            //    var mail = new MailMessage();
            //    mail.To.Add(to);
            //    mail.From = new MailAddress("bilet@asiselektronik.com.tr");
            //    mail.Subject = "User Password e-Mail";

            //    using (var sr = new StreamReader(path))
            //    {
            //        Body = sr.ReadToEnd();
            //        Body = Body.Replace("{UserName}", userName);
            //        Body = Body.Replace("{Password}", password);
            //        //Body = Body.Replace("{Url}", url);
            //    }

            //    try
            //    {
            //        mail.Body = Body;
            //        mail.IsBodyHtml = true;
            //        var smtp = new SmtpClient();
            //        smtp.Host = "mail.asiselektronik.com.tr";
            //        smtp.Port = 587;
            //        smtp.UseDefaultCredentials = false;
            //        smtp.Credentials = new NetworkCredential("bilet@asiselektronik.com.tr", "bilet2435");
            //        smtp.EnableSsl = true;
            //        //string Body = _objModelMail.Body;
            //        smtp.Send(mail);
            //    }
            //    catch (Exception ex)
            //    {
            //        Console.WriteLine(ex.Message);
            //    }
            //}
        }
    }
}