// Alle Bildschirme und Menüs und was die Tasten auf jedem davon tun.
const FARBE_HINTERGRUND = 15
const FARBE_TEXT = 1
const FARBE_ROT = 2
const FARBE_ORANGE = 4
const FARBE_GELB = 5
const FARBE_GRUEN = 7
const FARBE_BLAU = 8
const FARBE_TUERKIS = 9
const FARBE_LILA = 10
const FARBE_METALL = 11
const FARBE_SCHATTEN = 12
const FARBE_GEDIMMT = 13
const FARBE_ROSTBRAUN = 14

const HANGAR_EINTRAEGE = hex`f630f7f8f9fafbfcfdfe`
const ANZAHL_TITEL_EINTRAEGE = 10
const WERFT_SCHIFF_STELLE = ANZAHL_AUSBAUTEN + 2
const WERFT_NAME_STELLE = WERFT_SCHIFF_STELLE + 1
const WERFT_LACK_STELLE = WERFT_NAME_STELLE + 1
const WERFT_RAKETE_STELLE = WERFT_LACK_STELLE + 1
const WERFT_MINE_STELLE = WERFT_RAKETE_STELLE + 1
const ANZAHL_WERFT_EINTRAEGE = WERFT_MINE_STELLE + 1
const ANZAHL_STATUS_SEITEN = 7
const STATUS_SCHIFF = 0
const STATUS_FRAKTIONEN = 1
const STATUS_LOGBUCH = 2
const STATUS_ERFOLGE = 3
const STATUS_OPTIONEN = 4
const STATUS_HARDWARE = 5
const STATUS_ENTWICKLER = 6
let karteCursorWelt = 0
let werftEingebautNummer = -1
let werftRolleVorschau = Schiffsrolle.Kaufmann
let marktRueckmeldungText = ""
let marktRueckmeldungFarbe = FARBE_GEDIMMT
let marktRueckmeldungBisMs = 0
let istSchwarzmarkt = false
let missionsVerhandlung = 0
let statusSeite = STATUS_SCHIFF
let statusCursor = 0
let erfolgCursor = 0
let letzteRouteZiel = -1
let anzeigeBilder = 0
let anzeigeFps = 0
let anzeigeBildFensterMs = 0
let anzeigeLetzteFreiBytes = 0
let anzeigeMinFreiBytes = 0
let statusRueckkehrSzene = Szene.Hangar
let bestaetigungNeuesSpielPlus = false
let karteVorherigeRouteZiel = 0
let hardwareBGetestet = false
let meldungBildSchluessel = ""
let meldungEnthuellungBegonnen = 0

function merkeAnzeigeBild(): void {
    anzeigeBilder++
}

function aktualisiereAnzeigeDiagnose(): void {
    let jetzt = game.runtime()
    if (anzeigeBildFensterMs == 0) anzeigeBildFensterMs = jetzt
    if (jetzt - anzeigeBildFensterMs < 1000) return
    anzeigeFps = Math.idiv(anzeigeBilder * 1000, Math.max(1, jetzt - anzeigeBildFensterMs))
    anzeigeBilder = 0
    anzeigeBildFensterMs = jetzt
    if (entwicklerModus) {
        // gcStats() liefert im Simulator null; dann behält die Seite die letzten Werte.
        let statistik = control.gcStats()
        if (statistik) {
            anzeigeLetzteFreiBytes = statistik.lastFreeBytes
            anzeigeMinFreiBytes = statistik.minFreeBytes
        }
    }
}

function jaNeinText(wert: number): string {
    return wert != 0 ? Texte.t(255) : Texte.t(201)
}

function stationAkzentFarbe(): number {
    let farben = [FARBE_GRUEN, FARBE_ORANGE, FARBE_TUERKIS, FARBE_LILA, FARBE_GELB, FARBE_METALL]
    return farben[WELT_WIRTSCHAFT[aktuelleWelt] % farben.length]
}

function stationDunkelFarbe(): number {
    let farben = [FARBE_SCHATTEN, FARBE_ROSTBRAUN, FARBE_BLAU, FARBE_SCHATTEN, FARBE_ROSTBRAUN, FARBE_BLAU]
    return farben[WELT_WIRTSCHAFT[aktuelleWelt] % farben.length]
}

function schiffsLackFarbe(): number {
    let farben = [FARBE_BLAU, FARBE_ROT, FARBE_GRUEN, FARBE_GELB, FARBE_LILA, FARBE_METALL]
    return farben[schiffsLack[schiffsrolle] % farben.length]
}

function besuchteWeltenAnzahlAnzeige(): number {
    let anzahl = 0
    for (let i = 0; i < ANZAHL_WELTEN; i++) if (istWeltBesucht(i)) anzahl++
    return anzahl
}

function meldungSichtbareZeichen(): number {
    let verzoegerung = textTempo == 0 ? 85 : (textTempo == 2 ? 20 : 45)
    return Math.idiv(Math.max(0, game.runtime() - meldungEnthuellungBegonnen), verzoegerung)
}

function meldungZeileTeil(text: string, versatz: number): string {
    let anzahl = Math.clamp(0, text.length, meldungSichtbareZeichen() - versatz)
    return text.substr(0, anzahl)
}

function druckeRechts(text: string, rechts: number, y: number, farbe: number): void {
    druckeSpielText(text, rechts - text.length * 6, y, farbe)
}

function zeichneKopfzeile(titel: string): void {
    screen.fill(FARBE_HINTERGRUND)
    screen.fillRect(0, 0, 160, 13, hoherKontrast ? FARBE_HINTERGRUND : FARBE_BLAU)
    if (hoherKontrast) screen.drawRect(0, 0, 160, 13, FARBE_TEXT)
    druckeSpielText(titel, 3, 3, hoherKontrast ? FARBE_GELB : FARBE_TEXT)
    druckeRechts(Texte.t(256) + credits, 157, 3, FARBE_GELB)
}

function zeichneFusszeile(links: string, rechts: string): void {
    screen.fillRect(0, 108, 160, 12, hoherKontrast ? FARBE_HINTERGRUND : FARBE_BLAU)
    if (hoherKontrast) screen.drawRect(0, 108, 160, 12, FARBE_TEXT)
    druckeSpielText(links, 3, 111, hoherKontrast ? FARBE_GELB : FARBE_TEXT)
    druckeRechts(rechts, 157, 111, hoherKontrast ? FARBE_GELB : FARBE_TEXT)
}

function zeichneAuswahl(y: number, hoehe: number): void {
    screen.fillRect(2, y - 1, 156, hoehe, hoherKontrast ? FARBE_BLAU : FARBE_LILA)
}

function kuerzeText(text: string, maxZeichen: number): string {
    if (text.length <= maxZeichen) return text
    // Lange Beschriftungen bleiben ganz lesbar: An jedem Ende kurz warten, dazwischen läuft der Text durch.
    let entfernung = text.length - maxZeichen
    let phase = Math.idiv(game.runtime(), 220) % (entfernung * 2 + 12)
    let versatz = phase < 6 ? 0
        : (phase < entfernung + 6 ? phase - 6 : (phase < entfernung + 12 ? entfernung : entfernung * 2 + 12 - phase))
    return text.substr(versatz, maxZeichen)
}

function istTitelModusAenderbar(): boolean {
    return !hatSpielstand || kampagnenStufe >= ANZAHL_KAMPAGNENMISSIONEN
}

function spielModusVonStelle(stelle: number): SpielModus {
    if (stelle == 1) return SpielModus.Veteran
    if (stelle == 2) return SpielModus.Eisern
    return SpielModus.Standard
}

function wechsleTitelModus(aenderung: number): void {
    let naechste = (spielModus + aenderung) % 3
    if (naechste < 0) naechste += 3
    spielModus = spielModusVonStelle(naechste)
    if (hatSpielstand) schreibeSpielstand()
}

function titelEintragText(stelle: number): string {
    if (stelle == 0) return hatSpielstand ? Texte.t(257) : Texte.t(254)
    if (stelle == 1) return Texte.t(258) + introModusName()
    if (stelle == 2) return introDauerSekunden() > 0
        ? Texte.t(259) + introDauerSekunden() + Texte.t(260) : Texte.t(261)
    if (stelle == 3) return Texte.t(262) + klangrasteName()
    if (stelle == 4) return Texte.t(263) + effektDichteName()
    if (stelle == 5) return Texte.t(264) + spielModusName(spielModus)
    if (stelle == 6) return Texte.t(265)
    if (stelle == 7) return Texte.t(266)
    if (stelle == 8) return Texte.t(267)
    return Texte.t(268)
}

// Name des Spiels auf dem Titelbild und im Intro: Zeile 1 und Zeile 2, getrennt durch "|".
const SPIEL_TITEL = "WELTRAUM|FRACHT"  // Titel in zwei Zeilen

// Zeichnet den Namen des Spiels mittig: Zeile 1 bei y, Zeile 2 luecke Pixel darunter.
function zeichneSpielTitel(y: number, luecke: number): void {
    let trennstelle = SPIEL_TITEL.indexOf("|")
    let ersteZeile = trennstelle < 0 ? SPIEL_TITEL : SPIEL_TITEL.substr(0, trennstelle)
    druckeSpielText(ersteZeile, 80 - 3 * ersteZeile.length, y, FARBE_GELB)
    if (trennstelle < 0) return
    let zweiteZeile = SPIEL_TITEL.substr(trennstelle + 1)
    druckeSpielText(zweiteZeile, 80 - 3 * zweiteZeile.length, y + luecke, FARBE_GELB)
}

function zeichneTitel(): void {
    screen.fill(FARBE_HINTERGRUND)
    for (let i = 0; i < 22; i++) {
        let x = festerZufall(i, 3, 9) % 160
        let y = festerZufall(i, 7, 2) % 105
        screen.setPixel(x, y, i % 4 == 0 ? FARBE_TUERKIS : FARBE_GEDIMMT)
    }
    druckeSpielText("CALLIOPE HACKER", 35, 2, FARBE_GRUEN)
    screen.drawLine(25, 13, 135, 13, FARBE_TUERKIS)
    screen.drawLine(25, 43, 135, 43, FARBE_TUERKIS)
    zeichneSpielTitel(16, 13)
    screen.drawLine(73, 49, 80, 45, FARBE_GRUEN)
    screen.drawLine(80, 45, 87, 49, FARBE_GRUEN)
    screen.drawLine(87, 49, 80, 53, FARBE_GRUEN)
    screen.drawLine(80, 53, 73, 49, FARBE_GRUEN)

    if (menueStelle < ersteSichtbareZeile) ersteSichtbareZeile = menueStelle
    if (menueStelle >= ersteSichtbareZeile + 6) ersteSichtbareZeile = menueStelle - 5
    for (let zeile = 0; zeile < 6; zeile++) {
        let i = ersteSichtbareZeile + zeile
        if (i >= ANZAHL_TITEL_EINTRAEGE) break
        let y = 55 + zeile * 9
        if (i == menueStelle) {
            screen.fillRect(17, y - 1, 126, 8, FARBE_LILA)
            screen.fillRect(17, y - 1, 2, 8, FARBE_GELB)
        }
        let farbe = FARBE_TEXT
        if (i == 5 && !istTitelModusAenderbar()) farbe = FARBE_GEDIMMT
        if (i == 8 && !kannNeuesSpielPlusStarten()) farbe = FARBE_GEDIMMT
        if (i == 9 && !hatSpielstand) farbe = FARBE_GEDIMMT
        druckeSpielText((i == menueStelle ? ">" : " ") +
            kuerzeText(titelEintragText(i), 19), 21, y, farbe)
    }
    screen.fillRect(146, 55 + Math.idiv(menueStelle * 45, ANZAHL_TITEL_EINTRAEGE), 2, 7, FARBE_GELB)
    if (spielstandDefekt) druckeSpielText(Texte.t(272), 3, 109, FARBE_ROT)
    druckeRechts(Texte.t(273), 157, 109, FARBE_GEDIMMT)
}

function schiffsVorschauStufe(nummer: number, hervorhebungNummer: number, zeigeWeiter: boolean): number {
    let stufe = ausbauten[nummer]
    if (zeigeWeiter && nummer == hervorhebungNummer && stufe < AUSBAU_MAX[nummer]) stufe++
    return stufe
}

function schiffsVorschauTeilFarbe(nummer: number, teilStufe: number, hervorhebungNummer: number, zeigeWeiter: boolean,
    normalFarbe: number): number {
    if (zeigeWeiter && nummer == hervorhebungNummer && teilStufe > ausbauten[nummer]) return FARBE_GELB
    return normalFarbe
}

function zeichneVorschauRaute(cx: number, cy: number, halbeBreite: number, halbeHoehe: number,
    farbe: number): void {
    screen.drawLine(cx, cy - halbeHoehe, cx + halbeBreite, cy, farbe)
    screen.drawLine(cx + halbeBreite, cy, cx, cy + halbeHoehe, farbe)
    screen.drawLine(cx, cy + halbeHoehe, cx - halbeBreite, cy, farbe)
    screen.drawLine(cx - halbeBreite, cy, cx, cy - halbeHoehe, farbe)
}

