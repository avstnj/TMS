using Microsoft.AspNetCore.Identity;

namespace Asis.Ulasim.Models.Account
{
    public class ApplicationRole: IdentityRole
    {
        public string[] Roles { get; set; }
    }
}
