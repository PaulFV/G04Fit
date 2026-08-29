// ============================================================
//  GoFit Desktop — Fensteranwendung
//
//  Zeigt die GoFit-Oberfläche in einem eigenen Fenster an.
//  Der Ordner mit index.html wird als virtueller Host
//  https://gofit.local eingebunden. Damit gilt die App als
//  sicherer Kontext: localStorage, Service Worker und
//  Benachrichtigungen funktionieren — anders als beim Öffnen
//  per file://.
//
//  Es läuft kein Webserver und es gehen keine Daten nach außen.
//  Trainingsdaten liegen im lokalen Speicher der WebView, der
//  im Benutzerprofil unter GoFit abgelegt wird.
// ============================================================

using System.Diagnostics;
using System.IO;
using System.Windows;
using System.Windows.Input;
using Microsoft.Web.WebView2.Core;

namespace GoFit.Desktop;

public partial class MainWindow : Window
{
    private const string VirtualHost = "gofit.local";
    private const string StartUrl = "https://gofit.local/index.html";

    private string? _appFolder;

    public MainWindow()
    {
        InitializeComponent();
        Loaded += OnLoaded;
        PreviewKeyDown += OnKeyDown;
    }

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        _appFolder = FindAppFolder();

        if (_appFolder is null)
        {
            Fail("Die GoFit-Dateien wurden nicht gefunden.\n\n" +
                 "Erwartet wird index.html im Projektstamm, also oberhalb von src\\GoFit.Desktop.");
            return;
        }

        try
        {
            // Benutzerdaten der WebView im Benutzerprofil ablegen,
            // damit sie einen Neubau des Projekts überstehen.
            var dataFolder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "GoFit", "WebView2");
            Directory.CreateDirectory(dataFolder);

            var env = await CoreWebView2Environment.CreateAsync(null, dataFolder);
            await Web.EnsureCoreWebView2Async(env);
        }
        catch (WebView2RuntimeNotFoundException)
        {
            Fail("Die WebView2-Laufzeitumgebung fehlt.\n\n" +
                 "Sie ist in Windows 11 normalerweise vorhanden. " +
                 "Andernfalls kostenlos bei Microsoft herunterladen: " +
                 "Suche nach \"WebView2 Runtime\".\n\n" +
                 "Alternative ohne WebView2: das Projekt GoFit.Server starten " +
                 "und http://localhost:5181 im Browser öffnen.");
            return;
        }
        catch (Exception ex)
        {
            Fail("WebView2 konnte nicht gestartet werden.\n\n" + ex.Message);
            return;
        }

        var core = Web.CoreWebView2;

        // Den App-Ordner als virtuellen Host einbinden (nur lesend).
        core.SetVirtualHostNameToFolderMapping(
            VirtualHost, _appFolder, CoreWebView2HostResourceAccessKind.Allow);

        core.Settings.AreDefaultContextMenusEnabled = true;
        core.Settings.AreDevToolsEnabled = true;
        core.Settings.IsStatusBarEnabled = false;
        core.Settings.IsZoomControlEnabled = true;
        core.Settings.IsSwipeNavigationEnabled = false;
        core.Settings.UserAgent += " GoFitDesktop/1.0.0";

        // Benachrichtigungen ohne Rückfrage zulassen — es handelt sich um
        // die eigene lokale Anwendung, die Einwilligung wird in GoFit selbst
        // eingeholt.
        core.PermissionRequested += (_, args) =>
        {
            if (args.PermissionKind == CoreWebView2PermissionKind.Notifications)
                args.State = CoreWebView2PermissionState.Allow;
        };

        // Externe Links im Standardbrowser öffnen, nicht im App-Fenster.
        core.NewWindowRequested += (_, args) =>
        {
            args.Handled = true;
            OpenExternal(args.Uri);
        };

        core.NavigationStarting += (_, args) =>
        {
            if (args.Uri.StartsWith("https://" + VirtualHost, StringComparison.OrdinalIgnoreCase))
                return;
            if (args.Uri.StartsWith("about:", StringComparison.OrdinalIgnoreCase))
                return;

            args.Cancel = true;
            OpenExternal(args.Uri);
        };

        core.DocumentTitleChanged += (_, _) =>
        {
            Title = string.IsNullOrWhiteSpace(core.DocumentTitle) ? "GoFit" : core.DocumentTitle;
        };

        Web.NavigationCompleted += (_, args) =>
        {
            if (!args.IsSuccess)
            {
                Fail("Die Oberfläche konnte nicht geladen werden.\n\n" +
                     "Ordner: " + _appFolder + "\n" +
                     "Status: " + args.WebErrorStatus);
                return;
            }
            SplashPanel.Visibility = Visibility.Collapsed;
            Web.Visibility = Visibility.Visible;
        };

        core.Navigate(StartUrl);
    }

    private void OnKeyDown(object sender, KeyEventArgs e)
    {
        if (Web.CoreWebView2 is null) return;

        switch (e.Key)
        {
            case Key.F5:
                Web.CoreWebView2.Reload();
                e.Handled = true;
                break;

            case Key.F12:
                Web.CoreWebView2.OpenDevToolsWindow();
                e.Handled = true;
                break;

            case Key.F11:
                WindowState = WindowState == WindowState.Maximized
                    ? WindowState.Normal
                    : WindowState.Maximized;
                e.Handled = true;
                break;
        }
    }

    private void Fail(string message)
    {
        SplashText.Text = message;
        Web.Visibility = Visibility.Collapsed;
        SplashPanel.Visibility = Visibility.Visible;
    }

    private static void OpenExternal(string uri)
    {
        if (!uri.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
            !uri.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return;

        try
        {
            Process.Start(new ProcessStartInfo(uri) { UseShellExecute = true });
        }
        catch
        {
            // Kein Standardbrowser verfügbar – dann passiert einfach nichts.
        }
    }

    /// <summary>
    /// Sucht ausgehend vom Ausgabeverzeichnis nach oben den Ordner,
    /// der index.html und manifest.webmanifest enthält.
    /// </summary>
    private static string? FindAppFolder()
    {
        // 1) Neben der Anwendung (veröffentlichter Build)
        var local = Path.Combine(AppContext.BaseDirectory, "app");
        if (File.Exists(Path.Combine(local, "index.html")))
            return local;

        // 2) Aufwärts im Projektbaum (Start aus Visual Studio)
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        for (var i = 0; i < 8 && dir is not null; i++)
        {
            if (File.Exists(Path.Combine(dir.FullName, "index.html")) &&
                File.Exists(Path.Combine(dir.FullName, "manifest.webmanifest")))
                return dir.FullName;

            dir = dir.Parent;
        }

        return null;
    }
}
