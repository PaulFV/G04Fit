// ============================================================
//  G04Fit — lokaler Entwicklungsserver
//
//  Zweck: die G04Fit-Weboberfläche über http(s)://localhost
//  ausliefern. Das ist nötig für Service Worker, Installation
//  als App (PWA) und Systembenachrichtigungen — all das lässt
//  der Browser beim Öffnen per file:// nicht zu.
//
//  Es werden ausschließlich statische Dateien ausgeliefert.
//  Es gibt keine Datenbank, keine Benutzerkonten und keine
//  Speicherung von Trainingsdaten auf dem Server: G04Fit hält
//  alle Daten laut Konzept lokal im Browser.
// ============================================================

using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.AddFilter("Microsoft.AspNetCore.StaticFiles", LogLevel.Warning);

var app = builder.Build();

// ------------------------------------------------------------
// Wurzelverzeichnis der Weboberfläche suchen.
// Von <Projekt>/src/G04Fit.Server aus liegt sie zwei Ebenen höher.
// ------------------------------------------------------------
var webRoot = FindWebRoot(app.Environment.ContentRootPath);

if (webRoot is null)
{
    app.Logger.LogError(
        "index.html wurde nicht gefunden. Erwartet im Projektstamm oberhalb von {Path}.",
        app.Environment.ContentRootPath);
    return;
}

var files = new PhysicalFileProvider(webRoot);

// .webmanifest ist nicht in der Standardliste enthalten
var contentTypes = new FileExtensionContentTypeProvider();
contentTypes.Mappings[".webmanifest"] = "application/manifest+json";
contentTypes.Mappings[".md"] = "text/markdown; charset=utf-8";

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = files,
    DefaultFileNames = new List<string> { "index.html" }
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = files,
    ContentTypeProvider = contentTypes,
    // Unbekannte Dateitypen (.cs, .csproj, .sln) werden bewusst NICHT ausgeliefert.
    ServeUnknownFileTypes = false,
    OnPrepareResponse = ctx =>
    {
        var headers = ctx.Context.Response.Headers;

        // Während der Entwicklung immer die frische Datei ausliefern
        headers.CacheControl = "no-cache, no-store, must-revalidate";
        headers.Pragma = "no-cache";
        headers.Expires = "0";

        // Der Service Worker darf nicht aus dem Cache kommen
        if (ctx.File.Name.Equals("sw.js", StringComparison.OrdinalIgnoreCase))
        {
            headers["Service-Worker-Allowed"] = "/";
        }
    }
});

// Unbekannte Pfade auf die App zurückführen (Hash-Routing bleibt erhalten)
app.MapFallback(async context =>
{
    var index = Path.Combine(webRoot, "index.html");
    context.Response.ContentType = "text/html; charset=utf-8";
    await context.Response.SendFileAsync(index);
});

app.Lifetime.ApplicationStarted.Register(() =>
{
    var urls = app.Urls.Count > 0 ? string.Join("  ", app.Urls) : "(siehe launchSettings.json)";
    Console.WriteLine();
    Console.WriteLine("  G04Fit v2.1.0 — lokaler Server");
    Console.WriteLine("  ------------------------------------------------");
    Console.WriteLine($"  Inhalt   : {webRoot}");
    Console.WriteLine($"  Erreichbar: {urls}");
    Console.WriteLine();
    Console.WriteLine("  Zum Testen auf dem Handy: gleiches WLAN, dann die");
    Console.WriteLine("  IP dieses Rechners aufrufen (siehe README).");
    Console.WriteLine();
});

app.Run();


// ------------------------------------------------------------
static string? FindWebRoot(string start)
{
    var dir = new DirectoryInfo(start);

    for (var i = 0; i < 6 && dir is not null; i++)
    {
        var candidate = Path.Combine(dir.FullName, "index.html");
        if (File.Exists(candidate) &&
            File.Exists(Path.Combine(dir.FullName, "manifest.webmanifest")))
        {
            return dir.FullName;
        }
        dir = dir.Parent;
    }

    // Rückfallebene für einen veröffentlichten Build
    var published = Path.Combine(start, "wwwroot");
    return File.Exists(Path.Combine(published, "index.html")) ? published : null;
}
