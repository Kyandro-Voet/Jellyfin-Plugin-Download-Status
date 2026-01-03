using System;
using System.IO;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.DownloadMonitor.Helpers;

/// <summary>
/// Transformation callback for File Transformation plugin.
/// Injects the Download Monitor script into index.html.
/// </summary>
public static class IndexHtmlTransformation
{
    private const string PluginId = "4344669f-555b-4525-b86f-d66dbb9ae81b";
    private const string ScriptTag = "<script src=\"/Plugins/" + PluginId + "/inject.js\" defer></script>";

    /// <summary>
    /// Transform method called by File Transformation plugin.
    /// The plugin passes a dynamic object and expects a string back.
    /// </summary>
    /// <param name="request">The request object containing the file contents as dynamic.</param>
    /// <returns>The modified HTML content as a string.</returns>
    public static string Transform(dynamic request)
    {
        try
        {
            // The request should have a "contents" property with the HTML
            string contents = request.contents?.ToString() ?? string.Empty;

            // If no contents or empty, return as-is
            if (string.IsNullOrEmpty(contents))
            {
                return contents;
            }

            // Check if script is already injected
            if (contents.Contains(PluginId, StringComparison.Ordinal))
            {
                return contents;
            }

            // Inject before </head>
            if (contents.Contains("</head>", StringComparison.Ordinal))
            {
                return contents.Replace("</head>", ScriptTag + "</head>", StringComparison.Ordinal);
            }

            // Fallback: inject before </body>
            if (contents.Contains("</body>", StringComparison.Ordinal))
            {
                return contents.Replace("</body>", ScriptTag + "</body>", StringComparison.Ordinal);
            }

            return contents;
        }
        catch (Exception)
        {
            // On any error, try to return original contents
            try
            {
                return request?.contents?.ToString() ?? string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }
    }
}