// Drahtmodell von oben. Jeder Ausbau fügt der gleichen Schiffsform ein sichtbares Teil hinzu.
function zeichneSchiffsVorschau(cx: number, cy: number, hervorhebungNummer: number, zeigeWeiter: boolean): void {
    let schildStufe = schiffsVorschauStufe(AUSBAU_SCHILD, hervorhebungNummer, zeigeWeiter)
    for (let i = 0; i < schildStufe; i++) {
        let schildFarbe =
            schiffsVorschauTeilFarbe(AUSBAU_SCHILD, i + 1, hervorhebungNummer, zeigeWeiter, FARBE_BLAU)
        zeichneVorschauRaute(cx, cy, 21 + i * 2, 23 + i * 2, schildFarbe)
    }

    let rumpfFarbe = hervorhebungNummer == -3 ? FARBE_GELB : FARBE_TEXT
    screen.drawLine(cx, cy - 20, cx - 5, cy - 7, rumpfFarbe)
    screen.drawLine(cx - 5, cy - 7, cx - 20, cy + 8, rumpfFarbe)
    screen.drawLine(cx - 20, cy + 8, cx - 7, cy + 6, rumpfFarbe)
    screen.drawLine(cx - 7, cy + 6, cx - 6, cy + 17, rumpfFarbe)
    screen.drawLine(cx - 6, cy + 17, cx, cy + 13, rumpfFarbe)
    screen.drawLine(cx, cy + 13, cx + 6, cy + 17, rumpfFarbe)
    screen.drawLine(cx + 6, cy + 17, cx + 7, cy + 6, rumpfFarbe)
    screen.drawLine(cx + 7, cy + 6, cx + 20, cy + 8, rumpfFarbe)
    screen.drawLine(cx + 20, cy + 8, cx + 5, cy - 7, rumpfFarbe)
    screen.drawLine(cx + 5, cy - 7, cx, cy - 20, rumpfFarbe)
    screen.drawLine(cx, cy - 16, cx, cy + 12, FARBE_GEDIMMT)

    let panzerStufe = schiffsVorschauStufe(AUSBAU_PANZER, hervorhebungNummer, zeigeWeiter)
    for (let i = 0; i < panzerStufe; i++) {
        let panzerFarbe =
            schiffsVorschauTeilFarbe(AUSBAU_PANZER, i + 1, hervorhebungNummer, zeigeWeiter, FARBE_GRUEN)
        screen.drawLine(cx - 2 - i, cy - 11, cx - 5 - i, cy + 7, panzerFarbe)
        screen.drawLine(cx + 2 + i, cy - 11, cx + 5 + i, cy + 7, panzerFarbe)
    }

    let frachtStufe = schiffsVorschauStufe(AUSBAU_FRACHT, hervorhebungNummer, zeigeWeiter)
    if (frachtStufe >= 1) {
        let frachtFarbe = schiffsVorschauTeilFarbe(AUSBAU_FRACHT, 1, hervorhebungNummer, zeigeWeiter, FARBE_ORANGE)
        screen.drawRect(cx - 19, cy + 2, 5, 8, frachtFarbe)
        screen.drawRect(cx + 15, cy + 2, 5, 8, frachtFarbe)
    }
    if (frachtStufe >= 2) {
        let frachtFarbe = schiffsVorschauTeilFarbe(AUSBAU_FRACHT, 2, hervorhebungNummer, zeigeWeiter, FARBE_ORANGE)
        screen.drawRect(cx - 13, cy + 9, 5, 7, frachtFarbe)
        screen.drawRect(cx + 9, cy + 9, 5, 7, frachtFarbe)
    }
    if (frachtStufe >= 3) {
        let frachtFarbe = schiffsVorschauTeilFarbe(AUSBAU_FRACHT, 3, hervorhebungNummer, zeigeWeiter, FARBE_ORANGE)
        screen.drawRect(cx - 22, cy - 4, 4, 7, frachtFarbe)
        screen.drawRect(cx + 19, cy - 4, 4, 7, frachtFarbe)
    }

    let laserStufe = schiffsVorschauStufe(AUSBAU_LASER, hervorhebungNummer, zeigeWeiter)
    if (laserStufe >= 1) {
        let laserFarbe = schiffsVorschauTeilFarbe(AUSBAU_LASER, 1, hervorhebungNummer, zeigeWeiter, FARBE_ROT)
        screen.drawLine(cx - 2, cy - 17, cx - 2, cy - 24, laserFarbe)
        screen.drawLine(cx + 2, cy - 17, cx + 2, cy - 24, laserFarbe)
    }
    if (laserStufe >= 2) {
        let laserFarbe = schiffsVorschauTeilFarbe(AUSBAU_LASER, 2, hervorhebungNummer, zeigeWeiter, FARBE_ROT)
        screen.setPixel(cx - 3, cy - 25, laserFarbe)
        screen.setPixel(cx + 3, cy - 25, laserFarbe)
    }
    if (laserStufe >= 3) {
        let laserFarbe = schiffsVorschauTeilFarbe(AUSBAU_LASER, 3, hervorhebungNummer, zeigeWeiter, FARBE_ROT)
        screen.drawLine(cx - 2, cy - 25, cx - 2, cy - 28, laserFarbe)
        screen.drawLine(cx + 2, cy - 25, cx + 2, cy - 28, laserFarbe)
    }

    let kuehlerStufe = schiffsVorschauStufe(AUSBAU_KUEHLER, hervorhebungNummer, zeigeWeiter)
    for (let i = 0; i < kuehlerStufe; i++) {
        let kuehlerFarbe =
            schiffsVorschauTeilFarbe(AUSBAU_KUEHLER, i + 1, hervorhebungNummer, zeigeWeiter, FARBE_TUERKIS)
        let flosseY = cy - 1 + i * 5
        screen.drawLine(cx - 8, flosseY, cx - 13, flosseY - 2, kuehlerFarbe)
        screen.drawLine(cx + 8, flosseY, cx + 13, flosseY - 2, kuehlerFarbe)
    }

    let sprungStufe = schiffsVorschauStufe(AUSBAU_SPRUNG, hervorhebungNummer, zeigeWeiter)
    for (let i = 0; i < sprungStufe; i++) {
        let sprungFarbe =
            schiffsVorschauTeilFarbe(AUSBAU_SPRUNG, i + 1, hervorhebungNummer, zeigeWeiter, FARBE_LILA)
        let spuleY = cy + 8 + i * 3
        screen.drawLine(cx - 4, spuleY, cx + 4, spuleY, sprungFarbe)
    }

    let boosterStufe = schiffsVorschauStufe(AUSBAU_BOOSTER, hervorhebungNummer, zeigeWeiter)
    let eingebautFlammeLaenge = 3 + ausbauten[AUSBAU_BOOSTER] * 2
    let boosterFarbe = hervorhebungNummer == -2 ? FARBE_GELB : FARBE_ORANGE
    screen.drawLine(cx - 4, cy + 17, cx - 4, cy + 17 + eingebautFlammeLaenge, boosterFarbe)
    screen.drawLine(cx + 4, cy + 17, cx + 4, cy + 17 + eingebautFlammeLaenge, boosterFarbe)
    if (zeigeWeiter && hervorhebungNummer == AUSBAU_BOOSTER &&
        boosterStufe > ausbauten[AUSBAU_BOOSTER]) {
        let vorschauFlammeLaenge = 3 + boosterStufe * 2
        screen.drawLine(cx - 4, cy + 17 + eingebautFlammeLaenge, cx - 4, cy + 17 + vorschauFlammeLaenge,
            FARBE_GELB)
        screen.drawLine(cx + 4, cy + 17 + eingebautFlammeLaenge, cx + 4, cy + 17 + vorschauFlammeLaenge,
            FARBE_GELB)
    }

    let scannerStufe = schiffsVorschauStufe(AUSBAU_SCANNER, hervorhebungNummer, zeigeWeiter)
    if (scannerStufe >= 1) {
        let scannerFarbe = schiffsVorschauTeilFarbe(AUSBAU_SCANNER, 1, hervorhebungNummer, zeigeWeiter, FARBE_TUERKIS)
        zeichneVorschauRaute(cx, cy - 3, 4, 3, scannerFarbe)
    }
    if (scannerStufe >= 2) {
        let scannerFarbe = schiffsVorschauTeilFarbe(AUSBAU_SCANNER, 2, hervorhebungNummer, zeigeWeiter, FARBE_TUERKIS)
        screen.drawRect(cx - 5, cy - 7, 11, 9, scannerFarbe)
    }

    let reparaturStufe = schiffsVorschauStufe(AUSBAU_REPARATUR, hervorhebungNummer, zeigeWeiter)
    if (reparaturStufe > 0) {
        let reparaturFarbe =
            schiffsVorschauTeilFarbe(AUSBAU_REPARATUR, 1, hervorhebungNummer, zeigeWeiter, FARBE_GRUEN)
        screen.drawRect(cx + 21, cy - 9, 5, 5, reparaturFarbe)
        screen.drawLine(cx + 23, cy - 11, cx + 23, cy - 2, reparaturFarbe)
        screen.drawLine(cx + 19, cy - 7, cx + 27, cy - 7, reparaturFarbe)
    }

    let versicherungStufe = schiffsVorschauStufe(AUSBAU_VERSICHERUNG, hervorhebungNummer, zeigeWeiter)
    if (versicherungStufe > 0) {
        let versicherungFarbe =
            schiffsVorschauTeilFarbe(AUSBAU_VERSICHERUNG, 1, hervorhebungNummer, zeigeWeiter, FARBE_GRUEN)
        screen.drawLine(cx - 24, cy - 15, cx - 24, cy - 10, versicherungFarbe)
        screen.drawLine(cx - 24, cy - 15, cx - 19, cy - 15, versicherungFarbe)
        screen.drawLine(cx + 24, cy - 15, cx + 24, cy - 10, versicherungFarbe)
        screen.drawLine(cx + 24, cy - 15, cx + 19, cy - 15, versicherungFarbe)
        if (versicherungStufe >= 2) {
            versicherungFarbe =
                schiffsVorschauTeilFarbe(AUSBAU_VERSICHERUNG, 2, hervorhebungNummer, zeigeWeiter, FARBE_GRUEN)
            screen.drawLine(cx - 24, cy + 15, cx - 24, cy + 10, versicherungFarbe)
            screen.drawLine(cx - 24, cy + 15, cx - 19, cy + 15, versicherungFarbe)
            screen.drawLine(cx + 24, cy + 15, cx + 24, cy + 10, versicherungFarbe)
            screen.drawLine(cx + 24, cy + 15, cx + 19, cy + 15, versicherungFarbe)
        }
    }
}

function zeichneSchiffsrollenVorschau(cx: number, cy: number, rolle: Schiffsrolle): void {
    if (rolle == Schiffsrolle.Kaufmann) {
        screen.drawRect(cx - 27, cy + 4, 5, 10, FARBE_ORANGE)
        screen.drawRect(cx + 23, cy + 4, 5, 10, FARBE_ORANGE)
        screen.drawLine(cx - 25, cy + 14, cx + 25, cy + 14, FARBE_ORANGE)
    } else if (rolle == Schiffsrolle.Kurier) {
        screen.drawLine(cx - 8, cy + 20, cx - 8, cy + 27, FARBE_TUERKIS)
        screen.drawLine(cx, cy + 17, cx, cy + 29, FARBE_GELB)
        screen.drawLine(cx + 8, cy + 20, cx + 8, cy + 27, FARBE_TUERKIS)
    } else {
        screen.drawLine(cx - 7, cy - 20, cx - 7, cy - 28, FARBE_ROT)
        screen.drawLine(cx + 7, cy - 20, cx + 7, cy - 28, FARBE_ROT)
        zeichneVorschauRaute(cx, cy - 4, 7, 5, FARBE_ROT)
    }
}

function ausbauStufeUebersicht(nummer: number, stufe: number): string {
    if (nummer == AUSBAU_FRACHT) return Texte.t(274) + (8 + stufe * 4)
    if (nummer == AUSBAU_SCHILD) return Texte.t(275) + (4 + stufe * 3)
    if (nummer == AUSBAU_PANZER) return Texte.t(276) + (8 + stufe * 3)
    if (nummer == AUSBAU_LASER) return Texte.t(195) + (1 + stufe)
    if (nummer == AUSBAU_KUEHLER) return Texte.t(196) + Math.max(180, 440 - stufe * 100)
    if (nummer == AUSBAU_BOOSTER) return Texte.t(197) + Math.max(1200, 2600 - stufe * 500)
    if (nummer == AUSBAU_SCANNER) return Texte.t(198) + stufe
    if (nummer == AUSBAU_SPRUNG) return Texte.t(199) + (2 + stufe)
    if (nummer == AUSBAU_REPARATUR) return stufe > 0 ? Texte.t(277) : Texte.t(278)
    if (nummer == AUSBAU_VERSICHERUNG)
        return stufe == 0 ? Texte.t(202) : (stufe == 1 ? Texte.t(203) : Texte.t(279))
    return ""
}

function fuelleHangarViereck(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number,
    y3: number, farbe: number): void {
    screen.fillTriangle(x0, y0, x1, y1, x2, y2, farbe)
    screen.fillTriangle(x0, y0, x2, y2, x3, y3, farbe)
}

function zeichneHangarHintergrund3D(): void {
    let stationAkzent = stationAkzentFarbe()
    let stationDunkel = stationDunkelFarbe()
    screen.fillRect(0, 13, 160, 95, FARBE_HINTERGRUND)

    // Ein tiefes Dach und Streben laufen auf die hintere Wartungsbucht zu.
    fuelleHangarViereck(0, 13, 159, 13, 149, 39, 64, 39, FARBE_BLAU)
    screen.drawLine(0, 18, 159, 18, FARBE_METALL)
    screen.drawLine(13, 26, 155, 26, FARBE_METALL)
    screen.drawLine(35, 34, 151, 34, FARBE_METALL)
    screen.drawLine(0, 13, 76, 39, FARBE_GEDIMMT)
    screen.drawLine(29, 13, 88, 39, FARBE_GEDIMMT)
    screen.drawLine(58, 13, 98, 39, FARBE_GEDIMMT)
    screen.drawLine(87, 13, 108, 39, FARBE_GEDIMMT)
    screen.drawLine(116, 13, 121, 39, FARBE_GEDIMMT)
    screen.drawLine(145, 13, 137, 39, FARBE_GEDIMMT)
    screen.drawLine(4, 18, 29, 26, FARBE_SCHATTEN)
    screen.drawLine(29, 18, 13, 26, FARBE_SCHATTEN)
    screen.drawLine(58, 18, 88, 26, FARBE_SCHATTEN)
    screen.drawLine(88, 18, 58, 26, FARBE_SCHATTEN)
    screen.drawLine(116, 18, 145, 26, FARBE_SCHATTEN)
    screen.drawLine(145, 18, 116, 26, FARBE_SCHATTEN)

    // Schräge Rückwand und ein Druckschott aus Segmenten.
    fuelleHangarViereck(62, 38, 159, 31, 159, 72, 62, 67, stationDunkel)
    fuelleHangarViereck(72, 42, 155, 37, 155, 68, 72, 63, FARBE_SCHATTEN)
    screen.drawLine(72, 42, 155, 37, FARBE_GEDIMMT)
    screen.drawLine(72, 63, 155, 68, FARBE_GEDIMMT)
    screen.drawLine(91, 41, 91, 64, FARBE_METALL)
    screen.drawLine(112, 40, 112, 65, FARBE_METALL)
    screen.drawLine(133, 38, 133, 67, FARBE_METALL)
    screen.drawLine(72, 52, 155, 52, stationAkzent)
    screen.fillRect(146, 41, 5, 4, FARBE_ROT)
    screen.setPixel(148, 42, FARBE_GELB)

    // Boden in Perspektive, Startplatz, Schienen und ein wachsendes Bodenraster.
    screen.fillRect(0, 64, 160, 44, FARBE_SCHATTEN)
    fuelleHangarViereck(104, 61, 119, 61, 153, 108, 54, 108, FARBE_METALL)
    fuelleHangarViereck(108, 63, 116, 63, 135, 108, 81, 108, FARBE_BLAU)
    screen.drawLine(111, 61, 42, 108, FARBE_GEDIMMT)
    screen.drawLine(111, 61, 75, 108, FARBE_GEDIMMT)
    screen.drawLine(113, 61, 112, 108, FARBE_GEDIMMT)
    screen.drawLine(114, 61, 148, 108, FARBE_GEDIMMT)
    screen.drawLine(115, 61, 159, 91, FARBE_GEDIMMT)
    screen.drawLine(94, 72, 131, 72, FARBE_GEDIMMT)
    screen.drawLine(80, 81, 142, 81, FARBE_GEDIMMT)
    screen.drawLine(63, 94, 154, 94, FARBE_GEDIMMT)
    screen.drawLine(39, 106, 159, 106, FARBE_GEDIMMT)
    screen.drawLine(101, 65, 72, 108, stationAkzent)
    screen.drawLine(121, 65, 143, 108, stationAkzent)
    screen.fillRect(96, 72, 2, 2, FARBE_GELB)
    screen.fillRect(89, 82, 2, 2, FARBE_TUERKIS)
    screen.fillRect(80, 96, 3, 2, FARBE_GELB)
    screen.fillRect(128, 72, 2, 2, FARBE_GELB)
    screen.fillRect(134, 83, 2, 2, FARBE_TUERKIS)
    screen.fillRect(140, 97, 3, 2, FARBE_GELB)

    // Türschwelle und Stützen liegen im Vordergrund; der Boden darf sie nicht überzeichnen.
    screen.drawLine(72, 63, 155, 68, FARBE_METALL)
    screen.drawLine(72, 64, 155, 69, FARBE_ROSTBRAUN)
    screen.fillRect(59, 34, 10, 48, stationDunkel)
    screen.fillRect(62, 37, 3, 42, FARBE_METALL)
    screen.fillRect(153, 28, 7, 57, stationDunkel)
    screen.fillRect(153, 33, 2, 47, FARBE_METALL)
    screen.drawLine(59, 44, 69, 54, FARBE_SCHATTEN)
    screen.drawLine(69, 44, 59, 54, FARBE_SCHATTEN)
    screen.fillRect(57, 80, 14, 3, FARBE_METALL)
    screen.fillRect(151, 83, 9, 3, FARBE_METALL)
}

