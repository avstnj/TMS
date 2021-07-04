using System;
using System.ComponentModel.DataAnnotations;

namespace Asis.Ulasim.Models.Menu
{
    public class SubMenu
    {
        [Key]
        public int Id { get; set; }
        public int MainMenuId { get; set; }
        public string MenuName { get; set; }
        public string MenuUrl { get; set; }
        public int? CityId { get; set; }
        public int InsertUserId { get; set; }
        public System.DateTime InsertDate { get; set; }
        public int? UpdateUserId { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? MenuOrder { get; set; }
        public string IconPath { get; set; }
        public bool? IsActive { get; set; }
        public string Lang { get; set; }
        public int? SubMenuId { get; set; }
    }
}
