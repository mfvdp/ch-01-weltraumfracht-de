// Filmreifer Startablauf. Er wird komplett aus Code gezeichnet; das spart Arbeitsspeicher und Flash-Speicher.
const INTRO_EROEFFNUNG_ENDE_MS = 1800
const INTRO_PROLOG_ENDE_MS = 13800
const INTRO_PROLOG_LAENGE_MS = 12000
const INTRO_HANGAR_ENDE_MS = 17100
const INTRO_UMLAUFBAHN_ENDE_MS = 20300
const INTRO_KAMPF_ENDE_MS = 24500
const INTRO_HYPERSPRUNG_ENDE_MS = 27300
const INTRO_ANKUNFT_ENDE_MS = 29800
const INTRO_DAUER_MS = 32100
const INTRO_KARTE_MS = INTRO_ANKUNFT_ENDE_MS - INTRO_EROEFFNUNG_ENDE_MS
const INTRO_MODUS_SCHLUESSEL = "ot.intro.mode"
const INTRO_MODUS_FILM = 0
const INTRO_MODUS_NORMAL = 1
const INTRO_MODUS_UEBERSPRINGEN = 2
// Das Intro läuft bei jedem Start, darum bietet die Titeloption nur FILM und NORMAL an. Setzt man diese Zahl auf 3,
// kommt AUS (INTRO_MODUS_UEBERSPRINGEN) wieder als Wahl im Titelmenü dazu; alle AUS-Wege weiter unten bleiben erhalten.
const ANZAHL_INTRO_MODI = 2

// FILM spielt die logische Zeitleiste von 32,1 s mit Absicht in halber Geschwindigkeit (64,2 s), NORMAL mit zwei
// Dritteln der Geschwindigkeit (48,15 s). Zeichnung, Texte und Klangeinsätze richten sich alle nach der logischen
// Zeitleiste, darum laufen die Modi Szene für Szene nicht auseinander.
const INTRO_FILM_TEMPO_BRUCHZAEHLER = 1
const INTRO_FILM_TEMPO_BRUCHNENNER = 2
const INTRO_NORMAL_TEMPO_BRUCHZAEHLER = 2
const INTRO_NORMAL_TEMPO_BRUCHNENNER = 3
let introBegonnenMs = 0
let introEinsatz = 0
let introGeschichteEinsatz = 0
let introKarteEinsatz = false
let introModus = -1

function liesIntroModus(): number {
    if (introModus >= INTRO_MODUS_FILM && introModus < ANZAHL_INTRO_MODI) return introModus
    if (settings.exists(INTRO_MODUS_SCHLUESSEL)) {
        let gespeichert = Math.round(settings.readNumber(INTRO_MODUS_SCHLUESSEL))
        introModus = gespeichert >= INTRO_MODUS_FILM && gespeichert < ANZAHL_INTRO_MODI ? gespeichert : INTRO_MODUS_FILM
    } else introModus = INTRO_MODUS_FILM
    return introModus
}

function introModusName(): string {
    let modus = liesIntroModus()
    if (modus == INTRO_MODUS_NORMAL) return Texte.t(235)
    if (modus == INTRO_MODUS_UEBERSPRINGEN) return Texte.t(201)
    return Texte.t(477)
}

function wechsleIntroModus(aenderung: number): void {
    let naechste = (liesIntroModus() + aenderung) % ANZAHL_INTRO_MODI
    if (naechste < 0) naechste += ANZAHL_INTRO_MODI
    if (naechste == introModus) return
    introModus = naechste
    settings.writeNumber(INTRO_MODUS_SCHLUESSEL, introModus)
}

function introDauerSekunden(): number {
    let modus = liesIntroModus()
    if (modus == INTRO_MODUS_UEBERSPRINGEN) return 0
    if (modus == INTRO_MODUS_NORMAL) return 48
    return 64
}

// Das Intro läuft bei jedem Start, auch wenn es schon einmal gesehen wurde.
function introLaeuftVonSelbst(): boolean {
    return liesIntroModus() != INTRO_MODUS_UEBERSPRINGEN
}

function starteEingestelltesIntro(): void {
    if (liesIntroModus() == INTRO_MODUS_UEBERSPRINGEN) {
        setzeSzene(Szene.Titel)
        return
    }
    starteIntro()
}

function introNutztFilmTempo(): boolean {
    // Jede Intro-Stufe außer NORMAL läuft im Filmtempo, auch eine Wiederholung, die der Spieler startet, während das
    // Intro auf AUS steht.
    return liesIntroModus() != INTRO_MODUS_NORMAL
}

function starteIntro(): void {
    introBegonnenMs = game.runtime()
    // Die Einsätze 0 (still) und 1 gehören zur Studiokarte, die nach der Ankunft kommt (introKarteEinsatz).
    introEinsatz = 2
    introKarteEinsatz = false
    introGeschichteEinsatz = 0
    aktiveSzene = Szene.Intro
    eingabeGesperrt = false
    klangStarteIntroMusik()
}

function beendeIntro(): void {
    if (aktiveSzene == Szene.Intro) {
        klangTitel()
        setzeSzene(Szene.Titel)
    }
}

// Logische Zeit seit dem Start des Intros, in der Reihenfolge, in der es gezeigt wird.
function introSpielzeit(): number {
    let echteZeit = Math.max(0, game.runtime() - introBegonnenMs)
    if (introNutztFilmTempo())
        return Math.idiv(echteZeit * INTRO_FILM_TEMPO_BRUCHZAEHLER, INTRO_FILM_TEMPO_BRUCHNENNER)
    return Math.idiv(echteZeit * INTRO_NORMAL_TEMPO_BRUCHZAEHLER, INTRO_NORMAL_TEMPO_BRUCHNENNER)
}

// Erst die Geschichte (vom Prolog bis zur Ankunft), dann die Studiokarte "CALLIOPE HACKER PRÄSENTIERT", dann die
// Enthüllung des Titels. Liefert die Stelle auf der ursprünglichen Zeitleiste der Szenen; die Gesamtzeit bleibt 32,1 s.
function introZeit(): number {
    let gespielt = introSpielzeit()
    if (gespielt < INTRO_KARTE_MS) return gespielt + INTRO_EROEFFNUNG_ENDE_MS
    if (gespielt < INTRO_ANKUNFT_ENDE_MS) return gespielt - INTRO_KARTE_MS
    return gespielt
}