const HACKER_MINI_X = 136
const HACKER_MINI_Y = 46
// Kapuze auf, schwarzer Kapuzenpulli und schwarze Hose, türkise Turnschuhe; rechts der Schreibtisch
// mit einem Bildschirm.
const HACKER_MINI = img`
    . . . . . . . . b b b b b b b .
    . . . b b b . . b 9 9 9 9 9 b .
    . . b f f f b . b 9 7 9 7 9 b .
    . . b f f f b . b 9 9 9 9 9 b .
    . . b f f f b . b b b b b b b .
    . b f f f f f b . . . b . . . .
    b f f f f f f f f d d d d d d d
    b f f f f f f b b b b b b b b b
    b f f f f f f b . b . . . . . b
    . b f f f f b . . b . . . . . b
    . b f f . f f b . b . . . . . b
    . b f f . f f b . . . . . . . .
    . 6 6 6 . 6 6 6 . . . . . . . .
`

function zeichneHangarSchiff3D(): void {
    let rumpfLack = schiffsLackFarbe()
    // Schatten und Schildhülle liegen hinter dem festen Schiff.
    fuelleHangarViereck(73, 95, 91, 88, 155, 89, 142, 102, FARBE_HINTERGRUND)
    for (let i = 0; i < ausbauten[AUSBAU_SCHILD]; i++) {
        zeichneVorschauRaute(116, 70, 39 + i * 2, 27 + i * 2,
            i == ausbauten[AUSBAU_SCHILD] - 1 ? FARBE_TUERKIS : FARBE_BLAU)
    }

    // Der ferne und der nahe Flügel mit ihren dunkleren Unterseiten.
    screen.fillTriangle(106, 66, 122, 43, 150, 83, rumpfLack)
    screen.drawLine(106, 66, 122, 43, FARBE_TUERKIS)
    screen.drawLine(122, 43, 150, 83, FARBE_GEDIMMT)
    screen.fillTriangle(106, 70, 73, 96, 152, 87, FARBE_GEDIMMT)
    screen.fillTriangle(73, 96, 152, 87, 144, 93, FARBE_SCHATTEN)
    screen.drawLine(73, 96, 106, 70, FARBE_TEXT)
    screen.drawLine(73, 96, 152, 87, FARBE_TUERKIS)

    // Langer, ungleichmäßiger Rumpf: helle Oberseite, dunkle Seite und spitze Nase.
    fuelleHangarViereck(80, 51, 111, 62, 154, 84, 106, 72, FARBE_GEDIMMT)
    fuelleHangarViereck(80, 58, 106, 72, 154, 84, 105, 79, rumpfLack)
    screen.drawLine(80, 51, 111, 62, FARBE_TEXT)
    screen.drawLine(111, 62, 154, 84, FARBE_TEXT)
    screen.drawLine(80, 58, 105, 79, FARBE_TUERKIS)
    screen.drawLine(105, 79, 154, 84, FARBE_TUERKIS)

    // Heckflossen, Cockpitglas und Triebwerksgehäuse.
    screen.fillTriangle(81, 53, 92, 43, 106, 64, FARBE_METALL)
    screen.fillTriangle(81, 59, 75, 70, 106, 70, FARBE_SCHATTEN)
    screen.drawLine(92, 43, 106, 64, FARBE_TEXT)
    fuelleHangarViereck(108, 60, 126, 67, 133, 76, 115, 70, FARBE_HINTERGRUND)
    screen.drawLine(108, 60, 126, 67, FARBE_TUERKIS)
    screen.drawLine(126, 67, 133, 76, FARBE_TUERKIS)
    screen.drawLine(133, 76, 115, 70, FARBE_BLAU)
    screen.fillRect(77, 52, 6, 4, FARBE_HINTERGRUND)
    screen.fillRect(76, 59, 6, 4, FARBE_HINTERGRUND)
    screen.drawRect(77, 52, 6, 4, FARBE_ORANGE)
    screen.drawRect(76, 59, 6, 4, FARBE_ORANGE)

    // Das Fahrwerk setzt das Schiff auf die beleuchtete Plattform.
    screen.drawLine(96, 81, 94, 98, FARBE_TEXT)
    screen.drawLine(91, 98, 99, 98, FARBE_GEDIMMT)
    screen.drawLine(137, 84, 139, 98, FARBE_TEXT)
    screen.drawLine(135, 98, 143, 98, FARBE_GEDIMMT)

    // Eingebaute Ausrüstung bleibt im 3D-Modell des Hangars sichtbar.
    for (let i = 0; i < ausbauten[AUSBAU_PANZER]; i++) {
        screen.drawLine(92 + i * 4, 58 + i, 116 + i * 4, 69 + i * 2, FARBE_GRUEN)
    }
    for (let i = 0; i < ausbauten[AUSBAU_KUEHLER]; i++) {
        screen.drawLine(91 - i * 5, 83 + i * 3, 102 - i * 3, 76 + i * 2, FARBE_TUERKIS)
    }
    for (let i = 0; i < ausbauten[AUSBAU_FRACHT]; i++) {
        screen.drawRect(84 + i * 7, 76 + i * 2, 6, 5, FARBE_ORANGE)
    }
    for (let i = 0; i < ausbauten[AUSBAU_SPRUNG]; i++) {
        screen.drawLine(78 - i, 51 + i * 5, 84 + i, 54 + i * 5, FARBE_LILA)
    }
    if (ausbauten[AUSBAU_LASER] > 0) {
        screen.drawLine(149, 80, 159, 82, FARBE_ROT)
        screen.drawLine(148, 84, 159, 87, FARBE_ROT)
    }
    if (ausbauten[AUSBAU_BOOSTER] > 0) {
        screen.drawLine(76, 54, 70 - ausbauten[AUSBAU_BOOSTER] * 2, 52, FARBE_GELB)
        screen.drawLine(75, 61, 69 - ausbauten[AUSBAU_BOOSTER] * 2, 61, FARBE_ORANGE)
    }
    if (ausbauten[AUSBAU_SCANNER] > 0) {
        zeichneVorschauRaute(114, 57, 4 + ausbauten[AUSBAU_SCANNER], 3, FARBE_TUERKIS)
        screen.drawLine(114, 57, 111, 51, FARBE_TUERKIS)
    }
    if (ausbauten[AUSBAU_REPARATUR] > 0) {
        screen.drawRect(143, 49, 5, 5, FARBE_GRUEN)
        screen.drawLine(145, 47, 145, 56, FARBE_GRUEN)
        screen.drawLine(141, 51, 150, 51, FARBE_GRUEN)
    }
    if (ausbauten[AUSBAU_VERSICHERUNG] > 0) {
        screen.drawLine(76, 46, 83, 46, FARBE_GRUEN)
        screen.drawLine(76, 46, 76, 52, FARBE_GRUEN)
        screen.drawLine(156, 76, 156, 82, FARBE_GRUEN)
        screen.drawLine(156, 76, 149, 76, FARBE_GRUEN)
        if (ausbauten[AUSBAU_VERSICHERUNG] > 1) {
            screen.drawLine(72, 99, 79, 99, FARBE_GRUEN)
            screen.drawLine(72, 99, 72, 93, FARBE_GRUEN)
            screen.drawLine(156, 94, 156, 100, FARBE_GRUEN)
            screen.drawLine(156, 100, 149, 100, FARBE_GRUEN)
        }
    }

    // Die Form der Rolle ist am geparkten Schiff genauso zu sehen wie in der Vorschau.
    if (schiffsrolle == Schiffsrolle.Kaufmann) {
        screen.drawRect(82, 82, 7, 5, FARBE_ORANGE)
        screen.drawRect(91, 84, 7, 5, FARBE_ORANGE)
    } else if (schiffsrolle == Schiffsrolle.Kurier) {
        screen.drawLine(76, 54, 67, 51, FARBE_TUERKIS)
        screen.drawLine(75, 61, 66, 61, FARBE_GELB)
    } else {
        screen.drawLine(148, 79, 159, 80, FARBE_ROT)
        screen.drawLine(147, 86, 159, 89, FARBE_ROT)
    }

    // Ein Lackstreifen in der Farbe der Station und ein gelbes Abzeichen, das mit dem Rang länger wird.
    screen.drawLine(91, 63, 141, 80, stationAkzentFarbe())
    screen.fillRect(119, 71, 3 + Math.min(5, aktuellerRang()), 2, FARBE_GELB)
}

function zeichneHangar(): void {
    zeichneKopfzeile(Texte.t(280) + WELT_NAMEN[aktuelleWelt])
    zeichneHangarHintergrund3D()
    zeichneHangarSchiff3D()
    screen.fillRect(156, 28, 4, 58, FARBE_ROSTBRAUN)
    screen.drawLine(156, 34, 159, 38, FARBE_METALL)
    screen.drawLine(159, 38, 156, 42, FARBE_METALL)

    // Eine kleine Wartungsdrohne an einem Kabel zum Schiff und zwei blinkende Lichter halten die Station lebendig, ohne
    // dass Sprites (fertige Bildfiguren) nötig sind.
    let drohnePhase = Math.idiv(game.runtime(), 90) % 76
    let drohneX = 78 + drohnePhase
    let drohneY = 42 + Math.idiv(Math.abs(38 - drohnePhase), 8)
    screen.fillRect(drohneX, drohneY, 4, 2, FARBE_GRUEN)
    screen.setPixel(drohneX - 1, drohneY + 1, FARBE_TUERKIS)
    screen.drawLine(drohneX + 2, drohneY + 2, 116, 70, FARBE_GEDIMMT)
    if (Math.idiv(game.runtime(), 280) % 2 == 0) {
        screen.fillRect(147, 41, 3, 2, FARBE_GELB)
        screen.setPixel(96, 73, stationAkzentFarbe())
    }
    // Gastauftritt: Der Calliope Hacker steht am Steuerpult auf dem hinteren Laufsteg, vor dem Kabel der Drohne.
    screen.drawTransparentImage(HACKER_MINI, HACKER_MINI_X, HACKER_MINI_Y)

    // Einsatzkonsole: Die Szene bleibt groß, das Menü scrollt ruhig.
    screen.fillRect(1, 17, 70, 83, FARBE_HINTERGRUND)
    screen.drawRect(1, 17, 70, 83, FARBE_METALL)
    if (menueStelle < ersteSichtbareZeile) ersteSichtbareZeile = menueStelle
    if (menueStelle >= ersteSichtbareZeile + 6) ersteSichtbareZeile = menueStelle - 5
    for (let zeile = 0; zeile < 6; zeile++) {
        let i = ersteSichtbareZeile + zeile
        if (i >= HANGAR_EINTRAEGE.length) break
        let y = 21 + zeile * 13
        if (i == menueStelle) {
            screen.fillRect(3, y - 1, 65, 10, FARBE_LILA)
            screen.fillRect(3, y - 1, 2, 10, FARBE_GELB)
        }
        let farbe = FARBE_TEXT
        if (i == 1 && !schwarzmarktVerfuegbar()) farbe = FARBE_GEDIMMT
        if (i == 9 && zielWelt == aktuelleWelt) farbe = FARBE_GEDIMMT
        // Nur die gewählte Zeile läuft als Laufschrift; die anderen zeigen den Anfang des Wortes.
        let beschriftung = Texte.t(HANGAR_EINTRAEGE[i])
        druckeSpielText(i == menueStelle ? kuerzeText(beschriftung, 10) : beschriftung.substr(0, 10), 7, y, farbe)
        let tutorialZiel = tutorialStufe == 1 ? 3
            : (tutorialStufe == 2 ? (zielWelt == aktuelleWelt ? 4 : 9) : -1)
        // Das "!" liegt in der Zeichenspalte 2: Bei x 65 wird es bei x 67 gezeichnet, ein Pixel nach einem zehnten
        // Buchstaben und vor dem Laufbalken (x 68).
        if (i == tutorialZiel && Math.idiv(game.runtime(), 250) % 2 == 0)
            druckeSpielText("!", 65, y, FARBE_GELB)
    }
    screen.fillRect(68, 20 + Math.idiv(menueStelle * 73, HANGAR_EINTRAEGE.length), 2, 8, stationAkzentFarbe())

    screen.fillRect(101, 15, 58, 11, FARBE_HINTERGRUND)
    screen.drawRect(101, 15, 58, 11, FARBE_TUERKIS)
    let routeBeschriftung = routeSprungAnzahl() > 1 ? Texte.t(281) + treibstoff +
        Texte.t(282) + routeSprungAnzahl() + ">" +
        WELT_NAMEN[routenWeltAnStelle(routeSprungAnzahl())] : Texte.t(281) + treibstoff + " >" +
        WELT_NAMEN[zielWelt]
    druckeRechts(kuerzeText(routeBeschriftung, 9), 156, 18,
        zielWelt == aktuelleWelt ? FARBE_GEDIMMT : FARBE_GELB)
    screen.fillRect(96, 27, 63, 9, FARBE_HINTERGRUND)
    druckeRechts(kuerzeText(weltMerkmalName(aktuelleWelt), 10), 157, 29, stationAkzentFarbe())
    screen.fillRect(73, 99, 85, 9, FARBE_HINTERGRUND)
    if (menueStelle == 9) {
        let versichert = ausbauten[AUSBAU_VERSICHERUNG] == 0 ? Texte.t(283)
            : (ausbauten[AUSBAU_VERSICHERUNG] == 1 ? Texte.t(284) : Texte.t(285))
        druckeRechts(kuerzeText(versichert, 14), 157, 101, FARBE_GELB)
    } else druckeRechts(kuerzeText(schiffsAnzeigeName(schiffsrolle) + " / " + schiffsLackName(schiffsrolle),
        14), 157, 101, FARBE_GEDIMMT)
    if (laeuftGefuehrteLieferung()) {
        screen.fillRect(0, 98, 160, 10, FARBE_BLAU)
        screen.fillRect(0, 98, 6, 10, FARBE_GELB)
        druckeSpielText(kuerzeText(tutorialStufeName(), 25), 8, 101, FARBE_GELB)
    }
    if (bestaetigungOffen) {
        zeichneBestaetigungKasten(Texte.t(630), 0)
        screen.fillRect(0, 108, 160, 12, FARBE_HINTERGRUND)
    } else zeichneFusszeile(Texte.t(273), laeuftGefuehrteLieferung() ? Texte.t(629) : Texte.t(287))
}

function laeuftGefuehrteLieferung(): boolean {
    return tutorialStufe >= 1 && tutorialStufe <= 3
}

