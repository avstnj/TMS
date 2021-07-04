using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Asis.Ulasim.Context;
using Microsoft.AspNetCore.Mvc;
using StoredProcedureEFCore;

namespace Asis.Ulasim.Models.Fills
{
    public class Tasks
    {
        public IQueryable<TasksModel> FillTasks()
        {
            IQueryable<TasksModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("fill.selectTask")
                        .Exec(r => result = r.ToList<TasksModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }
    }
    [ModelBinder]
    public class TasksModel
    {
        [Display(Name = "Id")]
        public int Id { get; set; }
        [Display(Name = "Gorev")]
        public string Gorev { get; set; }
    }
}