function aktualisiereIntro(): void {
    if (aktiveSzene != Szene.Intro) return
    let vergangen = introZeit()
    if (introGeschichteEinsatz == 0 && vergangen >= INTRO_EROEFFNUNG_ENDE_MS + 80) {
        introGeschichteEinsatz = 1
        klangPrologEinsatz(0)
    } else if (introGeschichteEinsatz == 1 && vergangen >= INTRO_EROEFFNUNG_ENDE_MS + 3080) {
        introGeschichteEinsatz = 2
        klangPrologEinsatz(1)
    } else if (introGeschichteEinsatz == 2 && vergangen >= INTRO_EROEFFNUNG_ENDE_MS + 6080) {
        introGeschichteEinsatz = 3
        klangPrologEinsatz(2)
    } else if (introGeschichteEinsatz == 3 && vergangen >= INTRO_EROEFFNUNG_ENDE_MS + 9080) {
        introGeschichteEinsatz = 4
        klangPrologEinsatz(3)
    }

    // Die ursprüngliche Zeitleiste der Szenen pausiert, solange der Prolog gezeigt wird.
    let kinoZeit = vergangen
    if (vergangen >= INTRO_EROEFFNUNG_ENDE_MS && vergangen < INTRO_PROLOG_ENDE_MS)
        kinoZeit = INTRO_EROEFFNUNG_ENDE_MS
    else if (vergangen >= INTRO_PROLOG_ENDE_MS) kinoZeit = vergangen - INTRO_PROLOG_LAENGE_MS
    // Glockenton der Studiokarte 1,1 s nach ihrem Beginn (Einsatz 1).
    if (!introKarteEinsatz && vergangen < INTRO_EROEFFNUNG_ENDE_MS && kinoZeit >= 1100) {
        introKarteEinsatz = true
        klangIntroEinsatz(1)
    }

    if (introEinsatz == 2 && kinoZeit >= 1850) {
        introEinsatz = 3
        klangIntroEinsatz(2)
    } else if (introEinsatz == 3 && kinoZeit >= 3600) {
        introEinsatz = 4
        klangIntroEinsatz(3)
    } else if (introEinsatz == 4 && kinoZeit >= 5000) {
        introEinsatz = 5
        klangIntroEinsatz(4)
    } else if (introEinsatz == 5 && kinoZeit >= 6500) {
        introEinsatz = 6
        klangIntroEinsatz(5)
    } else if (introEinsatz == 6 && kinoZeit >= 8300) {
        introEinsatz = 7
        klangIntroEinsatz(6)
    } else if (introEinsatz == 7 && kinoZeit >= 9300) {
        introEinsatz = 8
        klangIntroEinsatz(7)
    } else if (introEinsatz == 8 && kinoZeit >= 10300) {
        introEinsatz = 9
        klangIntroEinsatz(8)
    } else if (introEinsatz == 9 && kinoZeit >= 11100) {
        introEinsatz = 10
        klangIntroEinsatz(9)
    } else if (introEinsatz == 10 && kinoZeit >= 11900) {
        introEinsatz = 11
        klangIntroEinsatz(10)
    } else if (introEinsatz == 11 && kinoZeit >= 12500) {
        introEinsatz = 12
        klangIntroEinsatz(11)
    } else if (introEinsatz == 12 && kinoZeit >= 13300) {
        introEinsatz = 13
        klangIntroEinsatz(12)
    } else if (introEinsatz == 13 && kinoZeit >= 14100) {
        introEinsatz = 14
        klangIntroEinsatz(13)
    } else if (introEinsatz == 14 && kinoZeit >= 14900) {
        introEinsatz = 15
        klangIntroEinsatz(14)
    } else if (introEinsatz == 15 && kinoZeit >= 15300) {
        introEinsatz = 16
        klangIntroEinsatz(15)
    } else if (introEinsatz == 16 && kinoZeit >= 16600) {
        introEinsatz = 17
        klangIntroEinsatz(16)
    } else if (introEinsatz == 17 && kinoZeit >= 17800) {
        introEinsatz = 18
        klangIntroEinsatz(17)
    } else if (introEinsatz == 18 && kinoZeit >= 18400) {
        introEinsatz = 19
        klangIntroEinsatz(18)
    } else if (introEinsatz == 19 && kinoZeit >= 19100) {
        introEinsatz = 20
        klangIntroEinsatz(19)
    }
    if (vergangen >= INTRO_DAUER_MS) beendeIntro()
}

function zeichneIntroSterne(vergangen: number, tempo: number): void {
    let verschiebung = Math.idiv(vergangen * tempo, 90)
    for (let i = 0; i < 34; i++) {
        let schicht = 1 + i % 3
        let x = (festerZufall(i, 31, 7) + verschiebung * schicht) % 160
        let y = 8 + festerZufall(i, 17, 19) % 99
        let farbe = schicht == 3 ? FARBE_TEXT : (schicht == 2 ? FARBE_TUERKIS : FARBE_GEDIMMT)
        if (tempo >= 3 && i % 3 == 0) screen.drawLine(Math.max(0, x - schicht * 3), y, x, y, farbe)
        else screen.setPixel(x, y, farbe)
    }
}

function zeichneIntroBalken(vergangen: number): void {
    screen.fillRect(0, 0, 160, 7, FARBE_HINTERGRUND)
    screen.fillRect(0, 108, 160, 12, FARBE_HINTERGRUND)
    screen.drawLine(0, 7, 159, 7, FARBE_BLAU)
    screen.drawLine(0, 107, 159, 107, FARBE_BLAU)
    if (vergangen > 350) druckeRechts(Texte.t(478), 157, 111, FARBE_GEDIMMT)
}

function zeichneIntroVorbeiflugSchiff(cx: number, cy: number, groesse: number): void {
    let bugX = cx + 10 * groesse
    let heckX = cx - 8 * groesse
    screen.fillTriangle(bugX, cy, heckX, cy - 5 * groesse, heckX, cy + 5 * groesse, FARBE_GEDIMMT)
    screen.fillTriangle(cx + 2 * groesse, cy, cx - 4 * groesse, cy - 10 * groesse, cx - 1 * groesse, cy - 2 * groesse,
        FARBE_BLAU)
    screen.fillTriangle(cx + 2 * groesse, cy, cx - 4 * groesse, cy + 10 * groesse, cx - 1 * groesse, cy + 2 * groesse,
        FARBE_SCHATTEN)
    screen.fillTriangle(bugX, cy, cx - 1 * groesse, cy, heckX, cy + 5 * groesse, FARBE_BLAU)
    screen.drawLine(heckX, cy - 5 * groesse, bugX, cy, FARBE_TEXT)
    screen.drawLine(heckX, cy + 5 * groesse, bugX, cy, FARBE_TUERKIS)
    screen.fillRect(cx + 2 * groesse, cy - groesse, 3 * groesse, 2 * groesse, FARBE_HINTERGRUND)
    screen.drawLine(heckX, cy - 2 * groesse, heckX - 6 * groesse, cy - 2 * groesse, FARBE_ORANGE)
    screen.drawLine(heckX, cy + 2 * groesse, heckX - 6 * groesse, cy + 2 * groesse, FARBE_GELB)
}

function zeichneIntroKampfSchiff(cx: number, cy: number, groesse: number): void {
    screen.fillTriangle(cx, cy - 9 * groesse, cx - 8 * groesse, cy + 7 * groesse, cx + 8 * groesse, cy + 7 * groesse,
        FARBE_GEDIMMT)
    screen.fillTriangle(cx, cy - 5 * groesse, cx, cy + 8 * groesse, cx + 8 * groesse, cy + 7 * groesse, FARBE_BLAU)
    screen.fillTriangle(cx - 2 * groesse, cy, cx - 11 * groesse, cy + 5 * groesse, cx - 4 * groesse, cy + 5 * groesse,
        FARBE_METALL)
    screen.fillTriangle(cx + 2 * groesse, cy, cx + 11 * groesse, cy + 5 * groesse, cx + 4 * groesse, cy + 5 * groesse,
        FARBE_METALL)
    screen.drawLine(cx, cy - 9 * groesse, cx, cy + 7 * groesse, FARBE_TUERKIS)
    screen.fillRect(cx - groesse, cy - 3 * groesse, 3 * groesse, 3 * groesse, FARBE_HINTERGRUND)
    screen.drawLine(cx - 4 * groesse, cy + 7 * groesse, cx - 4 * groesse, cy + 12 * groesse, FARBE_ORANGE)
    screen.drawLine(cx + 4 * groesse, cy + 7 * groesse, cx + 4 * groesse, cy + 12 * groesse, FARBE_GELB)
}