// Überspringt die geführte erste Lieferung: Endzustand wie nach dem Durchspielen (Stufe 4, Scanner), nur ohne Lohn.
function ueberspringeGefuehrteLieferung(): void {
    if (missionsHerkunft == 2) leereMission()
    tutorialStufe = 4
    ausbauten[AUSBAU_SCANNER] = Math.max(1, ausbauten[AUSBAU_SCANNER])
    schreibeSpielstand()
    klangBestaetigung()
    // Die dritte Zeile nennt den nächsten Schritt der übersprungenen Führung: eine Mission annehmen.
    zeigeMeldung(Texte.t(631), Texte.t(632), Texte.t(236), Szene.Hangar)
}

function marktNameAnzeige(name: string, zeile: number): string {
    return zeile == menueStelle ? kuerzeText(name, 9) : name.substr(0, 9)
}

function zeichneMarkt(): void {
    zeichneKopfzeile((istSchwarzmarkt ? Texte.t(288) : Texte.t(289)) + WELT_NAMEN[aktuelleWelt])
    druckeSpielText(Texte.t(290), 5, 16, FARBE_GEDIMMT)
    druckeSpielText(istSchwarzmarkt ? Texte.t(291) : Texte.t(291), 66, 16, FARBE_GEDIMMT)
    druckeSpielText(Texte.t(292), 126, 16, FARBE_GEDIMMT)
    let eintraegeAnzahl = istSchwarzmarkt ? ANZAHL_WAREN + ANZAHL_RARITAETEN : ANZAHL_WAREN
    if (menueStelle < ersteSichtbareZeile) ersteSichtbareZeile = menueStelle
    if (menueStelle >= ersteSichtbareZeile + 6) ersteSichtbareZeile = menueStelle - 5
    for (let zeile = 0; zeile < 6; zeile++) {
        let ware = ersteSichtbareZeile + zeile
        if (ware >= eintraegeAnzahl) break
        let y = 28 + zeile * 12
        if (ware == menueStelle && !handelOffen) zeichneAuswahl(y, 10)
        if (ware < ANZAHL_WAREN) {
            // Die Namen bleiben in ihrer Spalte (9 Zeichen, dahinter eine Lücke bis zu den Preisen bei x 66); wie im
            // Hangar-Menü läuft nur bei der gewählten Zeile ein längerer Name durch, die anderen zeigen den
            // Anfang des Wortes.
            druckeSpielText(
                marktNameAnzeige(Texte.t(WARE_NAMEN[ware]), ware), 5, y, FARBE_TEXT)
            let preisKauf = istSchwarzmarkt ? schwarzmarktKaufPreis(ware) : kaufPreis(ware)
            let preisVerkauf = istSchwarzmarkt ? schwarzmarktVerkaufPreis(ware) : verkaufPreis(ware)
            // Auf der lila Auswahl stehen die roten Schwarzmarkt-Preise in der Textfarbe, genau wie der Name.
            druckeSpielText(preisKauf + "/" + preisVerkauf, 66, y,
                istSchwarzmarkt ?
                    (ware == menueStelle && !handelOffen ? FARBE_TEXT : FARBE_ROT) : FARBE_GELB)
            druckeSpielText((istSchwarzmarkt ? "--" : marktVorrat[ware]) + "/" +
                fracht[ware], 126, y, FARBE_GRUEN)
        } else {
            let raritaetNr = ware - ANZAHL_WAREN
            // Auch der Auswahlbalken ist lila: Die gewählte Rarität wird in der Textfarbe gezeichnet.
            druckeSpielText(marktNameAnzeige(raritaetName(raritaetNr), ware), 5, y,
                ware == menueStelle && !handelOffen ? FARBE_TEXT : FARBE_LILA)
            druckeSpielText("--/" + raritaetWert(raritaetNr), 66, y, FARBE_GELB)
            druckeSpielText("--/" + raritaeten[raritaetNr], 126, y,
                raritaeten[raritaetNr] > 0 ? FARBE_GRUEN : FARBE_GEDIMMT)
        }
    }
    screen.fillRect(0, 97, 160, 11, FARBE_HINTERGRUND)
    if (marktRueckmeldungText != "" && game.runtime() < marktRueckmeldungBisMs) {
        druckeSpielText(kuerzeText(marktRueckmeldungText, 26), 3, 100, marktRueckmeldungFarbe)
    } else {
        marktRueckmeldungText = ""
        if (istSchwarzmarkt) {
            druckeSpielText(kuerzeText(Texte.t(293), 26), 3, 100, FARBE_ROT)
        } else if (istMarktBekannt(aktuelleWelt)) {
            let gemerkteWare = marktwissenWare(aktuelleWelt)
            let trend = marktwissenTrend(aktuelleWelt)
            let trendText = trend > 0 ? "+" : (trend < 0 ? "-" : "=")
            druckeSpielText(
                kuerzeText(Texte.t(294) + Texte.t(WARE_NAMEN[gemerkteWare]) + " " +
                marktwissenKauf(aktuelleWelt) + "/" + marktwissenVerkauf(aktuelleWelt) + " " + trendText +
                Texte.t(295) + marktwissenAlter(aktuelleWelt), 26), 3, 100, FARBE_TUERKIS)
        } else {
            druckeSpielText(kuerzeText(Texte.t(296) + marktEreignisInfo(), 26), 3, 100,
                marktEreignisAktivIn(aktuelleWelt) ? FARBE_GELB : FARBE_GEDIMMT)
        }
    }
    if (handelOffen) zeichneHandelsKasten()
    else zeichneFusszeile(Texte.t(297), Texte.t(298))
}

function zeichneHandelsKasten(): void {
    screen.fillRect(15, 34, 130, 58, FARBE_HINTERGRUND)
    screen.drawRect(15, 34, 130, 58, FARBE_TUERKIS)
    let raritaetGewaehlt = istSchwarzmarkt && menueStelle >= ANZAHL_WAREN
    let handelsName = raritaetGewaehlt ? raritaetName(menueStelle - ANZAHL_WAREN) :
        Texte.t(WARE_NAMEN[menueStelle])
    druckeSpielText(handelsName, 22, 40, raritaetGewaehlt ? FARBE_LILA : FARBE_GELB)
    if (handelsMenge > 0) {
        druckeSpielText(Texte.t(299) + handelsMenge, 22, 53, FARBE_GRUEN)
        druckeSpielText(Texte.t(300) + handelsMenge *
            (istSchwarzmarkt ? schwarzmarktKaufPreis(menueStelle) : kaufPreis(menueStelle)), 22, 65, FARBE_TEXT)
    } else if (handelsMenge < 0) {
        druckeSpielText(Texte.t(301) + (0 - handelsMenge), 22, 53, FARBE_ORANGE)
        let stueckPreis = raritaetGewaehlt ? raritaetWert(menueStelle - ANZAHL_WAREN)
            : (istSchwarzmarkt ? schwarzmarktVerkaufPreis(menueStelle) : verkaufPreis(menueStelle))
        druckeSpielText(Texte.t(300) + (0 - handelsMenge) * stueckPreis, 22, 65, FARBE_TEXT)
    } else {
        druckeSpielText(Texte.t(302), 22, 53, FARBE_GEDIMMT)
        druckeSpielText(Texte.t(303), 22, 65, FARBE_TEXT)
    }
    druckeSpielText(Texte.t(304), 22, 79, FARBE_GEDIMMT)
}

function werftEintragName(stelle: number): string {
    if (stelle == 0) return Texte.t(305)
    if (stelle == 1) return Texte.t(306)
    if (stelle == WERFT_SCHIFF_STELLE) return Texte.t(307)
    if (stelle == WERFT_NAME_STELLE) return Texte.t(308)
    if (stelle == WERFT_LACK_STELLE) return Texte.t(309)
    if (stelle == WERFT_RAKETE_STELLE) return Texte.t(114)
    if (stelle == WERFT_MINE_STELLE) return Texte.t(27)
    return Texte.t(AUSBAU_NAMEN[stelle - 2])
}

function werftKosten(stelle: number): number {
    if (stelle == 0) return treibstoff < maxTreibstoff() ? 8 : 0
    if (stelle == 1) {
        let beschaedigt = rumpf < maxRumpf()
        for (let i = 0; i < modulSchaden.length; i++) if (modulSchaden[i] > 0) beschaedigt = true
        return beschaedigt ? 28 : 0
    }
    if (stelle == WERFT_SCHIFF_STELLE)
        return besitztSchiff(werftRolleVorschau) ? 0 : schiffsKaufKosten(werftRolleVorschau)
    if (stelle == WERFT_NAME_STELLE || stelle == WERFT_LACK_STELLE) return 0
    if (stelle == WERFT_RAKETE_STELLE) return raketen < 9 ? werftPreis(120) : 0
    if (stelle == WERFT_MINE_STELLE) return minen < 6 ? werftPreis(80) : 0
    let nummer = stelle - 2
    return ausbauPreis(nummer, ausbauten[nummer] + 1)
}

function rolleVonStelle(stelle: number): Schiffsrolle {
    if (stelle == 1) return Schiffsrolle.Kurier
    if (stelle == 2) return Schiffsrolle.Jaeger
    return Schiffsrolle.Kaufmann
}

function wechsleWerftRolle(aenderung: number): void {
    let naechste = (werftRolleVorschau + aenderung) % ANZAHL_SCHIFFSROLLEN
    if (naechste < 0) naechste += ANZAHL_SCHIFFSROLLEN
    werftRolleVorschau = rolleVonStelle(naechste)
    werftEingebautNummer = -1
}

function zeichneWerft(): void {
    zeichneKopfzeile(Texte.t(247))
    if (menueStelle < ersteSichtbareZeile) ersteSichtbareZeile = menueStelle
    if (menueStelle >= ersteSichtbareZeile + 6) ersteSichtbareZeile = menueStelle - 5
    for (let zeile = 0; zeile < 6; zeile++) {
        let stelle = ersteSichtbareZeile + zeile
        if (stelle >= ANZAHL_WERFT_EINTRAEGE) break
        let y = 18 + zeile * 12
        if (stelle == menueStelle)
            screen.fillRect(2, y - 1, 90, 10, bestaetigungOffen ? FARBE_BLAU : FARBE_LILA)
        druckeSpielText(werftEintragName(stelle), 5, y, FARBE_TEXT)
        if (stelle == WERFT_SCHIFF_STELLE) {
            screen.fillRect(87, y + 2, 2, 2, besitztSchiff(werftRolleVorschau) ? FARBE_GRUEN
                : (istSchiffsrolleFreigeschaltet(werftRolleVorschau) ? FARBE_TUERKIS : FARBE_ROT))
        } else if (stelle == WERFT_NAME_STELLE || stelle == WERFT_LACK_STELLE) {
            druckeRechts("<>", 90, y, FARBE_TUERKIS)
        } else if (stelle == WERFT_RAKETE_STELLE || stelle == WERFT_MINE_STELLE) {
            druckeRechts(werftKosten(stelle) > 0 ? "" + werftKosten(stelle) : Texte.t(310), 90, y,
                werftKosten(stelle) > 0 && werftKosten(stelle) > credits ? FARBE_ROT : FARBE_GELB)
        } else if (stelle >= 2 && ausbauten[stelle - 2] >= AUSBAU_MAX[stelle - 2]) {
            druckeRechts(Texte.t(310), 90, y, FARBE_GRUEN)
        } else {
            druckeRechts("" + werftKosten(stelle), 90, y,
                werftKosten(stelle) <= credits ? FARBE_GELB : FARBE_ROT)
        }
    }

    let schiffGewaehlt = menueStelle == WERFT_SCHIFF_STELLE
    let kennungGewaehlt = menueStelle == WERFT_NAME_STELLE || menueStelle == WERFT_LACK_STELLE
    let ausbauGewaehlt = menueStelle >= 2 && menueStelle < WERFT_SCHIFF_STELLE
    let hervorhebungNummer = ausbauGewaehlt ? menueStelle - 2 : -1
    let jetztEingebaut = schiffGewaehlt ? werftRolleVorschau == schiffsrolle
        : (ausbauGewaehlt && werftEingebautNummer == hervorhebungNummer)
    let zeigeWeiter = schiffGewaehlt ? werftRolleVorschau != schiffsrolle
        : (ausbauGewaehlt && !jetztEingebaut &&
            ausbauten[hervorhebungNummer] < AUSBAU_MAX[hervorhebungNummer])
    screen.drawRect(94, 15, 65, 72, FARBE_TUERKIS)
    let vorschauBeschriftung = jetztEingebaut ? Texte.t(311) : (zeigeWeiter ? Texte.t(312) : Texte.t(313))
    if (schiffGewaehlt && !istSchiffsrolleFreigeschaltet(werftRolleVorschau)) vorschauBeschriftung = Texte.t(314)
    druckeSpielText(vorschauBeschriftung,
        vorschauBeschriftung == Texte.t(311) ? 99
            : (vorschauBeschriftung == Texte.t(314) ? 102 : (vorschauBeschriftung == Texte.t(312) ? 102 : 109)),
        18,
        vorschauBeschriftung == Texte.t(311) ? FARBE_GRUEN
            : (vorschauBeschriftung == Texte.t(314) ? FARBE_ROT
                : (vorschauBeschriftung == Texte.t(312) ? FARBE_GELB : FARBE_TUERKIS)))
    zeichneSchiffsVorschau(126, 57, menueStelle == 0 ? -2 : (menueStelle == 1 ? -3 : hervorhebungNummer),
        schiffGewaehlt ? false : zeigeWeiter)
    zeichneSchiffsrollenVorschau(126, 57, schiffGewaehlt ? werftRolleVorschau : schiffsrolle)

    if (schiffGewaehlt) {
        druckeSpielText((besitztSchiff(werftRolleVorschau) ? Texte.t(315) : Texte.t(316)) +
            schiffsrolleName(werftRolleVorschau), 4, 90, jetztEingebaut ? FARBE_GRUEN : FARBE_GELB)
        druckeRechts(Texte.t(317) + schiffsrolleNoetigerRang(werftRolleVorschau), 157, 90,
            istSchiffsrolleFreigeschaltet(werftRolleVorschau) ? FARBE_TEXT : FARBE_ROT)
        // Die Beschreibung des Schiffs endet ein Zeichen vor dem Preis oder dem Hinweis zum Wechseln (längere
        // Beschreibungen laufen durch).
        let schiffsPreis = jetztEingebaut ? ""
            : (besitztSchiff(werftRolleVorschau) ? Texte.t(318) : werftKosten(menueStelle) + Texte.t(319))
        druckeSpielText(kuerzeText(schiffsrolleInfo(werftRolleVorschau),
            Math.idiv(147 - schiffsPreis.length * 6, 6)), 4, 99, FARBE_GEDIMMT)
        if (!jetztEingebaut)
            druckeRechts(schiffsPreis, 157, 99, werftKosten(menueStelle) <= credits ? FARBE_GELB : FARBE_ROT)
    } else if (menueStelle == WERFT_NAME_STELLE) {
        druckeSpielText(Texte.t(320), 4, 90, FARBE_GELB)
        druckeRechts(schiffsAnzeigeName(schiffsrolle), 157, 90, FARBE_GRUEN)
        druckeSpielText(Texte.t(321), 4, 99, FARBE_GEDIMMT)
    } else if (menueStelle == WERFT_LACK_STELLE) {
        druckeSpielText(Texte.t(309), 4, 90, FARBE_GELB)
        druckeRechts(schiffsLackName(schiffsrolle), 157, 90, schiffsLackFarbe())
        druckeSpielText(Texte.t(322), 4, 99, FARBE_GEDIMMT)
    } else if (menueStelle == WERFT_RAKETE_STELLE || menueStelle == WERFT_MINE_STELLE) {
        let anzahl = menueStelle == WERFT_RAKETE_STELLE ? raketen : minen
        let hoechstwert = menueStelle == WERFT_RAKETE_STELLE ? 9 : 6
        druckeSpielText(werftEintragName(menueStelle) + " " + anzahl + "/" + hoechstwert, 4, 90, FARBE_GELB)
        druckeSpielText(menueStelle == WERFT_RAKETE_STELLE ? Texte.t(323) : Texte.t(324), 4, 99, FARBE_GEDIMMT)
        druckeRechts(werftKosten(menueStelle) + Texte.t(319), 157, 99,
            werftKosten(menueStelle) <= credits ? FARBE_GELB : FARBE_ROT)
    } else if (ausbauGewaehlt) {
        let aktuelleStufe = ausbauten[hervorhebungNummer]
        let gezeigteStufe = zeigeWeiter ? aktuelleStufe + 1 : aktuelleStufe
        druckeSpielText(werftEintragName(menueStelle), 4, 90, FARBE_GELB)
        druckeRechts(Texte.t(325) + aktuelleStufe + (jetztEingebaut ? Texte.t(326)
            : (zeigeWeiter ? ">" + gezeigteStufe : Texte.t(327))), 157, 90, FARBE_TEXT)
        let vergleich = ausbauStufeUebersicht(hervorhebungNummer, aktuelleStufe)
        if (zeigeWeiter) vergleich += " > " + ausbauStufeUebersicht(hervorhebungNummer, gezeigteStufe)
        druckeSpielText(kuerzeText(vergleich, 18), 4, 99, FARBE_GEDIMMT)
        if (zeigeWeiter) druckeRechts(werftKosten(menueStelle) + Texte.t(319), 157, 99,
            werftKosten(menueStelle) <= credits ? FARBE_GELB : FARBE_ROT)
    } else if (menueStelle == 0) {
        druckeSpielText(Texte.t(328) + treibstoff + "/" + maxTreibstoff(), 4, 90, FARBE_GELB)
        druckeSpielText(Texte.t(329), 4, 99, FARBE_GEDIMMT)
        druckeRechts(werftKosten(menueStelle) + Texte.t(319), 157, 99,
            werftKosten(menueStelle) <= credits ? FARBE_GELB : FARBE_ROT)
    } else {
        druckeSpielText(Texte.t(330) + rumpf + "/" + maxRumpf(), 4, 90, FARBE_GELB)
        druckeSpielText(Texte.t(331), 4, 99, FARBE_GEDIMMT)
        druckeRechts(werftKosten(menueStelle) + Texte.t(319), 157, 99,
            werftKosten(menueStelle) <= credits ? FARBE_GELB : FARBE_ROT)
    }
    if (bestaetigungOffen) zeichneBestaetigungKasten(schiffGewaehlt
        ? (besitztSchiff(werftRolleVorschau) ? Texte.t(332) : Texte.t(333))
        : Texte.t(334), werftKosten(menueStelle))
    else if (schiffGewaehlt) zeichneFusszeile(Texte.t(335), Texte.t(298))
    else if (kennungGewaehlt) zeichneFusszeile(Texte.t(336), Texte.t(298))
    else zeichneFusszeile(Texte.t(337), Texte.t(298))
}

