using Microsoft.AspNetCore.Identity;

namespace Asis.Ulasim.Models.Account
{
    public class ApplicationUser : IdentityUser
    {
       // [Key]
       
        public int UserId { get; set; }
     
        public override string UserName { get; set; }
      
        public string FirstName { get; set; }
     
        public string LastName { get; set; }
       
        public string UserEmail { get; set; }

        public string IdentityNumber { get; set; }

        public string UserMobile { get; set; }

        public byte[] UserPhoto { get; set; } = null;
        //public string UserPhoto { get; set; } = null;

        public string RoleId { get; set; }

        //public  List<ApplicationUser>  UserInfo { get; set; }


      
    }
   

}