function zeichneIntroGegner(cx: number, cy: number, groesse: number): void {
    screen.fillTriangle(cx, cy + 6 * groesse, cx - 7 * groesse, cy - 5 * groesse, cx + 7 * groesse, cy - 5 * groesse,
        FARBE_ROT)
    screen.fillTriangle(cx, cy + 2 * groesse, cx - 10 * groesse, cy - 2 * groesse, cx - 3 * groesse, cy - 4 * groesse,
        FARBE_LILA)
    screen.fillTriangle(cx, cy + 2 * groesse, cx + 10 * groesse, cy - 2 * groesse, cx + 3 * groesse, cy - 4 * groesse,
        FARBE_LILA)
    screen.setPixel(cx, cy, FARBE_GELB)
}

function zeichneIntroStartSchiff(cx: number, cy: number, halbeBreite: number, laenge: number,
    schub: number): void {
    let bugY = cy - laenge
    let heckY = cy + Math.idiv(laenge, 2)
    screen.fillTriangle(cx, bugY, cx - halbeBreite, heckY, cx + halbeBreite, heckY, FARBE_GEDIMMT)
    screen.fillTriangle(cx, bugY + 3, cx, heckY, cx + halbeBreite, heckY, FARBE_BLAU)
    screen.fillTriangle(cx - 3, cy, cx - halbeBreite - 5, heckY - 3, cx -
        halbeBreite + 3, heckY - 4, FARBE_METALL)
    screen.fillTriangle(cx + 3, cy, cx + halbeBreite + 5, heckY - 3, cx +
        halbeBreite - 3, heckY - 4, FARBE_METALL)
    screen.drawLine(cx, bugY, cx, heckY, FARBE_TUERKIS)
    screen.fillRect(cx - 2, bugY + Math.idiv(laenge, 3), 5, 5, FARBE_HINTERGRUND)
    screen.drawLine(cx - Math.idiv(halbeBreite, 3), heckY, cx - Math.idiv(halbeBreite, 3), heckY + schub,
        FARBE_ORANGE)
    screen.drawLine(cx + Math.idiv(halbeBreite, 3), heckY, cx + Math.idiv(halbeBreite, 3), heckY + schub,
        FARBE_GELB)
}

function zeichneIntroStation(cx: number, cy: number, puls: number): void {
    screen.drawCircle(cx, cy, 13, FARBE_TUERKIS)
    screen.drawCircle(cx, cy, 10, FARBE_BLAU)
    screen.drawLine(cx - 20, cy, cx + 20, cy, FARBE_GEDIMMT)
    screen.drawLine(cx, cy - 16, cx, cy + 16, FARBE_METALL)
    screen.fillRect(cx - 4, cy - 4, 9, 9, FARBE_SCHATTEN)
    screen.drawRect(cx - 4, cy - 4, 9, 9, FARBE_TEXT)
    screen.fillRect(cx - 25, cy - 3, 8, 7, FARBE_BLAU)
    screen.fillRect(cx + 18, cy - 3, 8, 7, FARBE_BLAU)
    screen.setPixel(cx - 13, cy, puls == 0 ? FARBE_GELB : FARBE_ROT)
    screen.setPixel(cx + 13, cy, puls == 0 ? FARBE_ROT : FARBE_GELB)
}

function zeichneIntroRettungskapsel(cx: number, cy: number): void {
    screen.fillRect(cx - 3, cy - 4, 7, 9, FARBE_GEDIMMT)
    screen.drawRect(cx - 3, cy - 4, 7, 9, FARBE_TUERKIS)
    screen.setPixel(cx, cy - 1, FARBE_GRUEN)
    screen.drawLine(cx - 2, cy + 5, cx - 4, cy + 8, FARBE_ORANGE)
    screen.drawLine(cx + 2, cy + 5, cx + 4, cy + 8, FARBE_ORANGE)
}

function zeichneIntroExplosion(cx: number, cy: number, alter: number, maxRadius: number): void {
    let radius = Math.min(maxRadius, 2 + Math.idiv(alter, 42))
    screen.fillCircle(cx, cy, radius, FARBE_ORANGE)
    screen.fillCircle(cx, cy, Math.max(1, radius - 4), FARBE_GELB)
    screen.setPixel(cx, cy, FARBE_TEXT)
    screen.drawLine(cx - radius - 4, cy, cx + radius + 4, cy, FARBE_ROT)
    screen.drawLine(cx, cy - radius - 4, cx, cy + radius + 4, FARBE_ORANGE)
    screen.drawLine(cx - radius, cy - radius, cx + radius, cy + radius, FARBE_GELB)
    screen.drawLine(cx + radius, cy - radius, cx - radius, cy + radius, FARBE_GELB)
}

function introWeltY(welt: number): number {
    return 13 + Math.idiv(WELT_Y[welt] * 58, 110)
}

function zeichneIntroGeschichteAufstieg(szenenZeit: number): void {
    if (szenenZeit < 80) {
        screen.fill(FARBE_TUERKIS)
        return
    }
    screen.fill(FARBE_HINTERGRUND)
    zeichneIntroSterne(szenenZeit, 1)
    let gezeigt =
        Math.clamp(0, ANZAHL_OEFFENTLICHER_WELTEN, Math.idiv((szenenZeit - 120) * ANZAHL_OEFFENTLICHER_WELTEN, 1550))
    for (let i = 0; i < gezeigt; i++) {
        let x = WELT_X[i]
        let y = introWeltY(i)
        if (i % 6 != 0 && i - 1 < gezeigt)
            screen.drawLine(WELT_X[i - 1], introWeltY(i - 1), x, y, FARBE_BLAU)
        if (i >= 6 && i % 2 == 0 && i - 6 < gezeigt)
            screen.drawLine(WELT_X[i - 6], introWeltY(i - 6), x, y, FARBE_GEDIMMT)
        screen.fillCircle(x, y, i % 5 == 0 ? 2 : 1, i % 4 == 0 ? FARBE_GELB : FARBE_TUERKIS)
    }
    if (szenenZeit < 1050) {
        introUntertitel(Texte.t(479), 84, FARBE_GRUEN)
        introUntertitel(Texte.t(480), 96, FARBE_TEXT)
    } else {
        introUntertitel(Texte.t(481), 90, FARBE_GELB)
    }
}

function zeichneIntroGeschichteZerfall(szenenZeit: number): void {
    if (szenenZeit < 80) {
        screen.fill(FARBE_ROT)
        return
    }
    screen.fill(FARBE_HINTERGRUND)
    zeichneIntroSterne(szenenZeit, 1)
    for (let i = 0; i < ANZAHL_OEFFENTLICHER_WELTEN; i++) {
        let x = WELT_X[i]
        let y = introWeltY(i)
        let gescheitertMs = 350 + festerZufall(i, 83, 17) % 1800
        let lebt = szenenZeit < gescheitertMs
        if (i % 6 != 0) {
            let px = WELT_X[i - 1]
            let py = introWeltY(i - 1)
            if (lebt) screen.drawLine(px, py, x, y, FARBE_BLAU)
            else {
                screen.drawLine(px, py, Math.idiv(px + x, 2) - 2, Math.idiv(py + y, 2), FARBE_ROT)
                screen.drawLine(Math.idiv(px + x, 2) + 3, Math.idiv(py + y, 2), x, y, FARBE_ROSTBRAUN)
            }
        }
        screen.fillCircle(x, y, i % 5 == 0 ? 2 : 1, lebt ? FARBE_TUERKIS :
            (i % 3 == 0 ? FARBE_ROT : FARBE_GEDIMMT))
    }
    let scanX = Math.idiv(szenenZeit * 180, 3000) - 10
    screen.drawLine(scanX, 8, scanX, 78, FARBE_ROT)
    if (szenenZeit >= 900 && szenenZeit < 2050) zeichneIntroExplosion(80, 43, szenenZeit - 900, 13)
    if (szenenZeit < 1000) introUntertitel(Texte.t(482), 88, FARBE_GELB)
    else if (szenenZeit < 2050) introUntertitel(Texte.t(483), 91, FARBE_ROT)
    else introUntertitel(Texte.t(484), 91, FARBE_TEXT)
}