function zeichneBestaetigungKasten(aktion: string, kosten: number): void {
    screen.fillRect(0, 87, 160, 21, FARBE_HINTERGRUND)
    screen.drawRect(0, 87, 160, 21, FARBE_GELB)
    druckeSpielText(aktion + Texte.t(338), 5, 90, FARBE_TEXT)
    if (kosten > 0) druckeRechts(kosten + Texte.t(319), 155, 90, FARBE_GELB)
    druckeSpielText(Texte.t(339), 5, 99, FARBE_GRUEN)
    druckeRechts(Texte.t(340), 155, 99, FARBE_GEDIMMT)
}

function zeichneMissionen(): void {
    zeichneKopfzeile(Texte.t(248))
    if (missionsArt != MissionsArt.Keine) {
        let herkunft = missionsHerkunft == 2 ? Texte.t(341) : (missionsHerkunft == 1 ? Texte.t(342)
            : (missionsHerkunft == 3 ? Texte.t(343) : Texte.t(200)))
        // Eine Kampagnenmission zeigt den Titel ihrer Stufe und in der Zeile für die Beschreibung der Variante ihre
        // Einweisung (längere Zeilen laufen durch).
        druckeSpielText(herkunft + ": " + (missionsHerkunft == 1 ? kampagneTitel(kampagnenStufe)
            : missionsBeschriftung(missionsArt)), 6, 18, missionsHerkunft > 0 ? FARBE_GELB : FARBE_TEXT)
        druckeSpielText(Texte.t(344) + missionsVarianteName(missionsArt, missionsVariante), 6, 29, FARBE_TUERKIS)
        druckeSpielText(Texte.t(345) + WELT_NAMEN[missionsZiel] + Texte.t(346) + missionsFrist, 6, 40,
            missionsFrist < spieltag ? FARBE_ROT : FARBE_GRUEN)
        druckeSpielText(Texte.t(347) + missionsLohn + Texte.t(319), 6, 51, FARBE_GELB)
        if (missionsArt == MissionsArt.Lieferung) druckeSpielText(Texte.t(274) +
            Texte.t(WARE_NAMEN[missionsWare]) + Texte.t(348) + missionsMenge, 6, 62, FARBE_ORANGE)
        if (missionsArt == MissionsArt.Jagd)
            druckeSpielText(Texte.t(349) + missionsFortschritt + "/" + missionsMenge, 6, 62, FARBE_ROT)
        if (missionsArt == MissionsArt.Rettung)
            druckeSpielText(missionsFortschritt > 0 ? Texte.t(350) : Texte.t(351), 6, 62, FARBE_GRUEN)
        druckeSpielText(kuerzeText(missionsHerkunft == 1 ? kampagneEinweisung(kampagnenStufe)
            : missionsVarianteInfo(missionsArt, missionsVariante), 25), 6, 75, FARBE_GEDIMMT)
        if (bestaetigungOffen) zeichneBestaetigungKasten(Texte.t(352), 0)
        else zeichneFusszeile(Texte.t(353), Texte.t(298))
        return
    }
    if (menueStelle < ersteSichtbareZeile) ersteSichtbareZeile = menueStelle
    if (menueStelle >= ersteSichtbareZeile + 3) ersteSichtbareZeile = menueStelle - 2
    for (let zeile = 0; zeile < 3; zeile++) {
        let angebotNr = ersteSichtbareZeile + zeile
        if (angebotNr >= ANZAHL_MISSIONSANGEBOTE) break
        let y = 17 + zeile * 30
        let herkunft = missionsAngebotHerkunft(angebotNr)
        if (angebotNr == menueStelle) screen.fillRect(2, y - 1, 156, 28, FARBE_LILA)
        if (herkunft > 0)
            screen.fillRect(2, y - 1, 3, 28, herkunft == 2 ? FARBE_GELB :
                (herkunft == 3 ? FARBE_LILA : FARBE_TUERKIS))
        let art = missionsAngebotArt(angebotNr)
        let ziel = missionsAngebotZiel(angebotNr)
        let vorsilbe = herkunft == 2 ? Texte.t(354)
            : (herkunft == 1 ? Texte.t(355) : (herkunft == 3 ? Texte.t(356) : ""))
        // Das Kampagnenangebot nennt seine Stufe; wie im Hangar-Menü läuft nur bei der gewählten Zeile eine
        // lange Zeile durch.
        let angebotZeile = vorsilbe +
            (herkunft == 1 ? kampagneTitel(kampagnenStufe) : missionsBeschriftung(art)) + " > " +
            WELT_NAMEN[ziel]
        druckeSpielText(angebotNr == menueStelle ? angebotZeile : angebotZeile.substr(0, 25), 7, y,
            herkunft > 0 ? FARBE_GELB : FARBE_TEXT)
        let info = ""
        if (art == MissionsArt.Lieferung) info = Texte.t(WARE_NAMEN[missionsAngebotWare(angebotNr)]) +
            Texte.t(348) + missionsAngebotMenge(angebotNr)
        else if (art == MissionsArt.Jagd) info = Texte.t(357) + missionsAngebotMenge(angebotNr)
        else info = Texte.t(358) + missionsAngebotMenge(angebotNr)
        info += " " + missionsVarianteName(art, missionsAngebotVariante(angebotNr))
        // Auf der lila Auswahl wird die Zeile mit der Info in der Textfarbe gezeichnet (Rot war schwer zu lesen).
        druckeSpielText(kuerzeText(info, 24), 7, y + 9,
            angebotNr == menueStelle ? FARBE_TEXT : (art == MissionsArt.Jagd ? FARBE_ROT : FARBE_TUERKIS))
        let gezeigterLohn = angebotNr == menueStelle
            ? verhandelterMissionsLohn(missionsAngebotLohn(angebotNr), missionsVerhandlung)
            : missionsAngebotLohn(angebotNr)
        let verhandlung = angebotNr == menueStelle && missionsVerhandlung > 0 ?
            Texte.t(359) + missionsVerhandlung : ""
        druckeSpielText(gezeigterLohn + Texte.t(319) + verhandlung +
            Texte.t(360) + missionsAngebotFrist(angebotNr),
            7, y + 18, FARBE_GRUEN)
    }
    screen.fillRect(158, 17 + Math.idiv(menueStelle * 78, ANZAHL_MISSIONSANGEBOTE), 2, 12, FARBE_GELB)
    zeichneFusszeile(Texte.t(361), Texte.t(298))
}

function karteX(welt: number): number {
    return 5 + Math.idiv(WELT_X[welt] * 148, 160)
}

function karteY(welt: number): number {
    return 16 + Math.idiv(WELT_Y[welt] * 49, 110)
}

function zeichneSternkarte(): void {
    zeichneKopfzeile(Texte.t(249))
    // Die festen Handelsstrecken machen Gruppen und lange Routen auf einen Blick lesbar.
    for (let i = 0; i < ANZAHL_OEFFENTLICHER_WELTEN; i++) {
        if (i % 6 > 0 && istWeltSichtbar(i - 1) && istWeltSichtbar(i))
            screen.drawLine(karteX(i - 1), karteY(i - 1), karteX(i), karteY(i), FARBE_SCHATTEN)
        if (i >= 6 && istWeltSichtbar(i - 6) && istWeltSichtbar(i))
            screen.drawLine(karteX(i - 6), karteY(i - 6), karteX(i), karteY(i), FARBE_SCHATTEN)
    }
    if (missionsArt != MissionsArt.Keine) {
        screen.drawLine(karteX(aktuelleWelt), karteY(aktuelleWelt), karteX(missionsZiel), karteY(missionsZiel),
            FARBE_ROT)
    }
    if (letzteRouteZiel != karteCursorWelt) {
        planeRouteNach(karteCursorWelt)
        letzteRouteZiel = karteCursorWelt
    }
    let routeVon = routenWeltAnStelle(0)
    for (let sprung = 0; sprung < routeSprungAnzahl(); sprung++) {
        let routeNach = routenWeltAnStelle(sprung + 1)
        screen.drawLine(karteX(routeVon), karteY(routeVon),
            karteX(routeNach), karteY(routeNach), FARBE_TUERKIS)
        routeVon = routeNach
    }
    for (let i = 0; i < ANZAHL_WELTEN; i++) {
        if (!istWeltSichtbar(i)) continue
        let x = karteX(i)
        let y = karteY(i)
        let farbe = istWeltErreichbar(i) ? FARBE_TUERKIS : FARBE_GEDIMMT
        if (i == aktuelleWelt) farbe = FARBE_GRUEN
        screen.fillRect(x - 1, y - 1, 3, 3, farbe)
        if (i == karteCursorWelt) screen.drawRect(x - 3, y - 3, 7, 7, FARBE_GELB)
        if (missionsArt != MissionsArt.Keine && i == missionsZiel) {
            screen.drawLine(x - 4, y, x, y - 4, FARBE_ROT)
            screen.drawLine(x, y - 4, x + 4, y, FARBE_ROT)
            screen.drawLine(x + 4, y, x, y + 4, FARBE_ROT)
            screen.drawLine(x, y + 4, x - 4, y, FARBE_ROT)
        }
    }
    screen.fillRect(0, 69, 160, 39, FARBE_HINTERGRUND)
    screen.drawLine(0, 69, 159, 69, FARBE_TUERKIS)
    let kosten = sprungKosten(aktuelleWelt, karteCursorWelt)
    let sprungText = routeSprungAnzahl() > 0 ? Texte.t(282) + routeSprungAnzahl() +
        Texte.t(362) + routeTreibstoffKosten()
        : Texte.t(363) + kosten
    druckeSpielText(kuerzeText(WELT_NAMEN[karteCursorWelt] + sprungText + " " +
        Texte.t(WIRTSCHAFT_NAMEN[WELT_WIRTSCHAFT[karteCursorWelt]]), 22),
        3, 72, karteCursorWelt == aktuelleWelt ? FARBE_GEDIMMT : FARBE_TEXT)
    druckeRechts(Texte.t(GEFAHR_NAMEN[wirksameWeltGefahr(karteCursorWelt)]), 157, 72,
        wirksameWeltGefahr(karteCursorWelt) >= 2 ? FARBE_ROT : FARBE_GELB)
    if (ausbauten[AUSBAU_SCANNER] > 0) {
        druckeSpielText(
            kuerzeText(weltMerkmalName(karteCursorWelt) + ": " + weltMerkmalInfo(karteCursorWelt),
            26), 3, 81, FARBE_GRUEN)
        let ereignisZeile = marktEreignisAktivIn(karteCursorWelt)
            ? marktEreignisName() + " " + Texte.t(WARE_NAMEN[marktEreignisWare]) : Texte.t(364)
        druckeSpielText(kuerzeText(Texte.t(365) + ereignisZeile, 26), 3, 90,
            marktEreignisAktivIn(karteCursorWelt) ? FARBE_GELB : FARBE_GEDIMMT)
        if (istMarktBekannt(karteCursorWelt)) {
            let bekannteWare = marktwissenWare(karteCursorWelt)
            let bekannterTrend = marktwissenTrend(karteCursorWelt)
            let trendPfeil = bekannterTrend > 0 ? "+" : (bekannterTrend < 0 ? "-" : "=")
            druckeSpielText(kuerzeText(Texte.t(366) + marktwissenAlter(karteCursorWelt) + " " +
                Texte.t(WARE_NAMEN[bekannteWare]) + " " + marktwissenKauf(karteCursorWelt) + "/" +
                marktwissenVerkauf(karteCursorWelt) + trendPfeil, 26), 3, 99, FARBE_TUERKIS)
        } else if (ausbauten[AUSBAU_SCANNER] > 1) {
            let besteWare = besteHandelsWare(karteCursorWelt)
            let spanne =
                preisIn(karteCursorWelt, besteWare, false) - kaufPreis(besteWare)
            druckeSpielText(Texte.t(367) + Texte.t(WARE_NAMEN[besteWare]) + " " +
                (spanne >= 0 ? "+" : "") + spanne + Texte.t(319), 3, 99, spanne > 0 ? FARBE_TUERKIS : FARBE_ROT)
        } else {
            druckeSpielText(Texte.t(368), 3, 99, FARBE_GEDIMMT)
        }
    } else {
        druckeSpielText(kuerzeText(Texte.t(369), 26), 3, 83, FARBE_GEDIMMT)
    }
    zeichneFusszeile(Texte.t(370), Texte.t(298))
}

