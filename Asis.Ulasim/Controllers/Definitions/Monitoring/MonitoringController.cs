using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using DevExpress.XtraMap.Drawing;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;

namespace Asis.Ulasim.Controllers.Definitions.Monitoring
{
    public class MonitoringController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult IndexTnj()
        {
            return View();
        }

        static string url = "http://10.240.1.144:8082/";

        public static async Task<string> Get(string method, HttpClient client)
        {
            var content = new StringContent("", Encoding.UTF8, "application/json");
            string serviceUrl = $"{url}{method}";
            using (var r = await client.PostAsync(serviceUrl, content))
                return await r.Content.ReadAsStringAsync();
        }
        public static async Task<string> Get(string method, HttpClient client, HttpContent content)
        {
            //   var content = new StringContent("", Encoding.UTF8, "application/json");
            string serviceUrl = $"{url}{method}";
            using (var r = await client.PostAsync(serviceUrl, content))
                return await r.Content.ReadAsStringAsync();
        }
        public JsonResult GetMonitoring()
        {
            try
            {
                HttpClient client = new HttpClient();
                var jsonData = Get("AsisDiagnostic/Diagnostic/GetMonitors", client).Result;
                // var jsonData = Get("AsisDiagnostic/Diagnostic/GetMonitoring", client).Result;
                List<Monitor> obuDiagnosticData = JsonConvert.DeserializeObject<List<Monitor>>(jsonData);
                return Json(obuDiagnosticData);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }
        public JsonResult GetMonitoringDetail()
        {
            try
            {

                //   int ID = 1;
                //int mID = 1;
                HttpClient client = new HttpClient();
                var jsonData = Get("AsisDiagnostic/Diagnostic/GetMonitors", client).Result;

                // var jsonData = Get("AsisDiagnostic/Diagnostic/GetMonitoring", client).Result;
                List<Monitor> obuDiagnosticData = JsonConvert.DeserializeObject<List<Monitor>>(jsonData);
                List<BanknNoteHopperTape> banknNoteHopperTape = new List<BanknNoteHopperTape>();



                List<MonitorList> monitorLists = new List<MonitorList>();


                var jsonDataAlarmms = Get("AsisDiagnostic/Diagnostic/GetAlarms", client).Result;
                List<MyArray> DiagnosticDataAlarms = JsonConvert.DeserializeObject<List<MyArray>>(jsonDataAlarmms);
                List<Alarms> alarms = new List<Alarms>();

                foreach (var item in obuDiagnosticData)
                {
                    banknNoteHopperTape.Add(new BanknNoteHopperTape { DeviceId = item.DeviceId == null ? "1" : item.DeviceId, Name = "BanknNoteHopperTape1", No = item.BanknNoteHopperTape1.No, Count = item.BanknNoteHopperTape1.Count, Type = item.BanknNoteHopperTape1.Type });
                    banknNoteHopperTape.Add(new BanknNoteHopperTape { DeviceId = item.DeviceId == null ? "1" : item.DeviceId, Name = "BanknNoteHopperTape2", No = item.BanknNoteHopperTape2.No, Count = item.BanknNoteHopperTape2.Count, Type = item.BanknNoteHopperTape2.Type });
                    banknNoteHopperTape.Add(new BanknNoteHopperTape { DeviceId = item.DeviceId == null ? "1" : item.DeviceId, Name = "BanknNoteHopperTape3", No = item.BanknNoteHopperTape3.No, Count = item.BanknNoteHopperTape3.Count, Type = item.BanknNoteHopperTape3.Type });
                    banknNoteHopperTape.Add(new BanknNoteHopperTape { DeviceId = item.DeviceId == null ? "1" : item.DeviceId, Name = "BanknNoteHopperTape4", No = item.BanknNoteHopperTape4.No, Count = item.BanknNoteHopperTape4.Count, Type = item.BanknNoteHopperTape4.Type });
                    banknNoteHopperTape.Add(new BanknNoteHopperTape { DeviceId = item.DeviceId == null ? "1" : item.DeviceId, Name = "CoinHopperTape1", No = item.CoinHopperTape1.No, Count = item.CoinHopperTape1.Count, Type = item.CoinHopperTape1.Type });
                    banknNoteHopperTape.Add(new BanknNoteHopperTape { DeviceId = item.DeviceId == null ? "1" : item.DeviceId, Name = "CoinHopperTape2", No = item.CoinHopperTape2.No, Count = item.CoinHopperTape2.Count, Type = item.CoinHopperTape2.Type });


                    var alarmslist = (MyArray)DiagnosticDataAlarms.First(a => a.deviceId == item.DeviceId);


                    alarms.Add(new Alarms
                    {
                        connection = alarmslist.connection,
                        alarm = alarmslist.alarm.value.ToString() == "1" ? true : false,
                        antiPin = alarmslist.antiPin.value.ToString() == "1" ? true : false,
                        banknoteHopperLED = alarmslist.banknoteHopperLED.value.ToString() == "1" ? true : false,
                        cabinCover = alarmslist.cabinCover.value.ToString() == "1" ? true : false,
                        //cabinInternalTemperature = alarmslist.cabinInternalTemperature.value.ToString() == "1" ? true : false,
                        coinAcceptorFullness = alarmslist.coinAcceptorFullness.value.ToString() == "1" ? true : false,
                        coinAcceptorLED = alarmslist.coinAcceptorLED.value.ToString() == "1" ? true : false,
                        coinHopperLED = alarmslist.coinHopperLED.value.ToString() == "1" ? true : false,
                        createDate = alarmslist.createDate,
                        deviceId = alarmslist.deviceId,
                        deviceType = alarmslist.deviceType,
                        electricity = alarmslist.electricity.value.ToString() == "1" ? true : false,
                        frontDoorImpact = alarmslist.frontDoorImpact.value.ToString() == "1" ? true : false,
                        hopperCabinCover = alarmslist.hopperCabinCover.value.ToString() == "1" ? true : false,
                        lcdFan = alarmslist.lcdFan.value.ToString() == "1" ? true : false,
                        //pc = alarmslist.pc.value.ToString() == "1" ? true : false,
                        printerLED = alarmslist.printerLED.value.ToString() == "1" ? true : false,
                        lcdTemperature = alarmslist.lcdTemperature.value.ToString() + "°C",
                        cabinInternalTemperature = alarmslist.cabinInternalTemperature.value.ToString() + "°C"

                    }) ;

                    monitorLists.Add(new MonitorList
                    {
                        ApplicationVersion = item.ApplicationVersion,
                        BanknNoteHopperStatus = item.BanknNoteHopperStatus,
                        BankNoteAcceptorCount = item.BankNoteAcceptorCount,
                        BankNoteAcceptorStatus = item.BankNoteAcceptorStatus,
                        DeviceId = item.DeviceId == null ? "1" : item.DeviceId,
                        DeviceType = item.DeviceType,
                        TicketPrinterStatus = item.TicketPrinterStatus,
                        CardReaderStatus = item.CardReaderStatus,
                        CoinAcceptorCount = item.CoinAcceptorCount,
                        CoinHopperStatus = item.CoinHopperStatus,
                        TicketPrinterCount = item.TicketPrinterCount,
                        TicketPrinterTotal = item.TicketPrinterTotal,
                        CoinAcceptorStatus = item.CoinAcceptorStatus,
                        CreateDate = item.CreateDate,
                        BanknNoteHopperTape = banknNoteHopperTape,
                        Alarms = alarms
                    }) ;
                }
                return Json(monitorLists);
                //return Json(obuDiagnosticData);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return Json(null);
            }
        }
    }
    //public class Monitor
    //{
    //    public string DeviceId { get; set; }
    //    public string DeviceType { get; set; }
    //    public DateTime CreateDate { get; set; }
    //    public bool BankNoteAcceptorStatus { get; set; }
    //    public bool BanknNoteHopperStatus { get; set; }
    //    public bool CardReaderStatus { get; set; }
    //    public bool CoinAcceptorStatus { get; set; }
    //    public bool CoinHopperStatus { get; set; }
    //    public bool TicketPrinterStatus { get; set; }
    //    public string ApplicationVersion { get; set; }
    //}