function zeichneIntroGeschichtePiraten(szenenZeit: number): void {
    if (szenenZeit < 80) {
        screen.fill(FARBE_ROT)
        return
    }
    screen.fill(FARBE_HINTERGRUND)
    zeichneIntroSterne(szenenZeit, 2)
    for (let i = 0; i < 9; i++) {
        let routeX = 8 + i * 18
        screen.drawLine(routeX, 78 - i * 5, routeX + 10, 75 - i * 5, i < 5 ? FARBE_GEDIMMT : FARBE_ROT)
    }
    let schiffX = 48 + Math.idiv(szenenZeit * 45, 3000)
    zeichneIntroVorbeiflugSchiff(schiffX, 62, 2)
    let gegnerFortschritt = Math.clamp(0, 1000, Math.idiv((szenenZeit - 380) * 1000, 1050))
    let gegner1X = 170 - Math.idiv(gegnerFortschritt * 50, 1000)
    let gegner2X = -12 + Math.idiv(gegnerFortschritt * 47, 1000)
    zeichneIntroGegner(gegner1X, 30, 1)
    if (szenenZeit >= 650) zeichneIntroGegner(gegner2X, 43, 1)
    if (szenenZeit >= 1050 && szenenZeit < 2100) {
        screen.drawLine(gegner1X - 2, 35, schiffX + 8, 55, FARBE_ROT)
        screen.drawLine(gegner2X + 2, 48, schiffX - 7, 58, FARBE_ORANGE)
        let schild = 19 + Math.idiv(szenenZeit, 90) % 3
        zeichneVorschauRaute(schiffX, 62, schild, 13, FARBE_TUERKIS)
    }
    if (szenenZeit >= 2050 && szenenZeit < 2750) zeichneIntroExplosion(gegner2X, 43, szenenZeit - 2050, 11)
    if (szenenZeit < 950) introUntertitel(Texte.t(485), 13, FARBE_GEDIMMT)
    else if (szenenZeit < 2050) introUntertitel(Texte.t(486), 13, FARBE_ROT)
    else introUntertitel(Texte.t(487), 93, FARBE_GELB)
}

function zeichneIntroGeschichteErbe(szenenZeit: number): void {
    if (szenenZeit < 80) {
        screen.fill(FARBE_TUERKIS)
        return
    }
    if (szenenZeit >= 2880) {
        screen.fill(FARBE_HINTERGRUND)
        return
    }
    screen.fill(FARBE_HINTERGRUND)
    fuelleHangarViereck(0, 8, 159, 8, 124, 107, 36, 107, FARBE_BLAU)
    screen.fillTriangle(80, 12, 35, 107, 125, 107, FARBE_SCHATTEN)
    screen.fillRect(0, 75, 160, 33, FARBE_SCHATTEN)
    screen.drawLine(80, 50, 15, 107, FARBE_GEDIMMT)
    screen.drawLine(80, 50, 145, 107, FARBE_GEDIMMT)
    screen.drawLine(80, 50, 80, 107, FARBE_METALL)
    screen.drawLine(50, 76, 110, 76, FARBE_GEDIMMT)
    screen.drawLine(31, 92, 129, 92, FARBE_GEDIMMT)
    let schub = szenenZeit >= 2150 ? 12 : (szenenZeit >= 1500 ? 5 : 1)
    zeichneIntroStartSchiff(80, 67, 19, 25, schub)
    let puls = Math.idiv(szenenZeit, 180) % 2
    screen.fillRect(21, 93, 3, 3, puls == 0 ? FARBE_GELB : FARBE_TUERKIS)
    screen.fillRect(136, 93, 3, 3, puls == 0 ? FARBE_TUERKIS : FARBE_GELB)
    screen.fillRect(5, 29, 31, 18, FARBE_HINTERGRUND)
    screen.drawRect(5, 29, 31, 18, FARBE_TUERKIS)
    druckeSpielText("LUMA", 9, 32, FARBE_GRUEN)
    introUntertitel(Texte.t(488), 40, FARBE_GELB)
    if (szenenZeit < 950) introUntertitel(Texte.t(489), 13, FARBE_TEXT)
    else if (szenenZeit < 1850) introUntertitel(Texte.t(490), 13, FARBE_GELB)
    else {
        screen.fillRect(14, 86, 132, 20, FARBE_HINTERGRUND)
        if (szenenZeit < 2450) introUntertitel(Texte.t(491), 91, FARBE_TEXT)
        else introUntertitel(Texte.t(492), 91, FARBE_GELB)
    }
}

function zeichneIntroProlog(szenenZeit: number): void {
    if (szenenZeit < 3000) zeichneIntroGeschichteAufstieg(szenenZeit)
    else if (szenenZeit < 6000) zeichneIntroGeschichteZerfall(szenenZeit - 3000)
    else if (szenenZeit < 9000) zeichneIntroGeschichtePiraten(szenenZeit - 6000)
    else zeichneIntroGeschichteErbe(szenenZeit - 9000)
}

