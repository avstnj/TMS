using System.Collections.Generic;

namespace Asis.Ulasim.Models.Menu
{
    public class RoleMenu
    {
        public int SubMenuId { get; set; }
        public string SubMenuName { get; set; }
        public string SubMenuUrl { get; set; }
        public int? SubMenuOrder { get; set; }
        public string SubMenuIconPath { get; set; }
        public string SubMenuLang { get; set; }
        public bool? IsActive { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public string Description { get; set; }
        public int? CityId { get; set; }

        public List<RoleMenu> RoleMenus { get; set; }
    }
}
