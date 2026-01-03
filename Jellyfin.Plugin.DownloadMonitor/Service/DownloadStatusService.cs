using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Jellyfin.Plugin.DownloadMonitor.Helpers;
using MediaBrowser.Controller.Session;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.DownloadMonitor.Service
{
    /// <summary>
    /// Download status service that monitors Radarr downloads and broadcasts updates via WebSocket.
    /// </summary>
    public sealed class DownloadStatusService : IHostedService, IDisposable
    {
        private readonly ISessionManager _sessionManager;
        private readonly ILogger<DownloadStatusService> _logger;
        private readonly HttpClient _httpClient;
        private Timer? _timer;

        /// <summary>
        /// Initializes a new instance of the <see cref="DownloadStatusService"/> class.
        /// </summary>
        /// <param name="sessionManager">The session manager for WebSocket communication.</param>
        /// <param name="logger">The logger.</param>
        public DownloadStatusService(
            ISessionManager sessionManager,
            ILogger<DownloadStatusService> logger)
        {
            _sessionManager = sessionManager;
            _logger = logger;
            _httpClient = new HttpClient();
        }

        /// <summary>
        /// Start the service.
        /// </summary>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("🚀 Download Monitor Service started!");

            // Register with File Transformation plugin
            RegisterWithFileTransformation();

            _timer = new Timer(OnTimerCallback, null, TimeSpan.FromSeconds(10), TimeSpan.FromSeconds(10));
            return Task.CompletedTask;
        }

        private void RegisterWithFileTransformation()
        {
            try
            {
                _logger.LogInformation("[DownloadMonitor] Looking for File Transformation plugin...");

                // Find the File Transformation plugin assembly
                var ftAssembly = AppDomain.CurrentDomain.GetAssemblies()
                    .FirstOrDefault(a => a.GetName().Name == "Jellyfin.Plugin.FileTransformation");

                if (ftAssembly == null)
                {
                    _logger.LogWarning("[DownloadMonitor] File Transformation plugin not found. Please install it from: https://github.com/IAmParadox27/jellyfin-plugin-file-transformation");
                    return;
                }

                _logger.LogInformation("[DownloadMonitor] Found File Transformation plugin");

                // Find PluginInterface class with RegisterTransformation method
                var pluginInterfaceType = ftAssembly.GetType("Jellyfin.Plugin.FileTransformation.PluginInterface");
                if (pluginInterfaceType == null)
                {
                    _logger.LogError("[DownloadMonitor] Could not find PluginInterface type");
                    return;
                }

                var registerMethod = pluginInterfaceType.GetMethod("RegisterTransformation");
                if (registerMethod == null)
                {
                    _logger.LogError("[DownloadMonitor] Could not find RegisterTransformation method");
                    return;
                }

                // Find Newtonsoft.Json for creating JObject
                var newtonsoftAssembly = AppDomain.CurrentDomain.GetAssemblies()
                    .FirstOrDefault(a => a.GetName().Name == "Newtonsoft.Json");

                if (newtonsoftAssembly == null)
                {
                    _logger.LogError("[DownloadMonitor] Newtonsoft.Json not found");
                    return;
                }

                var jObjectType = newtonsoftAssembly.GetType("Newtonsoft.Json.Linq.JObject");
                var parseMethod = jObjectType?.GetMethod("Parse", new[] { typeof(string) });

                if (parseMethod == null)
                {
                    _logger.LogError("[DownloadMonitor] Could not find JObject.Parse method");
                    return;
                }

                // Build registration JSON
                var callbackType = typeof(IndexHtmlTransformation);
                var transformationId = new Guid("d0a9de2a-3b1c-4e5f-8a7b-1c2d3e4f5a6b");

                // File Transformation uses Assembly.FullName for lookup
                var json = $@"{{
                    ""id"": ""{transformationId}"",
                    ""fileNamePattern"": ""index.html"",
                    ""callbackAssembly"": ""{callbackType.Assembly.FullName}"",
                    ""callbackClass"": ""{callbackType.FullName}"",
                    ""callbackMethod"": ""Transform""
                }}";

                _logger.LogInformation(
                    "[DownloadMonitor] Registering with assembly: {Assembly}, class: {Class}",
                    callbackType.Assembly.FullName,
                    callbackType.FullName);

                var jObject = parseMethod.Invoke(null, new object[] { json });

                // Call RegisterTransformation
                registerMethod.Invoke(null, new[] { jObject });

                _logger.LogInformation("[DownloadMonitor] ✅ Successfully registered index.html transformation with File Transformation plugin");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[DownloadMonitor] Failed to register with File Transformation plugin: {Message}", ex.Message);
            }
        }

        /// <summary>
        /// Stop the service.
        /// </summary>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("⏹️ Download Monitor Service stopping...");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        private async void OnTimerCallback(object? state)
        {
            try
            {
                await CheckDownloads().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in download check loop");
            }
        }

        private async Task CheckDownloads()
        {
            var config = Plugin.Instance?.Configuration;
            if (config == null || string.IsNullOrEmpty(config.RadarrUrl) || string.IsNullOrEmpty(config.RadarrApiKey))
            {
                return;
            }

            // Update timer interval based on user setting
            if (_timer != null)
            {
                _timer.Change(TimeSpan.FromSeconds(config.RefreshInterval), TimeSpan.FromSeconds(config.RefreshInterval));
            }

            var requestUrl = $"{config.RadarrUrl.TrimEnd('/')}/api/v3/queue?apikey={config.RadarrApiKey}";

            try
            {
                var response = await _httpClient.GetAsync(requestUrl).ConfigureAwait(false);
                if (response.IsSuccessStatusCode)
                {
                    var jsonString = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                    // Send raw Radarr JSON to the frontend via WebSocket
                    await _sessionManager.SendMessageToAdminSessions(
                        MediaBrowser.Model.Session.SessionMessageType.ForceKeepAlive,
                        new { MessageType = "DownloadStatusUpdate", Provider = "Radarr", Data = jsonString },
                        cancellationToken: default).ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Could not reach Radarr: {Message}", ex.Message);
            }
        }

        /// <summary>
        /// Disposes the service and cleans up resources.
        /// </summary>
        public void Dispose()
        {
            _timer?.Dispose();
            _httpClient?.Dispose();
        }
    }
}
