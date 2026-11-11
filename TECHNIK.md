# Technik: Weltraumfracht

Hier steht kurz, wie der Quelltext aufgebaut ist und wie du ihn baust. Die Begrüßung und die ersten Ideen zum Umbauen
stehen in `README.md`.

## Aufbau

Das ist ein Projekt für MakeCode Arcade, geschrieben in TypeScript. `pxt.json` nennt den Projektnamen
`weltraumfracht` und alle Dateien in der Reihenfolge, in der MakeCode sie liest. `mkc.json` sagt, für welches Gerät
gebaut wird: den Calliope mini 3 mit GameKit (Variante „n3“).

Die Dateien des Spiels:

- `texte.ts`: Diese Datei holt die Texte des Spiels aus einem Katalog über feste Nummern (t(Nummer)).
- `daten.ts`: Die festen Daten des Spiels: Welten, Waren, Schiffe, Aufträge und die Kampagne.
- `modell.ts`: Die Regeln und der Zustand des Spiels: Markt, Aufträge, Kampagne und Erfolge.
- `speichern.ts`: Speichern und Laden: zwei automatische Plätze und ein Platz zum Speichern von Hand.
- `bildschirme.ts`: Alle Bildschirme und Menüs und was die Tasten auf jedem davon tun.
- `intro.ts`: Filmreifer Startablauf.
- `flug.ts`: Der Flug zwischen zwei Welten: Phasen, Begegnungen, Kämpfe, Rettung und Andocken.
- `ton.ts`: Zentraler Klangentwurf für den Lautsprecher des Calliope mini 3 und des GameKits.
- `main.ts`: Hauptprogramm: Start, Spielschleife und Tasten.

## So läuft das Spiel

1. Beim Start entpackt `texte.ts` den Textkatalog. Dann richtet `main.ts` den Ton ein (`richteKlangEin`) und lädt mit
   `ladeSpiel` den neuesten gültigen Spielstand.
2. `starteEingestelltesIntro` spielt das Intro: die Geschichte, die Studiokarte des Calliope Hackers und den Titel. A
   oder B überspringt es. Danach öffnet `setzeSzene` den Titelbildschirm.
3. In jedem Bild zeichnet `zeichneAktuelleSzene` den aktiven Bildschirm (`Szene`): Titel, Hangar, Markt, Werft,
   Missionen, Sternkarte, Status oder den Flug.
4. In jedem Spieltakt ruft `game.onUpdate` `aktualisiereIntro`, `aktualisiereFlug`, `aktualisiereKlanglandschaft` und
   `aktualisiereMenueWiederholung` auf.
5. Die Tasten kommen in `bearbeiteRichtung`, `bearbeiteA` und `bearbeiteB` an. Was sie tun, hängt vom aktiven Bildschirm
   ab; im Flug löst A die gewählte Waffe aus, B wechselt sie.

Es gibt 24 Welten, zu denen du fliegen kannst (dazu zwei versteckte), und 12 Sorten Waren. Die Kampagne hat 6 Missionen.
Die festen Daten (Welten, Waren, Schiffe, Missionen) stehen in `daten.ts`; die Regeln und den Zustand des Spiels führt
`modell.ts`.

## Texte und Ton

Alle Texte stehen gepackt in einem Katalog in `texte.ts`. Das Spiel holt einen Text über seine Nummer, zum Beispiel
`Texte.t(247)` für das Wort WERFT. Welches Wort zu einer Nummer gehört, siehst du am schnellsten im Simulator. Musik
und Klänge erzeugt `ton.ts` ohne die große Musikbibliothek, das spart Flash-Speicher.

## Speichern

`speichern.ts` schreibt den Spielstand in die Einstellungen des Calliope: zwei automatische Plätze und ein Platz zum
Speichern von Hand, jeder mit Prüfsumme. Die Einstellungen gehören zu diesem Projektnamen, darum liest ein anderes Spiel
sie nie. Wenn du ein anderes Programm aufspielst, löscht MakeCode beim nächsten Start den gespeicherten Spielstand.

## Bauen

- **Im Browser:** Öffne arcade.makecode.com, wähle „Importieren“ und öffne die Spieldatei `weltraumfracht.hex`. In
  der Spieldatei steckt der ganze Quelltext. Der Simulator zeigt das Spiel sofort.
- **Am Computer:** Mit dem Kommandozeilenwerkzeug von MakeCode (npm-Paket `makecode`) rufst du in diesem Ordner
  `makecode build` auf. Die Spieldatei für das Gerät liegt danach in `built/n3/binary.hex`.

## Auf das Gerät

Steck den Calliope mini 3 mit dem USB-Kabel an den Computer. Er erscheint als Laufwerk. Zieh die Spieldatei (`.hex`) auf
dieses Laufwerk; danach startet das Spiel von selbst. Der Bildschirm des GameKit hat 160 × 120 Pixel und 16 Farben. Das
Spiel ist groß und braucht fast den ganzen Flash-Speicher des Calliope; Änderungen mit viel neuem Code können die
Spieldatei zu groß machen.

Dieses Spiel gibt es auch auf Englisch, Französisch und Spanisch. Alle vier Fassungen entstehen aus demselben
Ausgangsprojekt.