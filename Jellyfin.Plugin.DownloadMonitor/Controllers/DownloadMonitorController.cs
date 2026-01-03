using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.DownloadMonitor.Controllers
{
    /// <summary>
    /// Controller for serving plugin resources.
    /// </summary>
    [ApiController]
    [AllowAnonymous]
    public class DownloadMonitorController : ControllerBase
    {
        /// <summary>
        /// Serves the client-side script.
        /// </summary>
        /// <returns>The JavaScript file.</returns>
        [HttpGet("Plugins/DownloadMonitor/ClientScript")]
        [Produces("application/javascript")]
        public async Task<ActionResult> GetClientScript()
        {
            var assembly = Assembly.GetExecutingAssembly();
            var resourceName = "Jellyfin.Plugin.DownloadMonitor.Web.inject.js";

            using var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
            {
                return NotFound();
            }

            using var reader = new StreamReader(stream);
            var content = await reader.ReadToEndAsync().ConfigureAwait(false);

            return Content(content, "application/javascript");
        }

        /// <summary>
        /// Serves the client-side script via the plugin GUID path.
        /// This matches the URL injected into index.html.
        /// </summary>
        /// <returns>The JavaScript file.</returns>
        [HttpGet("Plugins/4344669f-555b-4525-b86f-d66dbb9ae81b/inject.js")]
        [Produces("application/javascript")]
        public async Task<ActionResult> GetInjectScript()
        {
            var assembly = Assembly.GetExecutingAssembly();
            var resourceName = "Jellyfin.Plugin.DownloadMonitor.Web.inject.js";

            using var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
            {
                return NotFound();
            }

            using var reader = new StreamReader(stream);
            var content = await reader.ReadToEndAsync().ConfigureAwait(false);

            return Content(content, "application/javascript");
        }
    }
}