function statusSeiteName(): string {
    if (statusSeite == STATUS_FRAKTIONEN) return Texte.t(251)
    if (statusSeite == STATUS_LOGBUCH) return Texte.t(252)
    if (statusSeite == STATUS_ERFOLGE) return Texte.t(371)
    if (statusSeite == STATUS_OPTIONEN) return Texte.t(265)
    if (statusSeite == STATUS_HARDWARE) return Texte.t(266)
    if (statusSeite == STATUS_ENTWICKLER) return Texte.t(372)
    return Texte.t(373)
}

function modulAnzeigeName(modul: number): string {
    if (modul == Schiffsmodul.Antrieb) return Texte.t(115)
    if (modul == Schiffsmodul.Scanner) return Texte.t(116)
    if (modul == Schiffsmodul.Waffen) return Texte.t(117)
    return Texte.t(118)
}

function endeFuerFraktionAnzeige(fraktion: number): EndeArt {
    if (fraktion == Fraktion.Gilde) return EndeArt.Handelskrone
    if (fraktion == Fraktion.Forscher) return EndeArt.Entdecker
    if (fraktion == Fraktion.Korsaren) return EndeArt.Freibeuter
    return EndeArt.Bund
}

function missionsFraktionAnzeige(art: MissionsArt, variante: MissionsVariante): Fraktion {
    if (variante == MissionsVariante.Illegal) return Fraktion.Korsaren
    if (art == MissionsArt.Lieferung) return Fraktion.Gilde
    if (art == MissionsArt.Rettung) return Fraktion.Forscher
    return Fraktion.Bund
}

function zeichneSchiffsStatusSeite(): void {
    druckeSpielText(schiffsAnzeigeName(schiffsrolle) + " / " +
        schiffsLackName(schiffsrolle), 6, 17, schiffsLackFarbe())
    druckeSpielText(Texte.t(317) + rangName() + Texte.t(374) + spielPunkte(), 6, 28, FARBE_GELB)
    druckeSpielText(Texte.t(276) + rumpf + "/" + maxRumpf() + Texte.t(375) + maxSchild(), 6, 39, FARBE_GRUEN)
    druckeSpielText(Texte.t(376) + treibstoff + "/" + maxTreibstoff() + Texte.t(377) + frachtEinheiten() + "/" +
        frachtKapazitaet(), 6, 50, FARBE_TUERKIS)
    druckeSpielText(Texte.t(378) + waffenName(aktiveWaffe) + Texte.t(379) + waffenEnergie, 6, 61,
        FARBE_ORANGE)
    druckeSpielText(Texte.t(380) + raketen + Texte.t(381) + minen, 6, 72, FARBE_TEXT)
    let schadenText = Texte.t(382)
    for (let i = 0; i < modulSchaden.length; i++) {
        if (modulSchaden[i] > 0) schadenText = modulAnzeigeName(i) + " " + modulSchadenName(i)
    }
    druckeSpielText(kuerzeText(schadenText, 25), 6, 83, schadenText == Texte.t(382) ? FARBE_GRUEN : FARBE_ROT)
    let verlust = ausbauten[AUSBAU_VERSICHERUNG] == 0 ? Texte.t(383)
        : (ausbauten[AUSBAU_VERSICHERUNG] == 1 ? Texte.t(384) : Texte.t(385))
    druckeSpielText(kuerzeText(Texte.t(386) + verlust, 25), 6, 94, FARBE_GELB)
}

function zeichneFraktionSeite(): void {
    for (let i = 0; i < ANZAHL_FRAKTIONEN; i++) {
        let y = 19 + i * 17
        if (i == statusCursor) zeichneAuswahl(y, 11)
        let ruf = rufVonFraktion(i)
        druckeSpielText(fraktionName(i), 7, y, i == staerksteFraktion() ? FARBE_GELB : FARBE_TEXT)
        druckeRechts((ruf >= 0 ? "+" : "") + ruf, 153, y, ruf >= 0 ? FARBE_GRUEN : FARBE_ROT)
        let breite = Math.min(50, Math.abs(ruf))
        screen.fillRect(84, y + 7, breite, 2, ruf >= 0 ? FARBE_GRUEN : FARBE_ROT)
    }
    if (kampagneFertig()) {
        let gewaehltesEnde = endeFuerFraktionAnzeige(statusCursor)
        let endeText = endeWahl == EndeArt.Keine ? Texte.t(387) + endeName(gewaehltesEnde)
            : Texte.t(388) + endeName(endeWahl)
        let endeFarbe = endeWahl != EndeArt.Keine ? FARBE_GRUEN
            : (istEndeVerfuegbar(gewaehltesEnde) ? FARBE_GELB : FARBE_ROT)
        druckeSpielText(kuerzeText(endeText, 25), 6, 91, endeFarbe)
    } else druckeSpielText(Texte.t(389) + kampagnenStufe + "/" + ANZAHL_KAMPAGNENMISSIONEN, 6, 91, FARBE_GEDIMMT)
}

function zeichneLogbuchSeite(): void {
    druckeSpielText(Texte.t(390) + spruengeGesamt, 6, 17, FARBE_TUERKIS)
    druckeSpielText(Texte.t(391) + lieferungenGesamt + Texte.t(392) + rettungenGesamt, 6, 28, FARBE_GRUEN)
    druckeSpielText(Texte.t(393) + siegeGesamt + Texte.t(394) + bossSiege, 6, 39, FARBE_ROT)
    druckeSpielText(Texte.t(395) + erfuellteMissionen + Texte.t(396) + gescheiterteMissionen, 6, 50, FARBE_TEXT)
    druckeSpielText(Texte.t(397) + verdienstGesamt + Texte.t(319), 6, 61, FARBE_GELB)
    druckeSpielText(Texte.t(398) + groessterHandelsgewinn, 6, 72, FARBE_GRUEN)
    druckeSpielText(Texte.t(399) + besuchteWeltenAnzahlAnzeige() + "/" + ANZAHL_WELTEN + Texte.t(400) +
        schwarzmarktGeschaefte + Texte.t(401) + neuesSpielPlusStufe, 6, 83, FARBE_LILA)
    let artefaktText = hatArtefakt(statusCursor) ? artefaktName(statusCursor) : Texte.t(402)
    druckeSpielText(Texte.t(403) + (statusCursor + 1) + "/" + ANZAHL_ARTEFAKTE + " " +
        kuerzeText(artefaktText, 13), 6, 94, hatArtefakt(statusCursor) ? FARBE_GELB : FARBE_GEDIMMT)
}

function zeichneErfolgSeite(): void {
    if (erfolgCursor < ersteSichtbareZeile) ersteSichtbareZeile = erfolgCursor
    if (erfolgCursor >= ersteSichtbareZeile + 5) ersteSichtbareZeile = erfolgCursor - 4
    for (let zeile = 0; zeile < 5; zeile++) {
        let nummer = ersteSichtbareZeile + zeile
        if (nummer >= ANZAHL_ERFOLGE) break
        let y = 17 + zeile * 17
        if (nummer == erfolgCursor) zeichneAuswahl(y, 14)
        let freigeschaltet = istErfolgFreigeschaltet(nummer)
        druckeSpielText((freigeschaltet ? "* " : Texte.t(404)) + erfolgName(nummer), 6, y,
            freigeschaltet ? FARBE_GELB : FARBE_GEDIMMT)
        druckeSpielText(kuerzeText(freigeschaltet ? erfolgInfo(nummer) : Texte.t(405), 25), 12, y + 8,
            freigeschaltet ? FARBE_TEXT : FARBE_GEDIMMT)
    }
    screen.fillRect(157, 17 + Math.idiv(erfolgCursor * 78, ANZAHL_ERFOLGE), 2, 10, FARBE_GELB)
}

function optionText(stelle: number): string {
    if (stelle == 0) return Texte.t(406) + textTempoName()
    if (stelle == 1) return Texte.t(407) + jaNeinText(hoherKontrast)
    if (stelle == 2) return Texte.t(408) + jaNeinText(kameraWackeln)
    if (stelle == 3) return Texte.t(258) + introModusName()
    if (stelle == 4) return Texte.t(262) + klangrasteName()
    if (stelle == 5) return Texte.t(263) + effektDichteName()
    if (stelle == 6) return Texte.t(409)
    return Texte.t(410)
}

function zeichneOptionenSeite(): void {
    if (statusCursor < ersteSichtbareZeile) ersteSichtbareZeile = statusCursor
    if (statusCursor >= ersteSichtbareZeile + 7) ersteSichtbareZeile = statusCursor - 6
    for (let zeile = 0; zeile < 7; zeile++) {
        let nummer = ersteSichtbareZeile + zeile
        if (nummer >= 8) break
        let y = 17 + zeile * 12
        if (nummer == statusCursor) zeichneAuswahl(y, 10)
        let eingeschaltet = nummer != 7 || manuellerSpielstandVorhanden()
        druckeSpielText(kuerzeText(optionText(nummer), 25), 6, y, eingeschaltet ? FARBE_TEXT : FARBE_GEDIMMT)
    }
    druckeSpielText(Texte.t(411), 6, 99, FARBE_GEDIMMT)
}

function zeichneHardwareSeite(): void {
    druckeSpielText(Texte.t(412), 6, 17, FARBE_GELB)
    screen.drawRect(62, 30, 37, 43, FARBE_METALL)
    screen.fillRect(76, 34, 9, 9, controller.up.isPressed() ? FARBE_GRUEN : FARBE_GEDIMMT)
    screen.fillRect(76, 60, 9, 9, controller.down.isPressed() ? FARBE_GRUEN : FARBE_GEDIMMT)
    screen.fillRect(65, 47, 9, 9, controller.left.isPressed() ? FARBE_GRUEN : FARBE_GEDIMMT)
    screen.fillRect(87, 47, 9, 9, controller.right.isPressed() ? FARBE_GRUEN : FARBE_GEDIMMT)
    screen.fillCircle(119, 43, 7, controller.A.isPressed() ? FARBE_GELB : FARBE_ROT)
    screen.fillCircle(137, 61, 7, controller.B.isPressed() ? FARBE_GELB : FARBE_BLAU)
    for (let i = 0; i < 16; i++) screen.fillRect(4 + i * 9, 78, 8, 8, i)
    druckeSpielText(hardwareBGetestet ? Texte.t(413) : Texte.t(414), hardwareBGetestet ? 10 : 27, 92,
        FARBE_TEXT)
    druckeSpielText(Texte.t(415) + (hatSpielstand ? Texte.t(232) : Texte.t(416)) + Texte.t(417) +
        (manuellerSpielstandVorhanden() ? Texte.t(232) : Texte.t(416)), 9, 102, FARBE_GRUEN)
}

function zeichneEntwicklerSeite(): void {
    let statistik = control.gcStats()
    druckeSpielText(Texte.t(418) + anzeigeFps, 6, 18, anzeigeFps >= 25 ? FARBE_GRUEN : FARBE_ROT)
    druckeSpielText(Texte.t(419) + control.ramSize(), 6, 31, FARBE_TEXT)
    druckeSpielText(Texte.t(420) + anzeigeLetzteFreiBytes, 6, 44, FARBE_TUERKIS)
    druckeSpielText(Texte.t(421) + anzeigeMinFreiBytes, 6, 57, FARBE_GELB)
    druckeSpielText(Texte.t(422) + (statistik ? statistik.numGC : 0), 6, 70, FARBE_GEDIMMT)
    druckeSpielText(Texte.t(423) + spieltag + "/" + aktuelleWelt, 6, 83, FARBE_TEXT)
    druckeSpielText(Texte.t(424) + jaNeinText(entwicklerModus), 6, 96,
        entwicklerModus ? FARBE_GRUEN : FARBE_GEDIMMT)
}

function zeichneStatus(): void {
    zeichneKopfzeile(statusSeiteName())
    if (statusSeite == STATUS_SCHIFF) zeichneSchiffsStatusSeite()
    else if (statusSeite == STATUS_FRAKTIONEN) zeichneFraktionSeite()
    else if (statusSeite == STATUS_LOGBUCH) zeichneLogbuchSeite()
    else if (statusSeite == STATUS_ERFOLGE) zeichneErfolgSeite()
    else if (statusSeite == STATUS_OPTIONEN) zeichneOptionenSeite()
    else if (statusSeite == STATUS_HARDWARE) zeichneHardwareSeite()
    else zeichneEntwicklerSeite()
    if (statusSeite == STATUS_ENTWICKLER) zeichneFusszeile(Texte.t(425), Texte.t(298))
    else if (statusSeite == STATUS_LOGBUCH) zeichneFusszeile(Texte.t(426), Texte.t(298))
    else if (statusSeite == STATUS_ERFOLGE) zeichneFusszeile(Texte.t(427), Texte.t(298))
    else if (statusSeite != STATUS_HARDWARE) zeichneFusszeile(Texte.t(428), Texte.t(298))
}

function zeichneMeldung(): void {
    let schluessel = meldungZeile1 + "|" + meldungZeile2 + "|" + meldungZeile3
    if (schluessel != meldungBildSchluessel) {
        meldungBildSchluessel = schluessel
        meldungEnthuellungBegonnen = game.runtime()
    }
    let versatz2 = meldungZeile1.length
    let versatz3 = versatz2 + meldungZeile2.length
    screen.fill(FARBE_HINTERGRUND)
    screen.drawRect(3, 15, 154, 90, FARBE_TUERKIS)
    let y = druckeUmbrochenText(meldungZeileTeil(meldungZeile1, 0), 8, 21, 24, FARBE_GELB) + 3
    y = druckeUmbrochenText(meldungZeileTeil(meldungZeile2, versatz2), 8, y, 24, FARBE_TEXT) + 3
    druckeUmbrochenText(meldungZeileTeil(meldungZeile3, versatz3), 8, y, 24, FARBE_GRUEN)
    druckeSpielText(Texte.t(429), 55, 109, FARBE_GEDIMMT)
}

function zeichneSpielstandLoeschen(): void {
    screen.fill(FARBE_HINTERGRUND)
    screen.drawRect(12, 27, 136, 65, FARBE_ROT)
    // Der Kasten ist 136 Pixel breit. Die Frage zum neuen Spiel+ steht in der Mitte (x = 81 - 3 × Länge, höchstens 23),
    // so bleibt auch eine lange Frage im Kasten. Die andere Frage beginnt bei x = 20.
    let frage = bestaetigungNeuesSpielPlus ? Texte.t(430) : Texte.t(431)
    druckeSpielText(frage, bestaetigungNeuesSpielPlus ?
        Math.min(23, 81 - frage.length * 3) : 20, 39, FARBE_GELB)
    druckeSpielText(bestaetigungNeuesSpielPlus ? Texte.t(432) : Texte.t(433),
        bestaetigungNeuesSpielPlus ? 29 : 26, 55,
        bestaetigungNeuesSpielPlus ? FARBE_GRUEN : FARBE_ROT)
    druckeSpielText(Texte.t(434), 31, 75, FARBE_TEXT)
}

