
using Microsoft.AspNetCore.Mvc;

namespace Asis.Ulasim.Controllers
{
    public class HttpErrorController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult HttpError401()
        {
            return View("HttpError401");
        }

        [Route("error/404")]
        public IActionResult HttpError404()
        {
            return View("HttpError404");
        }

    }
}