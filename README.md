# Mein Kalender

## Dateien
- `index.html` – App-Oberfläche
- `app.js` – Kalenderlogik und Terminverwaltung
- `manifest.webmanifest` – Metadaten für die Installation als Web-App
- `sw.js` – Offline-Cache für die Web-App
- `icon.svg` – App-Symbol

## Schnellstart am Computer
Öffne `index.html` in einem aktuellen Browser. Die Kalenderfunktionen und lokale Speicherung funktionieren direkt.

## Installation als App / Offline-Betrieb
Für die Installation als PWA und den Service Worker muss die App über HTTPS oder `localhost` bereitgestellt werden. Eine lokal per `file://` geöffnete HTML-Datei kann nicht alle Installationsfunktionen nutzen.

Eine einfache Möglichkeit ist, den gesamten Ordner auf einen statischen HTTPS-Webhost hochzuladen. Danach die Website in Chrome/Edge öffnen und „Installieren“ bzw. „Zum Startbildschirm hinzufügen“ auswählen.

## Speicherung und Datenschutz
Termine werden mit `localStorage` im Browser des jeweiligen Geräts gespeichert. Es gibt keine Cloud-Synchronisierung und keinen Server. Browserdaten löschen kann auch die gespeicherten Termine löschen. Export/Import oder Synchronisierung sind in dieser Version nicht enthalten.
