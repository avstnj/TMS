using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Asis.Ulasim.Models.ColumnCheck
{
    public class ColumnCheckResult
    {
        public bool IsColumnExists { get; set; }
        public string Caption { get; set; }
    }

    public enum AppJsonValues
    {
        TicketTypes,
        EquipmentTypes,
        TicketMainType,
        TransactionType,
        BlacklistDefinition,
        Logos,
        MonitoringParameters
    }

    public class ValueResult
    {
        public string Value { get; set; }
        public string Key { get; set; }

    }

    public class ValueResultWithId
    {
        public string Id { get; set; }
        public string Value { get; set; }
        public string Key { get; set; }

    }
}
