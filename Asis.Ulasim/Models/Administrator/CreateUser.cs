using Asis.Ulasim.Context;
using Asis.Ulasim.Models.ConstAndEnum;
using StoredProcedureEFCore;
using System;
using System.Data.Common;
using System.Linq;
using USHDLL;

namespace Asis.Ulasim.Models.Administrator
{
    public class CreateUser
    {
        public string OutMessage = "";
        public int OutId = 0;

        public IQueryable<RolesModel> FillRoles()
        {
            IQueryable<RolesModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Roles")
                        .Exec(r => result = r.ToList<RolesModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return result;
        }

        public IQueryable<UserInfoModel> FillUserInfo(int userId)
        {
            IQueryable<UserInfoModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Authentications")
                        .AddParam("userId", userId)
                        .Exec(r => result = r.ToList<UserInfoModel>().AsQueryable());
                }
            }
            catch (Exception ex)
            {
                string res = ex.Message;
            }

            return result;
        }

        public IQueryable<UserWithTaskInfoModel> FillUsers()
        {
            IQueryable<UserWithTaskInfoModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.Users")
                        .Exec(r => result = r.ToList<UserWithTaskInfoModel>().AsQueryable());
                }
            }
            catch (Exception ex)
            {
                string res = ex.Message;
            }

            return result;
        }


        public void InsertUser(string userName, string password, string name, string surName, string identificationNo, string mobilNumber, string email, int userRole, int cityId, string channelCode, int userId, int task)
        {

            try
            {
                var passWord = Crypto.Ush(password);
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.DmlUserAccount")
                        .AddParam("dml", "INSERT")
                        .AddParam("userName", userName)
                        .AddParam("userPassword", passWord)
                        .AddParam("name", name)
                        .AddParam("sureName", surName)
                        .AddParam("identificationNo", identificationNo)
                        .AddParam("mobilNumber", string.IsNullOrEmpty(mobilNumber) ? null : mobilNumber)
                        .AddParam("email", email)
                        .AddParam("userRole", userRole)
                        .AddParam("cityId", cityId)  //tbl_identification  tablosu için eklendi
                        .AddParam("channelCode", channelCode) //tbl_identification  tablosu için eklendi
                        .AddParam("InsertUserId", userId)
                        .AddParam("outId", out IOutParam<int> outParam)
                        .AddParam("task", task)
                        //.ReturnValue<string>(out IOutParam<string> OutMessageParam)
                        .ExecNonQuery();


                    OutId = outParam.Value;
                    if (OutId == 0)
                    {
                        OutMessage = userName + " Kullanıcısı Sisteme Kayıt Edildi, Şifreniz e-mail Adresine Gönderildi";
                    }
                    else
                    {
                        OutMessage = userName + " Kullanıcısı Sistemde Zaten Kayıtlı..!";
                    }



                }
            }
            catch (Exception e)
            {
                OutId = 1;
                Console.WriteLine(e.Message);
            }

        }

        public void UpdateInfoUser(int userId, string name, string surName, string identificationNo, string mobilNumber, string email, int insertUserId, byte isActine, int task)
        {

            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.DmlUserInfo")
                        .AddParam("dml", "UPDATE")
                        .AddParam("userId ", userId)
                        .AddParam("name ", name)
                        .AddParam("sureName", surName)
                        .AddParam("identificationNo", identificationNo)
                        .AddParam("mobilNumber", string.IsNullOrEmpty(mobilNumber) ? null : mobilNumber)
                        .AddParam("email", email)
                         .AddParam("InsertUserId ", insertUserId)
                        .AddParam("isActine ", isActine)
                        .AddParam("task ", task)
                        //.AddParam("isDelete ", isDelete)
                        .ExecNonQuery();
                    OutId = 0;
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                Console.WriteLine(e.Message);
            }

        }

        public void DeleteUserInfo(int userId, int insertUserId)
        {

            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.DmlUserInfo")
                        .AddParam("dml", "DELETE")
                        .AddParam("userId ", userId)
                        .AddParam("InsertUserId ", insertUserId)
                        .ExecNonQuery();
                    OutId = 0;
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                Console.WriteLine(e.Message);
            }

        }
        public void ResetPasswordUser(int userId, string password, int insertUserId)
        {

            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("def.DmlUserInfo")
                        .AddParam("dml", "PASSWORD_CHANGE")
                        .AddParam("userId ", userId)
                        .AddParam("userPassword ", password)
                        .AddParam("InsertUserId ", insertUserId)
                        .ExecNonQuery();
                    OutId = 0;
                }
            }
            catch (Exception e)
            {
                OutId = 1;
                Console.WriteLine(e.Message);
            }

        }
        public class UserWithTaskInfoModel
        {
            public int UserId { get; set; }
            public string UserName { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string UserEmail { get; set; }
            public string IdentityNumber { get; set; }
            public string UserMobile { get; set; }
            public bool? IsActive { get; set; }
            public string Task { get; set; }
            //public bool? IsDelete { get; set; }
        }
    }

    public class RolesModel
    {
        public int Id { get; set; }
        public string RoleName { get; set; }
    }

    public class UserInfoModel
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserEmail { get; set; }
        public string IdentityNumber { get; set; }
        public string UserMobile { get; set; }
        public int Task { get; set; }
        public bool? IsActive { get; set; }
        //public bool? IsDelete { get; set; }
    }

    /* public class InsertUsersModel
     {
         public string UserName { get; set; }
         public string UserPassword { get; set; }
         public string Name { get; set; }
         public string SurName { get; set; }
         public string IdentificationNo { get; set; }
         public string MobilNumber { get; set; }
         public string Email { get; set; }
         public int UserRole { get; set; }
        // public byte[] UserPhoto { get; set; }

     }*/
    internal class OutputParam<T> : IOutParam<T>
    {
        public OutputParam(DbParameter param)
        {
            _dbParam = param;
        }

        public T Value => (T)Convert.ChangeType(_dbParam.Value, typeof(T));

        public override string ToString() => _dbParam.Value.ToString();

        private DbParameter _dbParam;

    }
}
