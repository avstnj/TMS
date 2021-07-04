using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading.Tasks;

namespace Asis.Ulasim.Models
{      
         [DataContract]
        public class Log
        {


            [DataMember]
            public string ipAddress { get; set; }

            [DataMember]
            public int cityId { get; set; }

            [DataMember]
            public int userId { get; set; }

            [DataMember]
            public string sessionId { get; set; }


            [DataMember]
            public int logStatus { get; set; }

         
            [DataMember]
            public string ErrorDescripton { get; set; }

            [DataMember]
            public DateTime activityTime { get; set; }



        }
        public enum Status
        {
            Success = 0,
            Warning = 1,
            Error = 2
        }
    }