function zeichneAktuelleSzene(): void {
    if (aktiveSzene == Szene.Intro) zeichneIntro()
    else if (aktiveSzene == Szene.Titel) zeichneTitel()
    else if (aktiveSzene == Szene.Hangar) zeichneHangar()
    else if (aktiveSzene == Szene.Markt) zeichneMarkt()
    else if (aktiveSzene == Szene.Werft) zeichneWerft()
    else if (aktiveSzene == Szene.Missionen) zeichneMissionen()
    else if (aktiveSzene == Szene.Sternkarte) zeichneSternkarte()
    else if (aktiveSzene == Szene.Status) zeichneStatus()
    else if (aktiveSzene == Szene.Flug) zeichneFlug()
    else if (aktiveSzene == Szene.Meldung) zeichneMeldung()
    else if (aktiveSzene == Szene.SpielstandLoeschen) zeichneSpielstandLoeschen()
}

function aendereHandelsMenge(aenderung: number): void {
    if (istSchwarzmarkt && menueStelle >= ANZAHL_WAREN) {
        let raritaetNr = menueStelle - ANZAHL_WAREN
        handelsMenge = Math.clamp(0 - raritaeten[raritaetNr], 0, handelsMenge + aenderung)
        return
    }
    let stueckPreis = istSchwarzmarkt ? schwarzmarktKaufPreis(menueStelle) : kaufPreis(menueStelle)
    let verfuegbar = istSchwarzmarkt ? 6 : marktVorrat[menueStelle]
    let maxKauf = Math.min(verfuegbar, frachtKapazitaet() - frachtEinheiten())
    maxKauf = Math.min(maxKauf, Math.idiv(credits, stueckPreis))
    let minVerkauf = 0 - fracht[menueStelle]
    handelsMenge = Math.clamp(minVerkauf, maxKauf, handelsMenge + aenderung)
}

function wendeHandelAn(): void {
    let ware = menueStelle
    if (istSchwarzmarkt && ware >= ANZAHL_WAREN) {
        let raritaetNr = ware - ANZAHL_WAREN
        let menge = Math.min(raritaeten[raritaetNr], 0 - handelsMenge)
        if (menge > 0) {
            let erloes = verkaufeRaritaet(raritaetNr, menge)
            erfasseSchwarzmarktHandel(0)
            marktRueckmeldungText = Texte.t(435)
            marktRueckmeldungFarbe = FARBE_LILA
            marktRueckmeldungBisMs = game.runtime() + 3000
            klangVerkauf()
        }
        handelOffen = false
        handelsMenge = 0
        aktualisiereErfolge()
        schreibeSpielstand()
        return
    }
    if (handelsMenge > 0) {
        let menge = handelsMenge
        let stueckPreis = istSchwarzmarkt ? schwarzmarktKaufPreis(ware) : kaufPreis(ware)
        let kosten = menge * stueckPreis
        if (kosten > credits || (!istSchwarzmarkt && menge > marktVorrat[ware]) ||
            frachtEinheiten() + menge > frachtKapazitaet()) return
        credits -= kosten
        fracht[ware] += menge
        frachtKosten[ware] += kosten
        if (!istSchwarzmarkt) marktVorrat[ware] -= menge
        if (istSchwarzmarkt) erfasseSchwarzmarktHandel(0)
        else wendeHandelsEinflussAn(ware, menge)
        marktRueckmeldungText = Texte.t(436) + Texte.t(WARE_NAMEN[ware]) + Texte.t(348) + menge +
            " -" + kosten
        marktRueckmeldungFarbe = FARBE_GRUEN
        marktRueckmeldungBisMs = game.runtime() + 2600
        klangKauf()
    } else if (handelsMenge < 0) {
        let menge = 0 - handelsMenge
        if (menge > fracht[ware]) return
        let alteEinheiten = fracht[ware]
        let entfernteKosten = alteEinheiten > 0 ? Math.idiv(frachtKosten[ware] * menge, alteEinheiten) : 0
        let erloes = menge * (istSchwarzmarkt ? schwarzmarktVerkaufPreis(ware) : verkaufPreis(ware))
        credits += erloes
        fracht[ware] -= menge
        frachtKosten[ware] -= entfernteKosten
        if (fracht[ware] == 0) frachtKosten[ware] = 0
        if (!istSchwarzmarkt) marktVorrat[ware] = Math.min(99, marktVorrat[ware] + menge)
        let gewinn = erloes - entfernteKosten
        if (gewinn > 0) handelsGewinn += gewinn
        if (istSchwarzmarkt) erfasseSchwarzmarktHandel(gewinn)
        else {
            wendeHandelsEinflussAn(ware, 0 - menge)
            erfasseHandelsgewinn(gewinn)
        }
        marktRueckmeldungText = gewinn >= 0 ? Texte.t(437) + gewinn + Texte.t(319)
            : Texte.t(438) + gewinn + Texte.t(319)
        marktRueckmeldungFarbe = gewinn >= 0 ? FARBE_GRUEN : FARBE_ROT
        marktRueckmeldungBisMs = game.runtime() + 3000
        klangVerkauf()
    }
    handelOffen = false
    handelsMenge = 0
    if (!istSchwarzmarkt) merkeAktuellenMarkt()
    aktualisiereErfolge()
    schreibeSpielstand()
}

function kaufeWerftEintrag(): void {
    let kosten = werftKosten(menueStelle)
    if (menueStelle == WERFT_SCHIFF_STELLE) {
        if (!istSchiffsrolleFreigeschaltet(werftRolleVorschau)) {
            bestaetigungOffen = false
            zeigeMeldung(Texte.t(439), Texte.t(317) + schiffsrolleNoetigerRang(werftRolleVorschau),
                schiffsrolleName(werftRolleVorschau), Szene.Werft)
            klangFehler()
            return
        }
        if (!besitztSchiff(werftRolleVorschau) && credits < kosten) {
            bestaetigungOffen = false
            zeigeMeldung(Texte.t(440), Texte.t(441) + (kosten - credits) + Texte.t(319),
                Texte.t(315) + schiffsrolleName(werftRolleVorschau), Szene.Werft)
            klangFehler()
            return
        }
        if (!kaufeOderWaehleSchiff(werftRolleVorschau)) {
            bestaetigungOffen = false
            zeigeMeldung(Texte.t(442), Texte.t(443), schiffsrolleName(werftRolleVorschau),
                Szene.Werft)
            klangFehler()
            return
        }
        bestaetigungOffen = false
        werftEingebautNummer = -1
        klangKauf()
        schreibeSpielstand()
        return
    }
    if (menueStelle == WERFT_NAME_STELLE || menueStelle == WERFT_LACK_STELLE) return
    if (kosten <= 0) return
    if (credits < kosten) {
        bestaetigungOffen = false
        zeigeMeldung(Texte.t(440), Texte.t(441) + (kosten - credits) + Texte.t(319), "",
            Szene.Werft)
        return
    }
    credits -= kosten
    if (menueStelle == 0) treibstoff++
    else if (menueStelle == 1) {
        rumpf = Math.min(maxRumpf(), rumpf + 1)
        repariereModule()
    } else if (menueStelle == WERFT_RAKETE_STELLE) raketen++
    else if (menueStelle == WERFT_MINE_STELLE) minen++
    else {
        let nummer = menueStelle - 2
        ausbauten[nummer]++
        if (nummer == AUSBAU_PANZER) rumpf = Math.min(maxRumpf(), rumpf + 3)
        if (nummer == AUSBAU_SPRUNG) treibstoff = Math.min(maxTreibstoff(), treibstoff + 1)
        werftEingebautNummer = nummer
    }
    bestaetigungOffen = false
    klangKauf()
    schreibeSpielstand()
}

function nimmMissionAn(angebotNr: number): void {
    let art = missionsAngebotArt(angebotNr)
    let menge = missionsAngebotMenge(angebotNr)
    let noetig = art == MissionsArt.Jagd ? 0 : menge
    if (frachtEinheiten() + noetig > frachtKapazitaet()) {
        zeigeMeldung(Texte.t(444), Texte.t(445), "", Szene.Missionen)
        return
    }
    let angebotStartwert = missionsAngebotStartwert(angebotNr)
    if (missionsVerhandlung > 0 && !verhandlungGelungen(angebotStartwert, missionsVerhandlung)) {
        missionsVerhandlung = 0
        aendereFraktionsRuf(Fraktion.Gilde, -1)
        zeigeMeldung(Texte.t(446), Texte.t(447), Texte.t(448), Szene.Missionen)
        klangFehler()
        return
    }
    // Erst das ganze Angebot lesen: Kampagnen- und Tagesangebote gibt es nur, solange keine Mission läuft.
    let angebotHerkunft = missionsAngebotHerkunft(angebotNr)
    let angebotZiel = missionsAngebotZiel(angebotNr)
    let angebotFrist = missionsAngebotFrist(angebotNr)
    let angebotLohn = verhandelterMissionsLohn(missionsAngebotLohn(angebotNr), missionsVerhandlung)
    let angebotWare = missionsAngebotWare(angebotNr)
    let angebotVariante = missionsAngebotVariante(angebotNr)
    missionsArt = art
    missionsAnnahmeWelt = aktuelleWelt
    missionsZiel = angebotZiel
    missionsFrist = angebotFrist
    missionsLohn = angebotLohn
    missionsWare = angebotWare
    missionsMenge = menge
    missionsFortschritt = 0
    missionsStartwert = angebotStartwert
    missionsVariante = angebotVariante
    missionsHerkunft = angebotHerkunft
    if (missionsHerkunft == 3) markiereTagesMissionsAngenommen()
    if (missionsHerkunft == 2 && tutorialStufe < 2) tutorialStufe = 2
    let angenommenerTitel = missionsHerkunft == 2 ? Texte.t(449) : (missionsHerkunft == 1 ? Texte.t(450)
        : (missionsHerkunft == 3 ? Texte.t(451) : Texte.t(452)))
    missionsVerhandlung = 0
    zeigeMeldung(angenommenerTitel,
        missionsHerkunft == 1 ? kampagneTitel(kampagnenStufe) : missionsVarianteName(art, missionsVariante),
        Texte.t(345) + WELT_NAMEN[missionsZiel], Szene.Hangar)
    klangMission()
    schreibeSpielstand()
}

function bewegeKarteCursor(dx: number, dy: number): void {
    let beste = karteCursorWelt
    let besteWertung = 99999
    for (let i = 0; i < ANZAHL_WELTEN; i++) {
        if (i == karteCursorWelt || !istWeltSichtbar(i)) continue
        let vx = WELT_X[i] - WELT_X[karteCursorWelt]
        let vy = WELT_Y[i] - WELT_Y[karteCursorWelt]
        if (dx > 0 && vx <= 0) continue
        if (dx < 0 && vx >= 0) continue
        if (dy > 0 && vy <= 0) continue
        if (dy < 0 && vy >= 0) continue
        let hauptRichtung = dx != 0 ? Math.abs(vx) : Math.abs(vy)
        let nebenRichtung = dx != 0 ? Math.abs(vy) : Math.abs(vx)
        let wertung = hauptRichtung + nebenRichtung * 3
        if (wertung < besteWertung) {
            besteWertung = wertung
            beste = i
        }
    }
    karteCursorWelt = beste
}

function bearbeiteRichtung(dx: number, dy: number): void {
    if (eingabeGesperrt) return
    let altMenueStelle = menueStelle
    let altHandelsMenge = handelsMenge
    let altKarteCursorWelt = karteCursorWelt
    let altWerftRolle = werftRolleVorschau
    let altSpielModus = spielModus
    let altMissionsVerhandlung = missionsVerhandlung
    let altStatusSeite = statusSeite
    let altStatusCursor = statusCursor
    let altErfolgCursor = erfolgCursor
    let direktKlang = false
    if (aktiveSzene == Szene.Titel) {
        if (dy < 0) menueStelle = Math.max(0, menueStelle - 1)
        if (dy > 0) menueStelle = Math.min(ANZAHL_TITEL_EINTRAEGE - 1, menueStelle + 1)
        if (menueStelle == 1 && dx != 0) {
            wechsleIntroModus(dx < 0 ? -1 : 1)
        } else if (menueStelle == 3 && dx != 0) {
            wechsleKlangraste(dx < 0 ? -1 : 1)
            klangNavigation()
            direktKlang = true
        } else if (menueStelle == 4 && dx != 0) {
            wechsleEffektDichte(dx < 0 ? -1 : 1)
        } else if (menueStelle == 5 && dx != 0) {
            if (istTitelModusAenderbar()) wechsleTitelModus(dx < 0 ? -1 : 1)
            else {
                klangFehler()
                direktKlang = true
            }
        }
    } else if (aktiveSzene == Szene.Hangar && !bestaetigungOffen) {
        if (dy < 0) menueStelle = Math.max(0, menueStelle - 1)
        if (dy > 0) menueStelle = Math.min(HANGAR_EINTRAEGE.length - 1, menueStelle + 1)
    } else if (aktiveSzene == Szene.Markt) {
        if (handelOffen) {
            if (dx < 0) aendereHandelsMenge(-1)
            if (dx > 0) aendereHandelsMenge(1)
            if (dy < 0) aendereHandelsMenge(5)
            if (dy > 0) aendereHandelsMenge(-5)
        } else {
            if (dy < 0) menueStelle = Math.max(0, menueStelle - 1)
            if (dy > 0)
                menueStelle =
                Math.min((istSchwarzmarkt ? ANZAHL_WAREN + ANZAHL_RARITAETEN : ANZAHL_WAREN) - 1,
                menueStelle + 1)
        }
    } else if (aktiveSzene == Szene.Werft && !bestaetigungOffen) {
        let vorherigeStelle = menueStelle
        if (dy < 0) menueStelle = Math.max(0, menueStelle - 1)
        if (dy > 0) menueStelle = Math.min(ANZAHL_WERFT_EINTRAEGE - 1, menueStelle + 1)
        if (menueStelle != vorherigeStelle) werftEingebautNummer = -1
        if (menueStelle == WERFT_SCHIFF_STELLE && dx != 0) wechsleWerftRolle(dx < 0 ? -1 : 1)
        else if (menueStelle == WERFT_NAME_STELLE && dx != 0) {
            wechsleSchiffsName(schiffsrolle, dx < 0 ? -1 : 1)
            schreibeSpielstand()
        } else if (menueStelle == WERFT_LACK_STELLE && dx != 0) {
            wechsleSchiffsLack(schiffsrolle, dx < 0 ? -1 : 1)
            schreibeSpielstand()
        }
    } else if (aktiveSzene == Szene.Missionen && missionsArt == MissionsArt.Keine) {
        if (dy < 0) menueStelle = Math.max(0, menueStelle - 1)
        if (dy > 0) menueStelle = Math.min(ANZAHL_MISSIONSANGEBOTE - 1, menueStelle + 1)
        if (dx < 0) missionsVerhandlung = Math.max(0, missionsVerhandlung - 1)
        if (dx > 0) missionsVerhandlung = Math.min(2, missionsVerhandlung + 1)
    } else if (aktiveSzene == Szene.Sternkarte) {
        bewegeKarteCursor(dx, dy)
        letzteRouteZiel = -1
    } else if (aktiveSzene == Szene.Status) {
        if (statusSeite == STATUS_HARDWARE) {
            // Hier passiert nichts: Alle Richtungen bleiben beim Tester, damit die Live-Anzeige jede gedrückte Richtung
            // des GameKits zeigt.
        } else if (dy != 0) {
            if (statusSeite == STATUS_FRAKTIONEN)
                statusCursor = Math.clamp(0, ANZAHL_FRAKTIONEN - 1, statusCursor + dy)
            else if (statusSeite == STATUS_LOGBUCH)
                statusCursor = Math.clamp(0, ANZAHL_ARTEFAKTE - 1, statusCursor + dy)
            else if (statusSeite == STATUS_ERFOLGE)
                erfolgCursor = Math.clamp(0, ANZAHL_ERFOLGE - 1, erfolgCursor + dy)
            else if (statusSeite == STATUS_OPTIONEN) statusCursor = Math.clamp(0, 7, statusCursor + dy)
        } else if (dx != 0) {
            statusSeite = (statusSeite + dx + ANZAHL_STATUS_SEITEN) % ANZAHL_STATUS_SEITEN
            statusCursor = 0
            ersteSichtbareZeile = 0
            if (statusSeite == STATUS_HARDWARE) hardwareBGetestet = false
        }
    }
    if (!direktKlang && (menueStelle != altMenueStelle || handelsMenge != altHandelsMenge ||
        karteCursorWelt != altKarteCursorWelt || werftRolleVorschau != altWerftRolle ||
        spielModus != altSpielModus || missionsVerhandlung != altMissionsVerhandlung ||
        statusSeite != altStatusSeite || statusCursor != altStatusCursor ||
        erfolgCursor != altErfolgCursor)) klangNavigation()
}

