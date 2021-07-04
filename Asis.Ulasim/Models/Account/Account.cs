using Asis.Ulasim.Context;
using Asis.Ulasim.Models.ConstAndEnum;
using StoredProcedureEFCore;
using System;
using USHDLL;

namespace Asis.Ulasim.Models.Account
{
    public class Account
    {

        //private readonly UserManager<IdentityUser> _userManager;
        //private readonly SignInManager<IdentityUser> _signInManager;
        //private readonly IMessageService _messageService;

        /*public Account(UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, IMessageService messageService)
        {
            this._userManager = userManager;
            this._signInManager = signInManager;
            this._messageService = messageService;
        }*/
        public static string OutMessage = "";
        public int OutId = 0;
        public void ForgetPassword(string password,string email, string fullname)
        {

            try
            {
                var passWord = Crypto.Ush(password);
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.DmlUserAccount")
                        .AddParam("dml", "FORGET_PASSWORD")
                        .AddParam("userName", fullname)
                        .AddParam("userPassword", passWord)
                        .AddParam("name", "")
                        .AddParam("sureName", "")
                        .AddParam("identificationNo", "")
                        .AddParam("mobilNumber", "")
                        .AddParam("email", email)
                        .AddParam("userRole", 1)
                        .AddParam("InsertUserId", 1)
                        .AddParam("outId", out IOutParam<int> outParam)
                        .ExecNonQuery();


                    OutId = outParam.Value;
                    if (OutId == 1)
                    {
                        OutMessage = " Kullanıcı Adı ile Mail Adresi Uyuşmamaktadır..!";
                       
                    }

                }
            }
            catch (Exception e)
            {
                string error = e.Message;
                OutMessage = "Hata Oluştu..!";
            }
        }
        public bool ForgetPasswordControl(string email, string fullname)
        {
          
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.DmlUserAccount")
                        .AddParam("dml", "FORGET_PASSWORD_CONTROL")
                        .AddParam("userName", fullname)
                        .AddParam("userPassword", "")
                        .AddParam("name", "")
                        .AddParam("sureName", "")
                        .AddParam("identificationNo", "")
                        .AddParam("mobilNumber", "")
                        .AddParam("email", email)
                        .AddParam("userRole", 1)
                        .AddParam("InsertUserId", 1)
                        .AddParam("outId", out IOutParam<int> outParam)
                        .ExecNonQuery();


                    OutId = outParam.Value;
                    if (OutId == 1)
                    {
                        OutMessage = " Kullanıcı Adı ile Mail Adresi Uyuşmamaktadır..!";
                        return false;

                    }

                }
                
            }
            catch (Exception e)
            {
                string error = e.Message;
                OutMessage = "Hata Oluştu..!";
                return false;
            }
            return true;
        }
    }

}
