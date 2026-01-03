# Jellyfin Download Monitor Plugin

A Jellyfin plugin that adds a **Downloads** menu item to the sidebar, allowing you to monitor active downloads from Radarr directly within the Jellyfin web interface.

![Downloads Menu](https://img.shields.io/badge/Jellyfin-10.11+-blue)
![License](https://img.shields.io/badge/License-GPLv3-green)

## Features

- 📥 **Downloads sidebar menu** - Quick access to download status
- 🎬 **Radarr integration** - Monitor movie downloads in real-time
- 🔄 **Auto-refresh** - Configurable refresh interval
- 🎨 **Native Jellyfin styling** - Blends seamlessly with the UI

## Requirements

- Jellyfin 10.11.0 or newer
- Radarr with API access

## Installation

### Manual Installation

1. Download the latest release from the [Releases](https://github.com/YOUR_USERNAME/Jellyfin.Plugin.DownloadMonitor/releases) page
2. Extract the ZIP file
3. Copy `Jellyfin.Plugin.DownloadMonitor.dll` to your Jellyfin plugins folder:
   - **Windows**: `%LOCALAPPDATA%\Jellyfin\plugins\DownloadMonitor\`
   - **Linux**: `~/.local/share/jellyfin/plugins/DownloadMonitor/`
   - **Docker**: `/config/plugins/DownloadMonitor/`
4. Restart Jellyfin

### Script Injection (Required)

The plugin injects a script tag into Jellyfin's `index.html`. This happens automatically on Windows installations. For Docker, you may need to add the following to your `index.html`:

```html
<script src="/Plugins/4344669f-555b-4525-b86f-d66dbb9ae81b/inject.js" defer></script>
```

Add this before the closing `</body>` tag.

## Configuration

1. Go to **Dashboard** → **Plugins** → **Download Monitor**
2. Enter your Radarr settings:
   - **Radarr URL**: e.g., `http://localhost:7878`
   - **API Key**: Your Radarr API key
   - **Refresh Interval**: How often to check for updates (in seconds)
3. Save and restart Jellyfin

## Building from Source

### Prerequisites

- [.NET SDK 9.0](https://dotnet.microsoft.com/download/dotnet/9.0)

### Build

```bash
dotnet publish --configuration=Release
```

The compiled plugin will be in `Jellyfin.Plugin.DownloadMonitor/bin/Release/net9.0/publish/`

## Project Structure

```
Jellyfin.Plugin.DownloadMonitor/
├── Configuration/
│   ├── configPage.html        # Plugin settings page
│   └── PluginConfiguration.cs # Settings model
├── Controllers/
│   └── DownloadMonitorController.cs  # Serves inject.js
├── Service/
│   └── DownloadStatusService.cs      # Radarr polling service
├── Web/
│   ├── downloads.html         # Downloads page
│   ├── downloads.js           # Downloads page logic
│   └── inject.js              # Sidebar menu injection
├── Plugin.cs                  # Main plugin class
└── PluginServiceRegistrator.cs # DI registration
```

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Jellyfin](https://jellyfin.org/) - The Free Software Media System
- [Radarr](https://radarr.video/) - Movie collection manager