function zeichneIntroHangar(szenenZeit: number): void {
    screen.fill(FARBE_HINTERGRUND)
    zeichneIntroSterne(szenenZeit, 1)

    // Riesige Startbucht mit einem Tor, das sich zum Weltraum öffnet.
    fuelleHangarViereck(0, 8, 159, 8, 119, 35, 40, 35, FARBE_BLAU)
    screen.drawLine(0, 15, 159, 15, FARBE_METALL)
    screen.drawLine(15, 25, 145, 25, FARBE_METALL)
    screen.drawLine(0, 8, 48, 35, FARBE_GEDIMMT)
    screen.drawLine(40, 8, 64, 35, FARBE_GEDIMMT)
    screen.drawLine(80, 8, 80, 35, FARBE_GEDIMMT)
    screen.drawLine(120, 8, 96, 35, FARBE_GEDIMMT)
    screen.drawLine(159, 8, 112, 35, FARBE_GEDIMMT)
    screen.fillRect(40, 20, 80, 45, FARBE_ROSTBRAUN)
    screen.fillRect(46, 24, 68, 38, FARBE_HINTERGRUND)
    for (let i = 0; i < 8; i++) {
        screen.setPixel(51 + festerZufall(i, 9, 4) % 58, 28 + festerZufall(i, 4, 12) % 27,
            i % 3 == 0 ? FARBE_TUERKIS : FARBE_TEXT)
    }

    let torOffen = Math.clamp(0, 27, Math.idiv((szenenZeit - 220) * 27, 1400))
    let torBreite = 34 - torOffen
    screen.fillRect(46, 24, torBreite, 38, FARBE_SCHATTEN)
    screen.fillRect(114 - torBreite, 24, torBreite, 38, FARBE_SCHATTEN)
    screen.drawLine(46 + torBreite, 24, 46 + torBreite, 61, FARBE_TUERKIS)
    screen.drawLine(113 - torBreite, 24, 113 - torBreite, 61, FARBE_TUERKIS)
    screen.drawRect(40, 20, 80, 45, FARBE_GEDIMMT)

    screen.fillRect(0, 62, 160, 46, FARBE_SCHATTEN)
    fuelleHangarViereck(68, 62, 92, 62, 136, 108, 24, 108, FARBE_METALL)
    fuelleHangarViereck(75, 62, 85, 62, 111, 108, 49, 108, FARBE_BLAU)
    screen.drawLine(80, 61, 0, 108, FARBE_GEDIMMT)
    screen.drawLine(80, 61, 32, 108, FARBE_GEDIMMT)
    screen.drawLine(80, 61, 80, 108, FARBE_GEDIMMT)
    screen.drawLine(80, 61, 128, 108, FARBE_GEDIMMT)
    screen.drawLine(80, 61, 159, 108, FARBE_GEDIMMT)
    screen.drawLine(58, 74, 102, 74, FARBE_GEDIMMT)
    screen.drawLine(40, 88, 120, 88, FARBE_GEDIMMT)
    screen.drawLine(21, 103, 139, 103, FARBE_GEDIMMT)

    let startFortschritt = Math.clamp(0, 1000, Math.idiv((szenenZeit - 900) * 1000, 2200))
    let schiffY = 92 - Math.idiv(startFortschritt * 43, 1000)
    let schiffsBreite = 18 - Math.idiv(startFortschritt * 10, 1000)
    let schiffsLaenge = 22 - Math.idiv(startFortschritt * 12, 1000)
    let schub = 5 + Math.idiv(startFortschritt * 12, 1000)
    zeichneIntroStartSchiff(80, schiffY, schiffsBreite, schiffsLaenge, schub)

    let lichtPhase = Math.idiv(szenenZeit, 150) % 2
    screen.fillRect(44, 96, 3, 2, lichtPhase == 0 ? FARBE_GELB : FARBE_ROT)
    screen.fillRect(113, 96, 3, 2, lichtPhase == 0 ? FARBE_ROT : FARBE_GELB)
    screen.fillRect(59, 80, 2, 2, lichtPhase == 0 ? FARBE_TUERKIS : FARBE_GELB)
    screen.fillRect(99, 80, 2, 2, lichtPhase == 0 ? FARBE_GELB : FARBE_TUERKIS)
    if (szenenZeit < 1050) introUntertitel(Texte.t(493), 12, FARBE_GRUEN)
    else if (szenenZeit < 2300) introUntertitel(Texte.t(494), 12, FARBE_GELB)
    else introUntertitel(Texte.t(495), 12, FARBE_TUERKIS)

    // Zwei Träger im Vordergrund stehen vor dem Schiff und verstärken den Eindruck von Tiefe.
    screen.fillRect(0, 31, 7, 77, FARBE_ROSTBRAUN)
    screen.fillRect(153, 31, 7, 77, FARBE_ROSTBRAUN)
    screen.drawLine(0, 42, 7, 49, FARBE_METALL)
    screen.drawLine(153, 49, 159, 42, FARBE_METALL)
    if (szenenZeit >= 3180 && szenenZeit < 3240) screen.fill(FARBE_TUERKIS)
    else if (szenenZeit >= 3240) screen.fill(FARBE_TEXT)
}

// Der Calliope Hacker am Schreibtisch, von hinten gesehen (Kapuze auf, türkise Turnschuhe, Calliope mini mit GameKit,
// schlafende Katze): eine Pixelkopie der Figur in der Palette dieses Spiels.
const HACKER_KARTE = img`
    . . . . . . . . . . . . . . . . f f f f f . . . . . . . . . . . . . . . 8 . . . . . . . . . . . . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . f f f f f f f 9 . . . . . 8 . 8 . c c c c c c c c c c c c c c c c c c c c c c . . . . . . . . . . .
    . . . . . . . . . . . . . f c c f f f f f f 9 . 8 . 8 . 8 . 8 f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f c f f f f f f f f f 9 . 8 . 8 8 8 8 f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f c f f f f f f f f f 9 8 8 8 8 8 8 8 f f f 9 9 9 9 9 9 f f f f f f f f f f f f f . 8 . . . . . . . . .
    . . . . . . . . . . . f c f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f f f 8 . 8 . . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f 5 5 5 5 5 5 5 5 5 f f f f f f f f . 8 . 8 . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f f f 8 8 8 . 8 . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f 6 6 6 6 6 f f f f f f f f f f f f 8 8 8 8 . 8 . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f f f 8 8 5 5 8 . 8 5 5 . .
    . . . . . . . . . . . c f f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f f f 2 2 2 2 2 2 2 2 f f f f f f f 8 8 5 8 8 8 8 8 5 . .
    . . . . . . . . . . f f c f f f f f f f f f f f f 9 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f f f 8 8 8 8 8 8 8 8 8 8 .
    . . . . . . . . . f f f f c c f f f f f f f f f f f 9 8 8 8 8 f f f f f 9 9 9 9 9 9 9 9 9 9 9 f f f f f f 5 8 8 8 2 8 2 8 8 8 5
    . . . . . . f f f f f f f f f c c c c f f f f f f f f 9 8 8 8 f f f f f f f f f f f f f f f f f f f f f f 5 8 8 8 2 2 2 8 8 8 5
    . . . . . f 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 8 8 f f f 8 8 8 8 f f f f f f f f f f f f f f f 8 8 8 8 8 2 8 8 8 8 .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 8 f f f f f f f f f f f f f f f f f f f f f f 8 8 5 8 8 8 8 8 5 . 8
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f c f f f f 9 f f f f f f f f f f f f f f f f f f f f f f 8 8 5 5 8 f 8 5 5 8 .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f c f f f f 9 8 8 8 8 8 8 8 8 8 c c c 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 . 8 . .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f c f f f f f 4 4 8 8 8 c c c c c c c c c 8 8 8 8 8 8 8 8 8 8 8 8 . 8 . 8 .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f c f f f f 4 4 f f f e e e e e e e e e e e e e e e e e e e e e e e e e e
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 8 c 9 c 6 c 2 c f e e e e e e e e e e f f f f f f f f f f f f e e e e
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f f 1 f f b c b f 2 f 2 f f e e e
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 1 1 f f f f f 2 f 2 f f e e e
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 f f f f f f f f f f e e e e
    . . . . . f 6 6 6 6 6 6 f f f f f f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e
    . . . . . f 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f f f f f c e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e
    . . . . . . f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f f f f f f f f f 8 8 8 8 8 8 8 8 8 8 8 c c 8 8 . 8 . 8 . 8 . . c b b b b b b
    . . . . . . . f f f f f f f f f f f f f f f f f f f f f f f f f f f 8 8 8 8 8 8 8 8 8 8 8 c c 8 . 8 . 8 . . . . . c b b b b b b
    . . . . . . . . . . . . . . . . . f f . f f f f f . 8 f f f f f c . 8 . 8 . 8 . 8 . 8 . 8 c c . 8 . . . . . . . . c b b b b b b
    . . . . . . . . . . . . . . . . . f f . f f f f f . . 8 f f f f c 8 . 8 . 8 . 8 . 8 . 8 . c c . . 6 6 6 6 6 . . . c b c c c c b
    . . . . . . . . . . . . . . . . . f f . f f f f f . . . f f f f c . . . 8 . . . . . . . . c c . 6 6 6 6 6 6 6 . . c b b b b b b
    . . . . . . . . . . . . . . . . . f f 6 6 6 6 6 6 6 . . f f f f c . . . . . . . . . . . . c c . 6 6 f f f 6 6 . . c b b b b b b
    . . f . . . f . . . . . . . . . . f f 6 1 6 6 6 6 6 . . f f f f c . . . . . . . . . . . . c c . 6 6 6 6 6 6 6 . . c b b b b b b
    . . f f . f f . . . . . . . . . . f f 1 1 1 1 1 1 1 . . f f f f c . . . . . . . . . . . . c c . 6 6 6 6 6 6 6 . . c b c c c c b
    . f 1 1 1 1 1 f 1 1 . . . . . . . f f . . . . . . . . 6 6 6 6 6 6 6 6 . . . . . . . . . . c c . 6 6 c c c 6 6 . . c b b b b b b
    . 1 1 f 1 1 1 1 1 1 1 f f f f f f f f f f f f f f . 6 6 1 6 6 6 6 6 6 6 . . . . . . . . . c c . 6 6 6 6 6 6 6 . . c b b b b b b
    f 1 1 1 1 1 1 f f 1 1 . . . . f f . . . . . . f f . 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . c c . 6 6 6 6 6 6 6 . . c b b b b b b
    6 6 6 6 6 6 6 6 6 6 6 . . . . c c . . . . . . c c . . . . . . . . . . . . . . . . . . . . c c . . 6 6 6 6 6 . . . c b c c c c b
    . 6 6 6 6 6 6 6 6 6 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . c b b b b b b
    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . c b b b b b b
`

