using Asis.Ulasim.Context;
using Asis.Ulasim.Models.ConstAndEnum;
using StoredProcedureEFCore;
using System;
using USHDLL;

namespace Asis.Ulasim.Models.Definitions
{
    public class UserSettings
    {
        public string OutMessage = "";
        public int OutId = 0;

        public void UpdateUser(string userName, string name, string surName, string identificationNo,string mobilNumber, string email, int userId)
        {

            try
            {

                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.DmlUserAccount")
                        .AddParam("dml", "UPDATE")
                        .AddParam("userName", userName)
                        .AddParam("userPassword", "")
                        .AddParam("name", name)
                        .AddParam("sureName", surName)
                        .AddParam("identificationNo", identificationNo)
                        .AddParam("mobilNumber", mobilNumber)
                        .AddParam("email", email)
                        .AddParam("userRole", 1)
                        .AddParam("InsertUserId", userId)
                        .AddParam("outId", out IOutParam<int> outParam)
                        .ExecNonQuery();


                    OutId = outParam.Value;
                    if (OutId == 0)
                    {
                        OutMessage = userName + " Kullanıcı Bilgileri Güncellendi";
                    }

                }
            }
            catch (Exception e)
            {
                string error = e.Message;
                OutMessage = "Güncelleme Sırasında Hata Oluştu..!";
            }
        }
        public void ChangePassword(string userName, string password, int userId)
        {

            try
            {
                var passWord = Crypto.Ush(password);
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.DmlUserAccount")
                        .AddParam("dml", "CHANGE_PASSWORD")
                        .AddParam("userName", userName)
                        .AddParam("userPassword", passWord)
                        .AddParam("name", "")
                        .AddParam("sureName", "")
                        .AddParam("identificationNo", "")
                        .AddParam("mobilNumber", "")
                        .AddParam("email", "")
                        .AddParam("userRole", 1)
                        .AddParam("InsertUserId", userId)
                        .AddParam("outId", out IOutParam<int> outParam)
                        .ExecNonQuery();


                    OutId = outParam.Value;
                    if (OutId == 0)
                    {
                        OutMessage = userName + " Kullanıcı Şifresi Değiştirildi, Mail Adresinize Gönderildi..!";
                    }

                }
            }
            catch (Exception e)
            {
                string error = e.Message;
                OutMessage = "Hata Oluştu..!";
            }
        }
        public void LoadImage(string userName, byte[] userPhoto, int userId)
        {

            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.DmlUserAccount")
                        .AddParam("dml", "LOAD_IMAGE")
                        .AddParam("userName", userName)
                        .AddParam("userPassword", "")
                        .AddParam("name", "")
                        .AddParam("sureName", "")
                        .AddParam("identificationNo", "")
                        .AddParam("mobilNumber", "")
                        .AddParam("email", "")
                        .AddParam("userRole", 1)
                        .AddParam("userPhoto", userPhoto)
                        .AddParam("InsertUserId", userId)
                        .AddParam("outId", out IOutParam<int> outParam)
                        .ExecNonQuery();


                    OutId = outParam.Value;
                    if (OutId == 0)
                    {
                        OutMessage = userName + " Kullanıcı Resmi Değiştirildi..!";
                    }

                }
            }
            catch (Exception e)
            {
                string error = e.Message;
                OutMessage = "Resim yüklenirken Hata Oluştu..!";
            }
        }

        

    }
}
