// Hauptprogramm: Start, Spielschleife und Tasten.
// Programmiert vom CALLIOPE HACKER für Calliope mini 3 + GameKit.

let menueWiederholungRichtung = 0
let menueWiederholungMs = 0

function aktualisiereMenueWiederholung(): void {
    if (aktiveSzene == Szene.Flug || aktiveSzene == Szene.Intro || eingabeGesperrt) {
        menueWiederholungRichtung = 0
        return
    }
    let richtung = 0
    if (controller.up.isPressed()) richtung = 1
    else if (controller.down.isPressed()) richtung = 2
    else if (controller.left.isPressed()) richtung = 3
    else if (controller.right.isPressed()) richtung = 4
    if (richtung == 0) {
        menueWiederholungRichtung = 0
        return
    }
    let jetzt = game.runtime()
    if (richtung != menueWiederholungRichtung) {
        menueWiederholungRichtung = richtung
        menueWiederholungMs = jetzt + 350
        return
    }
    if (jetzt < menueWiederholungMs) return
    if (richtung == 1) bearbeiteRichtung(0, -1)
    else if (richtung == 2) bearbeiteRichtung(0, 1)
    else if (richtung == 3) bearbeiteRichtung(-1, 0)
    else bearbeiteRichtung(1, 0)
    menueWiederholungMs = jetzt + 120
}

scene.setBackgroundColor(FARBE_HINTERGRUND)
richteKlangEin()
ladeSpiel()
if (introLaeuftVonSelbst()) starteEingestelltesIntro()
else setzeSzene(Szene.Titel)

game.onPaint(function () {
    merkeAnzeigeBild()
    zeichneAktuelleSzene()
})

game.onUpdate(function () {
    if (eingabeGesperrt && alleTastenLosgelassen()) eingabeGesperrt = false
    aktualisiereIntro()
    aktualisiereFlug()
    aktualisiereKlanglandschaft()
    aktualisiereMenueWiederholung()
    aktualisiereAnzeigeDiagnose()
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    bearbeiteRichtung(0, -1)
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    bearbeiteRichtung(0, 1)
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    bearbeiteRichtung(-1, 0)
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    bearbeiteRichtung(1, 0)
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (aktiveSzene == Szene.Flug) loeseWaffeAus()
    else bearbeiteA()
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (aktiveSzene == Szene.Flug) bearbeiteBImFlug()
    else bearbeiteB()
})