// Studiokarte "CALLIOPE HACKER PRÄSENTIERT"; sie erscheint nach der Ankunft, direkt vor der Enthüllung des Titels.
function zeichneIntroEroeffnung(vergangen: number): void {
    screen.fill(FARBE_HINTERGRUND)
    zeichneIntroSterne(vergangen, 1)
    screen.fillRect(47, 9, 66, 42, FARBE_BLAU)
    screen.drawTransparentImage(HACKER_KARTE, 48, 10)
    let halbeLinie = Math.clamp(0, 59, Math.idiv((vergangen - 120) * 59, 500))
    screen.drawLine(80 - halbeLinie, 53, 80 + halbeLinie, 53, FARBE_TUERKIS)
    screen.drawLine(80 - halbeLinie, 80, 80 + halbeLinie, 80, FARBE_BLAU)
    if (vergangen >= 280) {
        druckeSpielText("CALLIOPE HACKER", 35, 60, FARBE_TEXT)
        let sichtbar = Math.clamp(0, 90, Math.idiv((vergangen - 280) * 90, 620))
        if (sichtbar < 90) screen.fillRect(35 + sichtbar, 59, 90 - sichtbar, 10, FARBE_HINTERGRUND)
    }
    if (vergangen >= 930) introUntertitel(Texte.t(496), 72, FARBE_GRUEN)
    if (vergangen >= 1600) {
        let wischer = Math.clamp(0, 80, Math.idiv((vergangen - 1600) * 80, 200))
        screen.fillRect(0, 8, wischer, 99, FARBE_HINTERGRUND)
        screen.fillRect(160 - wischer, 8, wischer, 99, FARBE_HINTERGRUND)
    }
}

function zeichneIntroUmlaufbahn(szenenZeit: number): void {
    screen.fill(FARBE_HINTERGRUND)
    zeichneIntroSterne(szenenZeit, 2)

    // Eine blaue Welt und ihre Handelsstation in der Umlaufbahn füllen das Panorama.
    screen.fillCircle(137, 109, 51, FARBE_TUERKIS)
    screen.fillCircle(139, 110, 47, FARBE_BLAU)
    screen.fillTriangle(113, 88, 128, 84, 124, 99, FARBE_SCHATTEN)
    screen.fillTriangle(139, 77, 158, 80, 150, 93, FARBE_SCHATTEN)
    screen.fillTriangle(142, 104, 159, 98, 159, 119, FARBE_SCHATTEN)
    screen.drawLine(100, 91, 158, 79, FARBE_GEDIMMT)
    screen.drawLine(94, 99, 159, 87, FARBE_METALL)
    screen.setPixel(116, 80, FARBE_GELB)
    screen.setPixel(127, 73, FARBE_GELB)
    screen.setPixel(151, 69, FARBE_GELB)
    zeichneIntroStation(113, 34, Math.idiv(szenenZeit, 180) % 2)
    screen.drawLine(113, 48, 117, 64, FARBE_GEDIMMT)
    screen.drawLine(117, 64, 121, 75, FARBE_TUERKIS)

    let fortschritt = Math.clamp(0, 1000, Math.idiv(szenenZeit * 1000, 3100))
    let schiffX = -18 + Math.idiv(fortschritt * 202, 1000)
    let schiffY = 45 + Math.idiv(fortschritt * 23, 1000)
    let schiffsGroesse = 1 + Math.min(2, Math.idiv(fortschritt, 350))
    zeichneIntroVorbeiflugSchiff(schiffX, schiffY, schiffsGroesse)

    if (szenenZeit >= 350 && szenenZeit < 1850) {
        screen.fillRect(5, 91, 150, 10, FARBE_HINTERGRUND)
        screen.drawLine(5, 90, 154, 90, FARBE_BLAU)
        introUntertitel(Texte.t(497), 94, FARBE_TEXT)
    } else if (szenenZeit >= 1850 && szenenZeit < 2900) {
        screen.fillRect(5, 91, 150, 10, FARBE_HINTERGRUND)
        screen.drawLine(5, 90, 154, 90, FARBE_BLAU)
        introUntertitel(Texte.t(498), 94, FARBE_GELB)
    }
    if (szenenZeit >= 2650) {
        let warnung = Math.idiv(szenenZeit, 110) % 2 == 0 ? FARBE_ROT : FARBE_GELB
        screen.fillRect(145, 18, 3, 3, warnung)
        screen.fillRect(151, 25, 3, 3, warnung)
        screen.fillRect(142, 32, 3, 3, warnung)
    }
}

function zeichneIntroWarpStreifen(szenenZeit: number): void {
    for (let i = 0; i < 24; i++) {
        let randX = festerZufall(i, 71, 13) % 160
        let randY = 8 + festerZufall(i, 43, 29) % 99
        let phase = (Math.idiv(szenenZeit, 42) + i * 3) % 12
        let anfang = 2 + phase
        let ende = Math.min(14, anfang + 3)
        let x0 = 80 + Math.idiv((randX - 80) * anfang, 14)
        let y0 = 58 + Math.idiv((randY - 58) * anfang, 14)
        let x1 = 80 + Math.idiv((randX - 80) * ende, 14)
        let y1 = 58 + Math.idiv((randY - 58) * ende, 14)
        screen.drawLine(x0, y0, x1, y1, i % 3 == 0 ? FARBE_TUERKIS : FARBE_GEDIMMT)
    }
}

