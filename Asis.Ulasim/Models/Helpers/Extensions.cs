using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Asis.Ulasim.Models.Helpers
{
    static class Extensions
    {

        public static string GetFullErrorMessage(this ModelStateDictionary modelState)
        {
            var messages = new List<string>();

            foreach (var entry in modelState)
            {
                foreach (var error in entry.Value.Errors)
                    messages.Add(error.ErrorMessage);
               
            }

            return String.Join(" ", messages);
        }

        public static string GetFullErrorMessage(this ModelStateDictionary modelState, string outMessages)
        {
            var messages = new List<string>();

            foreach (var entry in modelState)
            {
                /*foreach (var error in entry.Value.Errors)
                    messages.Add(error.ErrorMessage);*/
                messages.Add(outMessages);
            }

            return String.Join(" ", messages);
        }

        public static string ExceptionMessage(Exception e)
        {
            string outMessage;

            if (e.HResult == -2146233088)
            {

                //outMessage = "Bu Datanın Diğer Tablolarda Kayıtı Olduğu İçin Silinemez..!";
                outMessage = !string.Equals(e.InnerException, null) ? e.InnerException.Message : e.Message;

            }
            else
            {
                outMessage = !string.Equals(e.InnerException, null) ? e.InnerException.Message : e.Message;
            }

            return outMessage;
        }
    }
}