    public partial class Monitor
    {
        public string DeviceId { get; set; }
        public string DeviceType { get; set; }
        public DateTimeOffset CreateDate { get; set; }
        public long TicketPrinterCount { get; set; }
        public long TicketPrinterTotal { get; set; }
        public bool BankNoteAcceptorStatus { get; set; }
        public long BankNoteAcceptorCount { get; set; }
        public bool BanknNoteHopperStatus { get; set; }
        public BanknNoteHopperTape1 BanknNoteHopperTape1 { get; set; }
        public BanknNoteHopperTape1 BanknNoteHopperTape2 { get; set; }
        public BanknNoteHopperTape1 BanknNoteHopperTape3 { get; set; }
        public BanknNoteHopperTape1 BanknNoteHopperTape4 { get; set; }
        public bool CardReaderStatus { get; set; }
        public bool CoinAcceptorStatus { get; set; }
        public long CoinAcceptorCount { get; set; }
        public bool CoinHopperStatus { get; set; }
        public BanknNoteHopperTape1 CoinHopperTape1 { get; set; }
        public BanknNoteHopperTape1 CoinHopperTape2 { get; set; }
        public bool TicketPrinterStatus { get; set; }
        public string ApplicationVersion { get; set; }
    }
    public partial class MonitorList
    {
        public string DeviceId { get; set; }
        public string DeviceType { get; set; }
        public DateTimeOffset CreateDate { get; set; }
        public long TicketPrinterCount { get; set; }
        public long TicketPrinterTotal { get; set; }
        public bool BankNoteAcceptorStatus { get; set; }
        public long BankNoteAcceptorCount { get; set; }
        public bool BanknNoteHopperStatus { get; set; }
        public bool CardReaderStatus { get; set; }
        public bool CoinAcceptorStatus { get; set; }
        public long CoinAcceptorCount { get; set; }
        public bool CoinHopperStatus { get; set; }
        public bool TicketPrinterStatus { get; set; }
        public string ApplicationVersion { get; set; }
        public List<BanknNoteHopperTape> BanknNoteHopperTape { get; set; }
        public List<Alarms> Alarms { get; set; }
    }
    public partial class BanknNoteHopperTape