function zeichneIntroKampf(szenenZeit: number): void {
    if (szenenZeit >= 3900) {
        if (szenenZeit < 4010) screen.fill(FARBE_TEXT)
        else if (szenenZeit < 4120) screen.fill(FARBE_TUERKIS)
        else screen.fill(FARBE_HINTERGRUND)
        return
    }

    screen.fill(FARBE_HINTERGRUND)
    zeichneIntroSterne(szenenZeit, 3)
    let wackelX = 0
    let wackelY = 0
    if (szenenZeit >= 850 && szenenZeit < 1750) {
        wackelX = festerZufall(Math.idiv(szenenZeit, 35), 3, 7) % 3 - 1
        wackelY = festerZufall(Math.idiv(szenenZeit, 41), 5, 9) % 3 - 1
    }

    let figurX = 80
    if (szenenZeit >= 2100 && szenenZeit < 2750) figurX += Math.idiv((szenenZeit - 2100) * 16, 650)
    else if (szenenZeit >= 2750 && szenenZeit < 3400) figurX += 16 - Math.idiv((szenenZeit - 2750) * 16, 650)
    let figurY = 80

    let gegner1Fortschritt = Math.clamp(0, 1000, Math.idiv(szenenZeit * 1000, 700))
    let gegner1X = 168 - Math.idiv(gegner1Fortschritt * 45, 1000)
    let gegner1Y = 22 + Math.idiv(gegner1Fortschritt * 14, 1000)
    let gegner2Fortschritt = Math.clamp(0, 1000, Math.idiv((szenenZeit - 450) * 1000, 750))
    let gegner2X = -15 + Math.idiv(gegner2Fortschritt * 52, 1000)
    let gegner2Y = 29 + Math.idiv(gegner2Fortschritt * 15, 1000)
    let gegner3Fortschritt = Math.clamp(0, 1000, Math.idiv((szenenZeit - 2200) * 1000, 800))
    let gegner3X = 132 - Math.idiv(gegner3Fortschritt * 27, 1000)
    let gegner3Y = -12 + Math.idiv(gegner3Fortschritt * 41, 1000)

    if (szenenZeit < 1900) zeichneIntroGegner(gegner1X, gegner1Y, 1)
    if (szenenZeit >= 450 && szenenZeit < 3200) zeichneIntroGegner(gegner2X, gegner2Y, 1)
    if (szenenZeit >= 2200) zeichneIntroGegner(gegner3X, gegner3Y, szenenZeit >= 3450 ? 2 : 1)
    zeichneIntroKampfSchiff(figurX + wackelX, figurY + wackelY, 2)

    if (szenenZeit >= 700 && szenenZeit < 1450) {
        screen.drawLine(gegner1X, gegner1Y + 5, figurX - 5 + wackelX, figurY - 14 + wackelY, FARBE_ROT)
        screen.drawLine(gegner1X + 3, gegner1Y + 5, figurX + 6 + wackelX, figurY - 13 + wackelY, FARBE_ORANGE)
        if (szenenZeit >= 950)
            screen.drawLine(gegner2X, gegner2Y + 5, figurX - 10 + wackelX, figurY - 9 + wackelY, FARBE_ROT)
    }
    if (szenenZeit >= 850 && szenenZeit < 1700) {
        let schildPuls = Math.idiv(szenenZeit, 65) % 3
        zeichneVorschauRaute(figurX + wackelX, figurY - 2 + wackelY, 24 +
            schildPuls, 16 + schildPuls, FARBE_TUERKIS)
        zeichneVorschauRaute(figurX + wackelX, figurY - 2 + wackelY, 30 +
            schildPuls, 20 + schildPuls,
            schildPuls == 0 ? FARBE_TEXT : FARBE_BLAU)
    }
    if (szenenZeit >= 1450 && szenenZeit < 2200) {
        screen.drawLine(figurX - 7 + wackelX, figurY - 17 + wackelY, gegner1X - 2, gegner1Y + 6, FARBE_TUERKIS)
        screen.drawLine(figurX + 7 + wackelX, figurY - 17 + wackelY, gegner1X + 2, gegner1Y + 6, FARBE_GELB)
    }
    if (szenenZeit >= 1900 && szenenZeit < 2600) zeichneIntroExplosion(123, 36, szenenZeit - 1900, 15)

    if (szenenZeit >= 2250 && szenenZeit < 3500) {
        zeichneIntroRettungskapsel(74, 39)
        if (szenenZeit >= 2600) {
            screen.drawLine(figurX - 4, figurY - 14, 71, 47, FARBE_GRUEN)
            screen.drawLine(figurX + 4, figurY - 14, 77, 47, FARBE_TUERKIS)
        }
    }
    if (szenenZeit >= 2350 && szenenZeit < 2900)
        screen.drawLine(gegner2X, gegner2Y + 5, figurX - 7, figurY - 13, FARBE_ROT)
    if (szenenZeit >= 2880 && szenenZeit < 3380) {
        screen.drawLine(figurX - 6, figurY - 17, gegner2X - 2, gegner2Y + 6, FARBE_TUERKIS)
        screen.drawLine(figurX + 6, figurY - 17, gegner2X + 2, gegner2Y + 6, FARBE_GELB)
    }
    if (szenenZeit >= 3200 && szenenZeit < 3890) zeichneIntroExplosion(37, 44, szenenZeit - 3200, 14)
    if (szenenZeit >= 3450 && szenenZeit < 3890) {
        screen.drawLine(gegner3X - 4, gegner3Y + 8, figurX, figurY - 15, FARBE_ROT)
        screen.drawLine(gegner3X + 4, gegner3Y + 8, figurX + 8, figurY - 13, FARBE_ORANGE)
    }

    if (szenenZeit < 850) introUntertitel(Texte.t(499), 12, FARBE_ROT)
    else if (szenenZeit >= 2250 && szenenZeit < 3500) introUntertitel(Texte.t(500), 12, FARBE_TUERKIS)
    else if (szenenZeit >= 3500) introUntertitel(Texte.t(501), 12, FARBE_GELB)
}

function zeichneIntroHypersprung(szenenZeit: number): void {
    if (szenenZeit < 80) {
        screen.fill(FARBE_TUERKIS)
        return
    }
    if (szenenZeit >= 2600) {
        if (szenenZeit < 2700) screen.fill(FARBE_TEXT)
        else screen.fill(FARBE_TUERKIS)
        return
    }

    screen.fill(FARBE_HINTERGRUND)
    let fortschritt = Math.clamp(0, 1000, Math.idiv(szenenZeit * 1000, 2600))
    zeichneIntroWarpStreifen(szenenZeit * (2 + Math.idiv(fortschritt, 330)))
    for (let i = 0; i < 3; i++) {
        let ringPhase = (fortschritt + i * 330) % 1000
        let ring = 8 + Math.idiv(ringPhase * 66, 1000)
        let ringHoehe = 5 + Math.idiv(ring * 3, 5)
        zeichneVorschauRaute(80, 56, ring, ringHoehe, i == 0 ? FARBE_TEXT :
            (i == 1 ? FARBE_TUERKIS : FARBE_BLAU))
    }

    let schiffY = 82 - Math.idiv(fortschritt * 25, 1000)
    let schiffsBreite = 12 - Math.idiv(fortschritt * 6, 1000)
    let schiffsLaenge = 16 - Math.idiv(fortschritt * 8, 1000)
    zeichneIntroStartSchiff(80, schiffY, schiffsBreite, schiffsLaenge, 8 +
        Math.idiv(fortschritt * 8, 1000))
    if (szenenZeit >= 250 && szenenZeit < 1250) introUntertitel(Texte.t(502), 14, FARBE_GRUEN)
    else if (szenenZeit >= 1250) introUntertitel(Texte.t(503), 14, FARBE_GELB)
}

