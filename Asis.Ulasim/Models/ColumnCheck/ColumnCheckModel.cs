using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Asis.Ulasim.Models.ColumnCheck
{
    public class ColumnCheckModel
    {
        public string cityCode { get; set; }
        public int cityId { get; set; }
        public string cityName { get; set; }
        public string Language { get; set; }
        public string Dashboard { get; set; }

        public List<MenuList> menuList { get; set; }
        public List<LangList> langList { get; set; }
        public List<TicketType> ticketTypes { get; set; }
        public List<BlacklistDefinition> blacklistDefinition { get; set; }
        public List<EquipmentTypes> equipmentTypes { get; set; }
        public List<TransactionType> transactionTypes { get; set; }
        public List<TicketMainType> ticketMainTypes { get; set; }
        public List<Logos> logos { get; set; }
        public MonitoringParameters monitoringParameters { get; set; }

        public ColumnCheckModel()

        {
            menuList = new List<MenuList>();
            langList = new List<LangList>();
            ticketTypes = new List<TicketType>();
            equipmentTypes = new List<EquipmentTypes>();
            ticketMainTypes = new List<TicketMainType>();
            transactionTypes = new List<TransactionType>();
            blacklistDefinition = new List<BlacklistDefinition>();
            logos = new List<Logos>();
            monitoringParameters = new MonitoringParameters();
        }


        public class MenuList
        {
            public int id { get; set; }
            public string name { get; set; }

            public List<Column> columns { get; set; }

            public MenuList()
            {
                var columns = new List<Column>();
            }

            public class Column
            {
                public string fieldName { get; set; }
                public string caption { get; set; }
            }
        }
        public class LangList
        {
            public int id { get; set; }
            public string name { get; set; }
            public List<Column> columns { get; set; }
            public LangList()
            {
                var columns = new List<Column>();
            }
            public class Column
            {
                public string fieldName { get; set; }
                public string fieldCode { get; set; }
                public string fieldCode2 { get; set; }
                public string culture { get; set; }
            }
        }
        public class TicketType
        {
            public string value { get; set; }
            public string key { get; set; }
        }

        public class EquipmentTypes
        {
            public string value { get; set; }
            public string key { get; set; }
        }

        public class TransactionType
        {
            public string value { get; set; }
            public string key { get; set; }
        }

        public class TicketMainType
        {
            public string value { get; set; }
            public string key { get; set; }
        }

        public class BlacklistDefinition
        {
            public string value { get; set; }
            public string key { get; set; }
        }

        public class Logos
        {
            public string value { get; set; }
            public string key { get; set; }
        }

        public class MonitoringParameters
        {
            public string mapImageUrl { get; set; }
            public string tomTitle { get; set; }
            public string rptTitle { get; set; }
            public string cardTitle { get; set; }
            public List<MonitoringStations> stations { get; set; }
            public List<MonitoringStations> buttons { get; set; }
        }

        public class MonitoringStations
        {
            public string id { get; set; }
            public string dataVal { get; set; }
            public string style { get; set; }
        }

    }


}
