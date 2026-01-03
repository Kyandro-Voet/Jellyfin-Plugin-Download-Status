using Jellyfin.Plugin.DownloadMonitor.Service;
using MediaBrowser.Controller;
using MediaBrowser.Controller.Plugins;
using Microsoft.Extensions.DependencyInjection;

namespace Jellyfin.Plugin.DownloadMonitor;

/// <summary>
/// Register plugin services with the DI container.
/// </summary>
public class PluginServiceRegistrator : IPluginServiceRegistrator
{
    /// <inheritdoc />
    public void RegisterServices(IServiceCollection serviceCollection, IServerApplicationHost applicationHost)
    {
        // Register the download status service as a singleton
        serviceCollection.AddSingleton<DownloadStatusService>();
        serviceCollection.AddHostedService(provider => provider.GetRequiredService<DownloadStatusService>());
    }
}