function zeichneIntroAnkunft(szenenZeit: number): void {
    if (szenenZeit < 90) {
        screen.fill(FARBE_TEXT)
        return
    }
    if (szenenZeit < 170) {
        screen.fill(FARBE_TUERKIS)
        return
    }

    screen.fill(FARBE_HINTERGRUND)
    zeichneIntroSterne(szenenZeit, 1)

    // Sonnenaufgang über einem Planeten, unter einer gewaltigen Raumstation.
    screen.fillCircle(80, 147, 74, FARBE_ORANGE)
    screen.drawCircle(80, 147, 75, FARBE_GELB)
    screen.drawCircle(80, 147, 72, FARBE_ROSTBRAUN)
    screen.drawLine(23, 94, 137, 94, FARBE_ROSTBRAUN)
    screen.drawLine(16, 103, 144, 103, FARBE_GELB)

    screen.drawLine(10, 42, 35, 29, FARBE_TUERKIS)
    screen.drawLine(35, 29, 80, 22, FARBE_GEDIMMT)
    screen.drawLine(80, 22, 125, 29, FARBE_GEDIMMT)
    screen.drawLine(125, 29, 150, 42, FARBE_TUERKIS)
    screen.drawLine(150, 42, 125, 56, FARBE_BLAU)
    screen.drawLine(125, 56, 80, 62, FARBE_GEDIMMT)
    screen.drawLine(80, 62, 35, 56, FARBE_GEDIMMT)
    screen.drawLine(35, 56, 10, 42, FARBE_BLAU)
    screen.drawLine(24, 42, 45, 34, FARBE_METALL)
    screen.drawLine(45, 34, 80, 29, FARBE_METALL)
    screen.drawLine(80, 29, 115, 34, FARBE_METALL)
    screen.drawLine(115, 34, 136, 42, FARBE_METALL)
    screen.drawLine(136, 42, 115, 50, FARBE_METALL)
    screen.drawLine(115, 50, 80, 55, FARBE_METALL)
    screen.drawLine(80, 55, 45, 50, FARBE_METALL)
    screen.drawLine(45, 50, 24, 42, FARBE_METALL)
    screen.fillRect(77, 12, 7, 60, FARBE_SCHATTEN)
    screen.drawRect(77, 12, 7, 60, FARBE_TEXT)
    screen.drawLine(18, 107, 70, 59, FARBE_TUERKIS)
    screen.drawLine(142, 107, 90, 59, FARBE_TUERKIS)
    screen.drawLine(48, 107, 75, 62, FARBE_BLAU)
    screen.drawLine(112, 107, 85, 62, FARBE_BLAU)

    let lichtFarbe = Math.idiv(szenenZeit, 140) % 2 == 0 ? FARBE_GELB : FARBE_TUERKIS
    screen.setPixel(24, 42, lichtFarbe)
    screen.setPixel(45, 34, lichtFarbe)
    screen.setPixel(115, 34, lichtFarbe)
    screen.setPixel(136, 42, lichtFarbe)
    screen.setPixel(80, 22, FARBE_ROT)
    screen.setPixel(80, 62, FARBE_GRUEN)

    let ankunftFortschritt = Math.clamp(0, 1000, Math.idiv((szenenZeit - 250) * 1000, 1900))
    let schiffY = 101 - Math.idiv(ankunftFortschritt * 36, 1000)
    zeichneIntroStartSchiff(80, schiffY, 6, 8, 5)
    if (szenenZeit >= 750 && szenenZeit < 1500) {
        screen.fillRect(38, 79, 84, 12, FARBE_HINTERGRUND)
        introUntertitel(Texte.t(504), 81, FARBE_GELB)
    } else if (szenenZeit >= 1500) {
        screen.fillRect(20, 93, 120, 10, FARBE_HINTERGRUND)
        introUntertitel(Texte.t(505), 96, FARBE_TEXT)
    }
}

function zeichneIntroTitelEnthuellung(szenenZeit: number): void {
    if (szenenZeit < 90) {
        screen.fill(FARBE_TEXT)
        return
    }
    if (szenenZeit < 170) {
        screen.fill(FARBE_TUERKIS)
        return
    }

    if (szenenZeit >= 2300) {
        zeichneTitel()
        return
    }

    // Von hier an benutzen Sternenfeld und Logo genau die Koordinaten des Titelbilds.
    screen.fill(FARBE_HINTERGRUND)
    for (let i = 0; i < 22; i++) {
        let x = festerZufall(i, 3, 9) % 160
        let y = festerZufall(i, 7, 2) % 105
        screen.setPixel(x, y, i % 4 == 0 ? FARBE_TUERKIS : FARBE_GEDIMMT)
    }
    if (szenenZeit < 500) {
        let warpRing = Math.max(2, 37 - Math.idiv((szenenZeit - 170) * 35, 330))
        screen.drawCircle(80, 57, warpRing, FARBE_TUERKIS)
        if (warpRing > 5) screen.drawCircle(80, 57, warpRing - 3, FARBE_BLAU)
    }
    let halbeLinie = Math.clamp(0, 58, Math.idiv((szenenZeit - 180) * 58, 520))
    screen.drawLine(80 - halbeLinie, 35, 80 + halbeLinie, 35, FARBE_TUERKIS)
    screen.drawLine(80 - halbeLinie, 70, 80 + halbeLinie, 70, FARBE_TUERKIS)

    if (szenenZeit >= 330) druckeSpielText("CALLIOPE HACKER", 35, 11, FARBE_GRUEN)
    if (szenenZeit >= 500) {
        zeichneSpielTitel(41, 14)
        screen.drawLine(68, 78, 80, 72, FARBE_GRUEN)
        screen.drawLine(80, 72, 92, 78, FARBE_GRUEN)
        screen.drawLine(92, 78, 80, 84, FARBE_GRUEN)
        screen.drawLine(80, 84, 68, 78, FARBE_GRUEN)
    }
    if (szenenZeit >= 1180 && szenenZeit < 2100) introUntertitel(Texte.t(506), 89, FARBE_TEXT)
    if (szenenZeit >= 1750 && szenenZeit < 2100) introUntertitel(Texte.t(507), 99, FARBE_GELB)
}

function zeichneIntro(): void {
    let vergangen = introZeit()
    if (vergangen < INTRO_EROEFFNUNG_ENDE_MS) zeichneIntroEroeffnung(vergangen)
    else if (vergangen < INTRO_PROLOG_ENDE_MS) zeichneIntroProlog(vergangen - INTRO_EROEFFNUNG_ENDE_MS)
    else if (vergangen < INTRO_HANGAR_ENDE_MS) zeichneIntroHangar(vergangen - INTRO_PROLOG_ENDE_MS)
    else if (vergangen < INTRO_UMLAUFBAHN_ENDE_MS) zeichneIntroUmlaufbahn(vergangen - INTRO_HANGAR_ENDE_MS)
    else if (vergangen < INTRO_KAMPF_ENDE_MS) zeichneIntroKampf(vergangen - INTRO_UMLAUFBAHN_ENDE_MS)
    else if (vergangen < INTRO_HYPERSPRUNG_ENDE_MS) zeichneIntroHypersprung(vergangen - INTRO_KAMPF_ENDE_MS)
    else if (vergangen < INTRO_ANKUNFT_ENDE_MS) zeichneIntroAnkunft(vergangen - INTRO_HYPERSPRUNG_ENDE_MS)
    else zeichneIntroTitelEnthuellung(vergangen - INTRO_ANKUNFT_ENDE_MS)
    // Der Hinweis zum Überspringen folgt der Spielzeit, darum bleibt er an, wenn die Studiokarte beginnt.
    if (vergangen < INTRO_ANKUNFT_ENDE_MS + 2300) zeichneIntroBalken(introSpielzeit())
}

function introUntertitel(text: string, y: number, farbe: number): void {
    druckeSpielText(text, Math.max(2, Math.idiv(160 - text.length * 6, 2)), y, farbe)
}