    {
        public string DeviceId { get; set; }
        public string Name { get; set; }
        public long No { get; set; }
        public long Type { get; set; }
        public long Count { get; set; }
    }
    public partial class BanknNoteHopperTape1
    {
        public long No { get; set; }
        public long Type { get; set; }
        public long Count { get; set; }
    }
    public class Alarm
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class PrinterLED
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class BanknoteHopperLED
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class CoinHopperLED
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class CoinAcceptorLED
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class Pc
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class AntiPin
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class LcdFan
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class FrontDoorImpact
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class CoinAcceptorFullness
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class Electricity
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class HopperCabinCover
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class CabinCover
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class CabinInternalTemperature
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class LcdTemperature
    {
        public bool status { get; set; }
        public int value { get; set; }
    }
    public class MyArray
    {
        public string deviceId { get; set; }
        public string deviceType { get; set; }
        public DateTime createDate { get; set; }
        public bool connection { get; set; }
        public Alarm alarm { get; set; }
        public PrinterLED printerLED { get; set; }
        public int TicketPrinterCount { get; set; }
        public int TicketPrinterTotal { get; set; }
        public BanknoteHopperLED banknoteHopperLED { get; set; }
        public CoinHopperLED coinHopperLED { get; set; }
        public CoinAcceptorLED coinAcceptorLED { get; set; }
        //public Pc pc { get; set; }
        public AntiPin antiPin { get; set; }
        public LcdFan lcdFan { get; set; }
        public FrontDoorImpact frontDoorImpact { get; set; }
        public CoinAcceptorFullness coinAcceptorFullness { get; set; }
        public Electricity electricity { get; set; }
        public HopperCabinCover hopperCabinCover { get; set; }
        public CabinCover cabinCover { get; set; }
        public CabinInternalTemperature cabinInternalTemperature { get; set; }
        public LcdTemperature lcdTemperature { get; set; }
    }
    public class Alarms
    {
        public string deviceId { get; set; }
        public string deviceType { get; set; }
        public DateTime createDate { get; set; }
        public bool alarm { get; set; }
        public bool connection { get; set; }
        public bool printerLED { get; set; }
        public bool banknoteHopperLED { get; set; }
        public bool coinHopperLED { get; set; }
        public bool coinAcceptorLED { get; set; }
        //public bool pc { get; set; }
        public bool antiPin { get; set; }
        public bool lcdFan { get; set; }
        public bool frontDoorImpact { get; set; }
        public bool coinAcceptorFullness { get; set; }
        public bool electricity { get; set; }
        public bool hopperCabinCover { get; set; }
        public bool cabinCover { get; set; }
        public string cabinInternalTemperature { get; set; }
        public string lcdTemperature { get; set; }
    }
    public class Root
    {
        public List<MyArray> MyArray { get; set; }
    }

}








