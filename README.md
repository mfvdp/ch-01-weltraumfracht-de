# Weltraumfracht

Hallo! Das ist **Weltraumfracht**, ein Spiel von **Calliope Hacker** für den **Calliope mini 3 mit GameKit**.

Du startest mit einem kleinen Raumschiff und 500 Credits auf der Station LUMA. Flieg von Welt zu Welt, kauf Waren billig
ein und verkauf sie woanders teurer. Nimm Aufträge an: Lieferungen, Rettungen und Jagd auf Piraten. Vom Gewinn baust du
dein Schiff in der Werft aus. Und die Geschichte des Sternenbunds führt dich durch sechs Kapitel. Es gibt 24 Welten zu
entdecken. Im Hangar steht übrigens der Calliope Hacker am Steuerpult.

## So spielst du

- **In den Menüs:** Steuerkreuz = auswählen, A = OK, B = zurück
- **Im Intro:** A oder B überspringt es
- **Bei der ersten Lieferung:** B im Hangar fragt, ob du das Training überspringen willst
- **Im Cockpit:** Steuerkreuz = Fadenkreuz bewegen, A = gewählte Waffe auslösen (Laser, Rakete, Mine)
- **Im Cockpit, nahe einer Rettungskapsel:** A halten zieht sie mit dem Traktorstrahl heran
- **Im Cockpit, B kurz drücken:** Waffe wechseln
- **Im Cockpit, B halten:** ausweichen; lange halten = fliehen (kostet 1 Treibstoff)

## Selbst weiterbauen

Der ganze Quelltext steckt in dieser Spieldatei. Öffne sie in MakeCode Arcade (arcade.makecode.com, „Importieren“).
Fragt der Editor beim Herunterladen nach der Hardware, wähle „Calliope GameKit Shield“. Ändere eine Zahl, starte den
Simulator und schau, was passiert:

- **Mehr Geld am Anfang:** In `modell.ts`, Funktion `neuesSpiel`, steht `credits = 500`. Mit `5000` kaufst du in der
  Werft gleich mehrere Ausbauten.
- **Eigene Namen für die Welten:** In `daten.ts` stehen unter `WELT_NAMEN` die Namen der Welten, zum Beispiel `"LUMA"`.
  Gib ihnen eigene Namen, aber kurze (fast alle im Spiel haben vier Buchstaben); lange Namen passen vielleicht nicht
  in die Zeile.
- **Stärkerer Laser:** In `modell.ts`, Funktion `laserSchaden`, steht `1 + ausbauten[AUSBAU_LASER]`. Mit `3 + ...`
  trifft dein Laser von Anfang an dreimal so stark.

Die Erklärung des Quelltexts für Kinder, Eltern und Lehrkräfte steht auf calliope-hacker.de.