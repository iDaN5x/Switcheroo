#include <gtk/gtk.h>
#include <webkit2/webkit2.h>

static void destroy_window_cb(GtkWidget *widget, GtkWidget *window);
static gboolean close_web_view_cb(WebKitWebView *web_view, GtkWidget *window);

int main(int argc, char* argv[]) {
    // Initialize GTK.
    gtk_init(&argc, &argv);

    // Create a new GTK window for the browser.
    GtkWidget* browser_window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
    gtk_window_set_default_size(GTK_WINDOW(browser_window), 1024, 768);
    gtk_window_set_title(GTK_WINDOW(browser_window), "Switcheroo - Nintendo Switch JailBreak Demo");

    // Create a web view.
    WebKitWebView *web_view = WEBKIT_WEB_VIEW(webkit_web_view_new());

    // Simulate Nintendo Switch User-Agent.
    WebKitSettings* settings = webkit_settings_new();
    webkit_settings_set_user_agent(settings, "Nintendo Switch");
    webkit_web_view_set_settings(web_view, settings);

    // Put the web view in the browser window.
    gtk_container_add(GTK_CONTAINER(browser_window), GTK_WIDGET(web_view));

    // Set window destroy event callback.
    g_signal_connect(browser_window, "destroy", G_CALLBACK(destroy_window_cb), NULL);

    // Set web view close event callback.
    g_signal_connect(web_view, "close", G_CALLBACK(close_web_view_cb), browser_window);

    // Load exploit demo page.
    webkit_web_view_load_uri(web_view, "https://idan5x.github.io/Switcheroo/");

    // Give focus to web view.
    gtk_widget_grab_focus(GTK_WIDGET(web_view));

    // Make browser window visible.
    gtk_widget_show_all(browser_window);

    // Run the GTK application.
    gtk_main();

    return 0;
}

void destroy_window_cb(GtkWidget *widget, GtkWidget *window) {
    gtk_main_quit();
}

gboolean close_web_view_cb(WebKitWebView *web_view, GtkWidget *window) {
    gtk_widget_destroy(window);
    return TRUE;
}
