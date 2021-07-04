using Asis.Ulasim.Context;
using StoredProcedureEFCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Asis.Ulasim.Models.Fills
{
    public class Tvm
    {
        public IQueryable<KioskModel> FillSelectKiosk()
        {
            IQueryable<KioskModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("sp_selectKiosk_Aktif")
                        .Exec(r => result = r.ToList<KioskModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }
        public IQueryable<KioskCommandsModel> FillSelectKioskCommands()
        {
            IQueryable<KioskCommandsModel> result = null;
            try
            {
                using (var context = new AsisContext())
                {
                    context.LoadStoredProc("sp_listeKioskKomutlari")
                        .Exec(r => result = r.ToList<KioskCommandsModel>().AsQueryable());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            return result;
        }
        
    }
    public class KioskModel
    {
        public string kioskKodu { get; set; }
        public string aciklama { get; set; }
        public Int16? kioskNo { get; set; }
    }
    public class KioskCommandsModel
    {
        public Int16? Id { get; set; }
        public string aciklama { get; set; }
    }
}