function bearbeiteA(): void {
    if (eingabeGesperrt) return
    if (aktiveSzene == Szene.Intro) beendeIntro()
    else if (aktiveSzene == Szene.Titel) {
        if (menueStelle == 0) {
            if (!hatSpielstand) {
                let gewaehlterModus = spielModus
                neuesSpiel()
                spielModus = gewaehlterModus
                schreibeSpielstand()
            }
            if (inFlug != 0) setzeReiseFort()
            else setzeSzene(Szene.Hangar)
        } else if (menueStelle == 1) {
            wechsleIntroModus(1)
        } else if (menueStelle == 2) {
            starteIntro()
        } else if (menueStelle == 3) {
            wechsleKlangraste(1)
            klangNavigation()
        } else if (menueStelle == 4) {
            wechsleEffektDichte(1)
            klangNavigation()
        } else if (menueStelle == 5) {
            if (istTitelModusAenderbar()) {
                wechsleTitelModus(1)
                klangNavigation()
            } else {
                zeigeMeldung(Texte.t(453), Texte.t(143), spielModusName(spielModus), Szene.Titel)
                klangFehler()
            }
        } else if (menueStelle == 6) {
            statusSeite = STATUS_OPTIONEN
            statusCursor = 0
            statusRueckkehrSzene = Szene.Titel
            setzeSzene(Szene.Status)
        } else if (menueStelle == 7) {
            statusSeite = STATUS_HARDWARE
            statusCursor = 0
            hardwareBGetestet = false
            statusRueckkehrSzene = Szene.Titel
            setzeSzene(Szene.Status)
        } else if (menueStelle == 8 && kannNeuesSpielPlusStarten()) {
            bestaetigungNeuesSpielPlus = true
            setzeSzene(Szene.SpielstandLoeschen)
        } else if (menueStelle == 9 && hatSpielstand) {
            bestaetigungNeuesSpielPlus = false
            setzeSzene(Szene.SpielstandLoeschen)
        } else klangFehler()
    } else if (aktiveSzene == Szene.Hangar) {
        if (bestaetigungOffen) ueberspringeGefuehrteLieferung()
        else if (menueStelle == 0) {
            istSchwarzmarkt = false
            merkeAktuellenMarkt()
            setzeSzene(Szene.Markt)
        } else if (menueStelle == 1) {
            if (!schwarzmarktVerfuegbar()) {
                zeigeMeldung(Texte.t(454), Texte.t(455), Texte.t(456), Szene.Hangar)
                klangFehler()
            } else {
                istSchwarzmarkt = true
                setzeSzene(Szene.Markt)
            }
        } else if (menueStelle == 2) {
            werftEingebautNummer = -1
            werftRolleVorschau = schiffsrolle
            setzeSzene(Szene.Werft)
        } else if (menueStelle == 3) {
            missionsVerhandlung = 0
            setzeSzene(Szene.Missionen)
        } else if (menueStelle == 4) {
            karteVorherigeRouteZiel = routeSprungAnzahl() > 0 ? routenWeltAnStelle(routeSprungAnzahl()) : zielWelt
            karteCursorWelt = karteVorherigeRouteZiel
            letzteRouteZiel = -1
            setzeSzene(Szene.Sternkarte)
        } else if (menueStelle == 5) {
            statusSeite = STATUS_SCHIFF
            statusCursor = 0
            statusRueckkehrSzene = Szene.Hangar
            setzeSzene(Szene.Status)
        } else if (menueStelle == 6) {
            statusSeite = STATUS_FRAKTIONEN
            statusCursor = staerksteFraktion()
            statusRueckkehrSzene = Szene.Hangar
            setzeSzene(Szene.Status)
        } else if (menueStelle == 7) {
            statusSeite = STATUS_LOGBUCH
            statusRueckkehrSzene = Szene.Hangar
            setzeSzene(Szene.Status)
        } else if (menueStelle == 8) {
            statusSeite = STATUS_OPTIONEN
            statusCursor = 0
            statusRueckkehrSzene = Szene.Hangar
            setzeSzene(Szene.Status)
        }
        else if (zielWelt != aktuelleWelt) starteReise()
        else klangFehler()
    } else if (aktiveSzene == Szene.Markt) {
        if (handelOffen) wendeHandelAn()
        else {
            handelOffen = true
            handelsMenge = 0
            if (istSchwarzmarkt && menueStelle >= ANZAHL_WAREN) {
                if (raritaeten[menueStelle - ANZAHL_WAREN] > 0) handelsMenge = -1
            } else {
                let verfuegbar = istSchwarzmarkt ? 6 : marktVorrat[menueStelle]
                let stueckPreis = istSchwarzmarkt ? schwarzmarktKaufPreis(menueStelle) : kaufPreis(menueStelle)
                if (verfuegbar > 0 && credits >= stueckPreis && frachtEinheiten() < frachtKapazitaet())
                    handelsMenge = 1
                else if (fracht[menueStelle] > 0) handelsMenge = -1
            }
        }
    } else if (aktiveSzene == Szene.Werft) {
        if (bestaetigungOffen) kaufeWerftEintrag()
        else if (menueStelle == WERFT_SCHIFF_STELLE) {
            if (werftRolleVorschau == schiffsrolle) klangFehler()
            else if (!istSchiffsrolleFreigeschaltet(werftRolleVorschau)) {
                zeigeMeldung(Texte.t(457), Texte.t(458) + schiffsrolleNoetigerRang(werftRolleVorschau),
                    schiffsrolleName(werftRolleVorschau), Szene.Werft)
                klangFehler()
            } else if (werftKosten(menueStelle) > credits) {
                zeigeMeldung(Texte.t(440),
                    Texte.t(441) + (werftKosten(menueStelle) - credits) + Texte.t(319),
                    schiffsrolleName(werftRolleVorschau), Szene.Werft)
                klangFehler()
            } else bestaetigungOffen = true
        }
        else if (menueStelle == WERFT_NAME_STELLE) {
            wechsleSchiffsName(schiffsrolle, 1)
            schreibeSpielstand()
        } else if (menueStelle == WERFT_LACK_STELLE) {
            wechsleSchiffsLack(schiffsrolle, 1)
            schreibeSpielstand()
        }
        else if (menueStelle >= 2 && menueStelle < WERFT_SCHIFF_STELLE &&
            ausbauten[menueStelle - 2] >= AUSBAU_MAX[menueStelle - 2]) klangFehler()
        else if (werftKosten(menueStelle) <= 0) klangFehler()
        else {
            werftEingebautNummer = -1
            bestaetigungOffen = true
        }
    } else if (aktiveSzene == Szene.Missionen) {
        if (missionsArt == MissionsArt.Keine) nimmMissionAn(menueStelle)
        else if (bestaetigungOffen) {
            let abgebrocheneArt = missionsArt
            let abgebrocheneVariante = missionsVariante
            let training = missionsHerkunft == 2
            if (training && tutorialStufe < 4) tutorialStufe = 1
            if (!training) {
                gescheiterteMissionen++
                aendereFraktionsRuf(missionsFraktionAnzeige(abgebrocheneArt, abgebrocheneVariante), -2)
            }
            leereMission()
            bestaetigungOffen = false
            schreibeSpielstand()
            zeigeMeldung(training ? Texte.t(459) : Texte.t(460),
                training ? Texte.t(461) : Texte.t(462), "", Szene.Hangar)
        } else bestaetigungOffen = true
    } else if (aktiveSzene == Szene.Sternkarte) {
        if (karteCursorWelt == aktuelleWelt) {
            leereGeplanteRoute()
            zielWelt = aktuelleWelt
            setzeSzene(Szene.Hangar)
        } else if (planeRouteNach(karteCursorWelt) && routeSprungAnzahl() > 0) {
            zielWelt = routenWeltAnStelle(1)
            setzeSzene(Szene.Hangar)
        } else {
            zeigeMeldung(Texte.t(463), Texte.t(464), Texte.t(465), Szene.Sternkarte)
        }
    } else if (aktiveSzene == Szene.Status) {
        if (statusSeite == STATUS_FRAKTIONEN && kampagneFertig() && endeWahl == EndeArt.Keine) {
            let ende = endeFuerFraktionAnzeige(statusCursor)
            if (istEndeVerfuegbar(ende) && waehleEnde(ende)) {
                schreibeSpielstand()
                zeigeMeldung(Texte.t(466), endeName(ende), Texte.t(467), Szene.Status)
            } else {
                zeigeMeldung(Texte.t(468), Texte.t(469), endeName(ende), Szene.Status)
                klangFehler()
            }
        } else if (statusSeite == STATUS_OPTIONEN) {
            if (statusCursor == 0) wechsleTextTempo(1)
            else if (statusCursor == 1) schalteKontrast()
            else if (statusCursor == 2) schalteKameraWackeln()
            else if (statusCursor == 3) wechsleIntroModus(1)
            else if (statusCursor == 4) wechsleKlangraste(1)
            else if (statusCursor == 5) wechsleEffektDichte(1)
            else if (statusCursor == 6) {
                schreibeManuellenSpielstand()
                zeigeMeldung(Texte.t(470), WELT_NAMEN[aktuelleWelt] + Texte.t(471) + spieltag,
                    Texte.t(472), Szene.Status)
            } else if (manuellerSpielstandVorhanden()) {
                ladeManuellenSpielstand()
                zeigeMeldung(Texte.t(473), WELT_NAMEN[aktuelleWelt] + Texte.t(471) + spieltag,
                    Texte.t(474), Szene.Status)
            } else klangFehler()
            if (statusCursor <= 2 && hatSpielstand) schreibeSpielstand()
        } else if (statusSeite == STATUS_HARDWARE) {
            klangMission()
        } else if (statusSeite == STATUS_ENTWICKLER) {
            schalteEntwicklerModus()
        }
    }
    else if (aktiveSzene == Szene.Meldung) {
        meldungBildSchluessel = ""
        setzeSzene(rueckkehrSzene)
    }
    else if (aktiveSzene == Szene.SpielstandLoeschen) {
        if (bestaetigungNeuesSpielPlus) starteNeuesSpielPlus()
        else loescheSpielstand()
        bestaetigungNeuesSpielPlus = false
        setzeSzene(Szene.Titel)
    }
}

function bearbeiteB(): void {
    if (eingabeGesperrt) return
    if (aktiveSzene == Szene.Intro) beendeIntro()
    else if (aktiveSzene == Szene.Titel) {
        // B tut auf dem Titelbildschirm nichts: Aktionen, die etwas löschen, haben eigene, gut sichtbare Menüpunkte.
    } else if (aktiveSzene == Szene.Hangar) {
        // Bei der geführten ersten Lieferung fragt B, ob man sie überspringen will; ein zweites B behält die Führung.
        if (bestaetigungOffen) bestaetigungOffen = false
        else if (laeuftGefuehrteLieferung()) bestaetigungOffen = true
        else setzeSzene(Szene.Titel)
    }
    else if (aktiveSzene == Szene.Markt) {
        if (handelOffen) {
            handelOffen = false
            handelsMenge = 0
        } else setzeSzene(Szene.Hangar)
    } else if (aktiveSzene == Szene.Werft) {
        if (bestaetigungOffen) bestaetigungOffen = false
        else {
            schreibeSpielstand()
            setzeSzene(Szene.Hangar)
        }
    } else if (aktiveSzene == Szene.Missionen) {
        if (bestaetigungOffen) bestaetigungOffen = false
        else setzeSzene(Szene.Hangar)
    } else if (aktiveSzene == Szene.Sternkarte) {
        if (karteVorherigeRouteZiel != aktuelleWelt) planeRouteNach(karteVorherigeRouteZiel)
        else leereGeplanteRoute()
        setzeSzene(Szene.Hangar)
    } else if (aktiveSzene == Szene.Status) {
        if (statusSeite == STATUS_HARDWARE && !hardwareBGetestet) {
            hardwareBGetestet = true
            klangNavigation()
        } else setzeSzene(statusRueckkehrSzene)
    }
    else if (aktiveSzene == Szene.Meldung) {
        meldungBildSchluessel = ""
        setzeSzene(rueckkehrSzene)
    }
    else if (aktiveSzene == Szene.SpielstandLoeschen) {
        bestaetigungNeuesSpielPlus = false
        setzeSzene(Szene.Titel)
    }
}

// font8 zeichnet die Umlaute und das ß, die in der kompakten font5 fehlen. Die Breite ist immer sechs Pixel; zu lange
// Beschriftungen laufen durch, damit kein Wort verloren geht.
function druckeSpielText(text: string, x: number, y: number, farbe: number): void {
    x = Math.max(0, x)
    let spalten = Math.max(1, Math.idiv(160 - x, 6))
    screen.print(kuerzeText(text, spalten), x, y, farbe, image.font8)
}

function druckeUmbrochenText(text: string, x: number, y: number, spalten: number, farbe: number): number {
    let versatz = 0
    while (versatz < text.length) {
        let anzahl = Math.min(spalten, text.length - versatz)
        if (versatz + anzahl < text.length) {
            let grenze = anzahl
            while (grenze > 0 && text.charAt(versatz + grenze) != " ") grenze--
            if (grenze > 0) anzahl = grenze
        }
        druckeSpielText(text.substr(versatz, anzahl), x, y, farbe)
        versatz += anzahl
        while (text.charAt(versatz) == " ") versatz++
        y += 10
    }
    return y
}
