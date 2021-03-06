
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Newtonsoft.Json.Serialization;
using System;
using System.IO;
using Microsoft.Extensions.FileProviders;
using DevExpress.AspNetCore;
using System.Globalization;
using System.Collections.Generic;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc.Razor;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;

namespace Asis.Ulasim
{
    public class Startup
    {
        public static string ConnectionAuthString
        {
            get;

            private set;

        }
        public static string ConnectionDefaultString
        {
            get;

            private set;

        }
        public static string MaskiConnection
        {
            get;

            private set;

        }
        public static string AAConnection
        {
            get;

            private set;

        }
        public static string ChannelCode
        {
            get;

            private set;

        }
        public static int CityId
        {
            get;

            private set;

        }

        public IConfigurationRoot Configuration { get; set; }

        public Startup(IHostingEnvironment env)
        {
            Configuration = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appSettings.json")
                .Build();
        }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton<IConfigurationRoot>(Configuration);
            services.Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
                options.HttpOnly = HttpOnlyPolicy.Always;
            });

            //Form value count limit 1024 exceeded hatası çözümü
            services.Configure<FormOptions>(options =>
            {
                options.ValueCountLimit = int.MaxValue;
                options.ValueLengthLimit = int.MaxValue;
                options.KeyLengthLimit = int.MaxValue;
                // options.MultipartBodyLengthLimit = long.MaxValue; //not recommended value
            });

            services.AddDevExpressControls();

            services
                .AddMvc()        
                .AddSessionStateTempDataProvider()
                .AddJsonOptions(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver());

            services.AddDistributedMemoryCache();

            //services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromHours(3);
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true; //oturum çerezini zorunlu olarak işaretlemektir
                options.Cookie.Name = "Asis.Ulasim";
                //options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

            });

            services.AddCors(options => options.AddPolicy("CorsPolicy",
                builder =>
                {
                    builder.AllowAnyMethod().AllowAnyHeader()
                        .WithOrigins("http://localhost:1923", "http://10.240.1.80:1923", "http://localhost:8090", "http://10.240.1.80:8090")
                        .AllowCredentials();
                }));

            //services.AddSignalR();


            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.LoginPath = "/Account/IndexTnj/";
                    options.Cookie.HttpOnly = true;
                    options.ExpireTimeSpan = TimeSpan.FromHours(3);
                    options.LogoutPath = "/Account/IndexTnj/";
                });

            services.AddLocalization(o =>
            {
                o.ResourcesPath = "Resources";
            });

            //services.AddLogging();

            services.AddMvc()
                .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix, o => { o.ResourcesPath = "Resources"; })
                .AddDataAnnotationsLocalization();

            services.Configure<RequestLocalizationOptions>(
                opts =>
                {
                    var supportedCultures = new List<CultureInfo>
                    {
                        new CultureInfo("en-US"),
                        new CultureInfo("tr-TR"),
                        new CultureInfo("fr-FR")
                    };
                    opts.DefaultRequestCulture = new RequestCulture("en-US");
                    opts.SupportedCultures = supportedCultures;
                    opts.SupportedUICultures = supportedCultures;
                }
            );
            services.AddHttpContextAccessor();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {

            if (env.IsDevelopment())
            {
                app.UseBrowserLink();
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Account/IndexTnj");
            }


            app.UseDeveloperExceptionPage();

            app.UseFileServer();
            var provider = new PhysicalFileProvider(
                Path.Combine("C:\\", "node_modules")
            );
            var options = new FileServerOptions();
            options.RequestPath = "/node_modules";
            options.StaticFileOptions.FileProvider = provider;
            options.EnableDirectoryBrowsing = true;
            app.UseFileServer(options);
            app.UseStaticFiles();


            app.UseCors("CorsPolicy");
            app.UseDevExpressControls();
            //app.UseHttpsRedirection();
            //app.UseCookiePolicy();
            app.UseAuthentication();
            app.UseSession();


            //ConnectionAuthString = Configuration["ConnectionAuthStrings:AuthConnection"];
            ConnectionDefaultString = Configuration["ConnectionConfiguration:DefaultConnection"];
            MaskiConnection = Configuration["ConnectionConfiguration:MaskiConnection"];
            AAConnection = Configuration["ConnectionConfiguration:AAConnection"];
            ChannelCode = Configuration["ConnectionConfiguration:ChannelCode"];
            CityId = Convert.ToInt32(Configuration["ConnectionConfiguration:CityId"]);


            app.UseStatusCodePagesWithReExecute("/error/{0}");

            var opt = app.ApplicationServices.GetService<IOptions<RequestLocalizationOptions>>();
            var cookieProvider = opt.Value.RequestCultureProviders.OfType<CookieRequestCultureProvider>().First();
            cookieProvider.CookieName = "UserCulture";
            app.UseRequestLocalization(opt.Value);

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                template: "{controller=Account}/{action=IndexTnj}/{id?}");
                //routes.MapRoute("lang", "{controller=Account}/{action=Index}/{culture=DefaultRequestCulture}");
                routes.MapRoute("lang", "{controller=Account}/{action=IndexTnj}");
            });
        }
    }
}
