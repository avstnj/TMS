using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Asis.Ulasim.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using NLog;

namespace Asis.Ulasim.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogController : ControllerBase
    {
         private static Logger _logger = LogManager.GetCurrentClassLogger();

        [HttpPost]
        public Guid AddLog(Log log)
        {

            switch (log.logStatus)
            {
                case (int)Status.Success:
                    _logger.Info(JsonConvert.SerializeObject(log));
                    break;
                case (int)Status.Error:
                    _logger.Error(JsonConvert.SerializeObject(log));
                    break;
                case (int)Status.Warning:
                    _logger.Warn(JsonConvert.SerializeObject(log));
                    break;
            }

            return new Guid();
        }

        public void SetLog ( int cityId,int userId,int logStatus,string message)
        {

            Log logging = new Log();
            logging.userId = userId;
            logging.ErrorDescripton = message;
            logging.activityTime = DateTime.Now;
            logging.cityId = cityId;
            logging.logStatus =logStatus;
            AddLog(logging);
        }
    }
}