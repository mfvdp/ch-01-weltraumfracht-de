// Der Flug zwischen zwei Welten: Phasen, Begegnungen, Kämpfe, Rettung und Andocken.
let flugPhase = FlugPhase.Start
let phaseBegonnen = 0
let flugLetzteAktualisierung = 0
let flugSchild = 0
let fadenkreuzX = 80
let fadenkreuzY = 52
let waffeBereitMs = 0
let waffenBlitzBisMs = 0
let waffenTreffer = false
let laserHitze = 0
let fluchtBeginnMs = 0
let gegnerAktiv = false
let gegnerArt = 0
let gegnerX = 80
let gegnerY = 42
let gegnerVx = 1
let gegnerVy = 1
let gegnerGroesse = 10
let gegnerRumpf = 0
let gegnerUebrig = 0
let gegnerBewegungMs = 0
let gegnerNaechsterAngriffMs = 0
let angriffAusloesungMs = 0
let angriffX = 0
let angriffY = 0
let rettungskapselX = 80
let rettungskapselY = 43
let traktorFortschritt = 0
let andockFortschritt = 0
let flugMeldung = ""
let fadenkreuzBewegungUebertrag = 0
let laserKuehlUebertrag = 0
let rettungsDriftMs = 0
let rettungsDriftSchritt = 0
let gegnerAngriffFolge = 0
let gegnerSchild = 0
let hinweisText = ""
let hinweisTextBisMs = 0
let schadenBlitzBisMs = 0
let rettungNachKampf = false
let gegnerMusterSchritt = 0
let flugRangVorher = 0

// Ereignisse im Flug. Ihre Nummern gelten nur in dieser Datei. Der Spielstand speichert nur, was ein Ereignis verändert
// hat, nie eine halbfertige Begegnung.
const FLUG_EREIGNIS_KEINE = 0
const FLUG_EREIGNIS_HANDELSSCHIFF = 1
const FLUG_EREIGNIS_NOTRUF = 2
const FLUG_EREIGNIS_ZOLL = 3
const FLUG_EREIGNIS_MINEN = 4
const FLUG_EREIGNIS_WRACK = 5
const FLUG_EREIGNIS_SCHMUGGLER = 6

let reiseEreignisGeprueft = false
let flugEreignisArt = FLUG_EREIGNIS_KEINE
let flugEreignisGeloest = false
let flugEreignisGeloestMs = 0
let flugEreignisErgebnis = ""
let ereignisErzwingtKampf = false
let waffenEnergieUebertrag = 0
let schildEnergieUebertrag = 0
let formationArt = 0
let formationBegleiter = 0
let bossPhase = 0
let bossMaxRumpf = 0
let bossRumpfGemerkt = 0
let bossSchildGemerkt = 0
let bossVerstaerkung = 0
let bossWartet = false
let bossSchwachpunktX = 80
let bossSchwachpunktY = 42
let flugHinweisBisMs = 0

function starteReise(): void {
    let kosten = sprungKosten(aktuelleWelt, zielWelt)
    if (zielWelt == aktuelleWelt || kosten > maxSprungKosten() || kosten > treibstoff) {
        klangFehler()
        zeigeMeldung(Texte.t(508), Texte.t(509), "", Szene.Hangar)
        return
    }
    if (missionsHerkunft == 2 && tutorialStufe == 2) {
        if (zielWelt != 1) {
            klangFehler()
            zeigeMeldung(Texte.t(510), Texte.t(511), Texte.t(512), Szene.Sternkarte)
            return
        }
        tutorialStufe = 3
    }
    flugStart = aktuelleWelt
    flugZiel = zielWelt
    flugStartwert = festerZufall(aktuelleWelt, zielWelt, spieltag + spielstandFolge)
    treibstoff -= kosten
    inFlug = 1
    schreibeSpielstand()
    richteFlugEin()
    setzeSzene(Szene.Flug)
}

function setzeReiseFort(): void {
    richteFlugEin()
    setzeSzene(Szene.Flug)
}

function richteFlugEin(): void {
    flugPhase = FlugPhase.Start
    phaseBegonnen = game.runtime()
    flugLetzteAktualisierung = phaseBegonnen
    flugSchild = maxSchild()
    fadenkreuzX = 80
    fadenkreuzY = 52
    waffeBereitMs = phaseBegonnen
    waffenBlitzBisMs = 0
    laserHitze = 0
    fluchtBeginnMs = 0
    gegnerAktiv = false
    gegnerUebrig = 0
    angriffAusloesungMs = 0
    traktorFortschritt = 0
    andockFortschritt = 0
    flugMeldung = Texte.t(254)
    fadenkreuzBewegungUebertrag = 0
    laserKuehlUebertrag = 0
    rettungsDriftMs = phaseBegonnen + 96
    rettungsDriftSchritt = 0
    gegnerAngriffFolge = 0
    gegnerSchild = 0
    hinweisText = ""
    hinweisTextBisMs = 0
    schadenBlitzBisMs = 0
    rettungNachKampf = false
    gegnerMusterSchritt = 0
    flugRangVorher = aktuellerRang()
    reiseEreignisGeprueft = false
    flugEreignisArt = FLUG_EREIGNIS_KEINE
    flugEreignisGeloest = false
    flugEreignisGeloestMs = 0
    flugEreignisErgebnis = ""
    ereignisErzwingtKampf = false
    waffenEnergieUebertrag = 0
    schildEnergieUebertrag = 0
    formationArt = 0
    formationBegleiter = 0
    bossPhase = 0
    bossMaxRumpf = 0
    bossRumpfGemerkt = 0
    bossSchildGemerkt = 0
    bossVerstaerkung = 0
    bossWartet = false
    flugHinweisBisMs = 0
    klangStart()
}

function beginneReiseflug(): void {
    flugPhase = FlugPhase.Reiseflug
    phaseBegonnen = game.runtime()
    flugMeldung = Texte.t(513) + WELT_NAMEN[flugZiel]
    klangReiseflug()
}

function waehleBegegnung(): void {
    if (!reiseEreignisGeprueft) {
        reiseEreignisGeprueft = true
        if (sollFlugEreignisStarten()) {
            beginneFlugEreignis()
            return
        }
    }
    // Der erste Trainingsflug LUMA -> VEXO bringt die Navigation bei, ohne dass ein Kampf überrascht.
    if (missionsHerkunft == 2 && missionsZiel == flugZiel) {
        beginneAnflug(true)
        return
    }
    if (missionsArt == MissionsArt.Rettung && missionsZiel == flugZiel && missionsFortschritt == 0) {
        if (missionsVariante == MissionsVariante.UnterFeuer) {
            gegnerUebrig = 1 + (spielModus > 0 ? 1 : 0)
            rettungNachKampf = true
            beginneKampfBegegnung(false)
        } else beginneRettungBegegnung()
        return
    }
    if (missionsArt == MissionsArt.Jagd && missionsZiel == flugZiel &&
        missionsFortschritt < missionsMenge) {
        gegnerUebrig = missionsMenge - missionsFortschritt
        beginneKampfBegegnung(true)
        return
    }
    let routeGefahr = wirksameWeltGefahr(flugZiel)
    let chance = 12 + routeGefahr * 16 + spielModus * 10
    if (missionsArt == MissionsArt.Lieferung && missionsVariante == MissionsVariante.Illegal) chance += 25
    if (marktEreignisArt == MarktEreignisArt.Blockade && marktEreignisWelt == flugZiel &&
        spieltag <= marktEreignisEnde) chance += 25
    chance = Math.min(92, chance)
    if (flugStartwert % 100 < chance) {
        gegnerUebrig = 1 + festerZufall(flugStartwert, spieltag, 4) % Math.max(1, routeGefahr + 1)
        beginneKampfBegegnung(false)
    } else beginneAnflug(true)
}

function sollFlugEreignisStarten(): boolean {
    if (missionsHerkunft == 2 || tutorialStufe > 0 && tutorialStufe < 4) return false
    let chance = 38 + wirksameWeltGefahr(flugZiel) * 5
    if (modulSchaden[Schiffsmodul.Scanner] >= 2) chance += 8
    if (flugZiel >= ANZAHL_OEFFENTLICHER_WELTEN) chance = 100
    return festerZufall(flugStartwert, spieltag, 211) % 100 < chance
}

function beginneFlugEreignis(): void {
    flugPhase = FlugPhase.Ereignis
    phaseBegonnen = game.runtime()
    flugEreignisGeloest = false
    flugEreignisErgebnis = ""
    ereignisErzwingtKampf = false
    flugEreignisArt = 1 + festerZufall(flugStartwert, spieltag, galaxieStartwert + 223) % 6
    flugMeldung = flugEreignisTitel()
    if (flugEreignisArt == FLUG_EREIGNIS_NOTRUF || flugEreignisArt == FLUG_EREIGNIS_MINEN) klangAlarm()
    else if (flugEreignisArt == FLUG_EREIGNIS_WRACK) klangRettungSignal()
    else klangBegegnung()
}

function flugEreignisFraktion(): Fraktion {
    if (flugEreignisArt == FLUG_EREIGNIS_SCHMUGGLER) return Fraktion.Korsaren
    return weltFraktion(flugZiel)
}

function flugEreignisTitel(): string {
    if (flugEreignisArt == FLUG_EREIGNIS_HANDELSSCHIFF) return Texte.t(514)
    if (flugEreignisArt == FLUG_EREIGNIS_NOTRUF) return Texte.t(515)
    if (flugEreignisArt == FLUG_EREIGNIS_ZOLL) return Texte.t(516)
    if (flugEreignisArt == FLUG_EREIGNIS_MINEN) return Texte.t(517)
    if (flugEreignisArt == FLUG_EREIGNIS_WRACK) return Texte.t(518)
    if (flugEreignisArt == FLUG_EREIGNIS_SCHMUGGLER) return Texte.t(519)
    return Texte.t(520)
}

function flugEreignisInfo(): string {
    if (flugEreignisArt == FLUG_EREIGNIS_HANDELSSCHIFF) return Texte.t(521)
    if (flugEreignisArt == FLUG_EREIGNIS_NOTRUF) return Texte.t(522)
    if (flugEreignisArt == FLUG_EREIGNIS_ZOLL) return Texte.t(523)
    if (flugEreignisArt == FLUG_EREIGNIS_MINEN) return Texte.t(524)
    if (flugEreignisArt == FLUG_EREIGNIS_WRACK) return Texte.t(525)
    return Texte.t(526)
}

function flugEreignisAnnehmenBeschriftung(): string {
    if (flugEreignisArt == FLUG_EREIGNIS_HANDELSSCHIFF) return Texte.t(527)
    if (flugEreignisArt == FLUG_EREIGNIS_NOTRUF) return Texte.t(528)
    if (flugEreignisArt == FLUG_EREIGNIS_ZOLL) return Texte.t(529)
    if (flugEreignisArt == FLUG_EREIGNIS_MINEN) return Texte.t(530)
    if (flugEreignisArt == FLUG_EREIGNIS_WRACK) return Texte.t(531)
    return Texte.t(532)
}

function flugEreignisAblehnungBeschriftung(): string {
    if (flugEreignisArt == FLUG_EREIGNIS_ZOLL) return Texte.t(533)
    if (flugEreignisArt == FLUG_EREIGNIS_MINEN) return Texte.t(534)
    return Texte.t(535)
}

function beendeFlugEreignis(ergebnis: string): void {
    flugEreignisErgebnis = ergebnis
    flugEreignisGeloest = true
    flugEreignisGeloestMs = game.runtime()
    erfasseEreignis()
    aktualisiereErfolge()
}

function entscheideFlugEreignis(annehmen: boolean): void {
    if (flugPhase != FlugPhase.Ereignis || flugEreignisGeloest) return
    let zahl = festerZufall(flugStartwert, flugEreignisArt, spieltag + 239) % 100
    if (flugEreignisArt == FLUG_EREIGNIS_HANDELSSCHIFF) {
        if (annehmen && credits >= 45) {
            credits -= 45
            treibstoff = Math.min(maxTreibstoff(), treibstoff + 2)
            rumpf = Math.min(maxRumpf(), rumpf + 2)
            aendereRuf(Fraktion.Gilde, 1)
            klangKauf()
            beendeFlugEreignis(Texte.t(536))
        } else beendeFlugEreignis(annehmen ? Texte.t(440) : Texte.t(537))
    } else if (flugEreignisArt == FLUG_EREIGNIS_NOTRUF) {
        if (annehmen) {
            let lohn = 55 + wirksameWeltGefahr(flugZiel) * 15
            credits += lohn
            erfasseRettung()
            aendereRuf(Fraktion.Bund, 3)
            if (zahl < 18 && fuegeArtefaktHinzu(festerZufall(flugStartwert, spieltag, 241) % ANZAHL_ARTEFAKTE))
                beendeFlugEreignis(Texte.t(538))
            else beendeFlugEreignis(Texte.t(539) + lohn + Texte.t(319))
            klangRettungFertig()
        } else {
            aendereRuf(Fraktion.Bund, -2)
            beendeFlugEreignis(Texte.t(540))
        }
    } else if (flugEreignisArt == FLUG_EREIGNIS_ZOLL) {
        if (annehmen) {
            if (missionsArt == MissionsArt.Lieferung && missionsVariante == MissionsVariante.Illegal) {
                let strafe = Math.min(credits, 80 + wirksameWeltGefahr(flugZiel) * 25)
                credits -= strafe
                missionsFortschritt = Math.max(1, missionsFortschritt)
                aendereRuf(Fraktion.Bund, -3)
                klangFehler()
                beendeFlugEreignis(Texte.t(541) + strafe + Texte.t(319))
            } else {
                aendereRuf(Fraktion.Bund, 1)
                klangBestaetigung()
                beendeFlugEreignis(Texte.t(542))
            }
        } else {
            aendereRuf(Fraktion.Bund, -5)
            aendereRuf(Fraktion.Korsaren, 2)
            ereignisErzwingtKampf = true
            klangAlarm()
            beendeFlugEreignis(Texte.t(543))
        }
    } else if (flugEreignisArt == FLUG_EREIGNIS_MINEN) {
        if (!annehmen && benutzeMine()) {
            klangExplosion()
            beendeFlugEreignis(Texte.t(544))
        } else {
            let sicher = zahl < 58 + ausbauten[AUSBAU_SCANNER] * 12 -
                modulSchaden[Schiffsmodul.Scanner] * 14
            if (!sicher) {
                klangAlarm()
                beschaedigeSpieler(1 + Math.idiv(wirksameWeltGefahr(flugZiel), 2))
                if (aktiveSzene != Szene.Flug) return
                beschaedigeModul(Schiffsmodul.Antrieb, 1)
                beendeFlugEreignis(Texte.t(545))
            } else beendeFlugEreignis(annehmen ? Texte.t(546) : Texte.t(547))
        }
    } else if (flugEreignisArt == FLUG_EREIGNIS_WRACK) {
        if (annehmen) {
            let artefakt = festerZufall(flugStartwert, galaxieStartwert, spieltag + 251) % ANZAHL_ARTEFAKTE
            if (zahl < 34 && fuegeArtefaktHinzu(artefakt)) {
                aendereRuf(Fraktion.Forscher, 3)
                klangMission()
                beendeFlugEreignis(Texte.t(548))
            } else if (fuegeRaritaetHinzu(festerZufall(flugStartwert, zahl, 257) % ANZAHL_RARITAETEN, 1)) {
                beendeFlugEreignis(Texte.t(549))
            } else {
                credits += 35
                beendeFlugEreignis(Texte.t(550))
            }
        } else beendeFlugEreignis(Texte.t(551))
    } else if (flugEreignisArt == FLUG_EREIGNIS_SCHMUGGLER) {
        if (annehmen && credits >= 90 &&
            fuegeRaritaetHinzu(festerZufall(flugStartwert, spieltag, 263) % ANZAHL_RARITAETEN, 1)) {
            credits -= 90
            aendereRuf(Fraktion.Korsaren, 4)
            aendereRuf(Fraktion.Gilde, -1)
            klangKauf()
            beendeFlugEreignis(Texte.t(552))
        } else {
            if (!annehmen) aendereRuf(Fraktion.Bund, 1)
            beendeFlugEreignis(annehmen ? Texte.t(553) : Texte.t(554))
        }
    }
}

function verlasseFlugEreignis(): void {
    flugEreignisArt = FLUG_EREIGNIS_KEINE
    if (ereignisErzwingtKampf) {
        gegnerUebrig = 1 + spielModus
        beginneKampfBegegnung(false)
    } else waehleBegegnung()
}

function beginneKampfBegegnung(jagd: boolean): void {
    flugPhase = FlugPhase.Begegnung
    phaseBegonnen = game.runtime()
    flugMeldung = jagd ? Texte.t(555) : (rettungNachKampf ? Texte.t(556) : Texte.t(557))
    klangBegegnung()
    bringeGegner(jagd)
}

function bringeGegner(jagd: boolean): void {
    let jetzt = game.runtime()
    gegnerAktiv = true
    if (jagd && missionsHerkunft == 1 && kampagnenStufe >= 5 && gegnerUebrig == 1) gegnerArt = 4
    else if (jagd && missionsVariante == MissionsVariante.Ass) gegnerArt = 3
    else if (jagd && missionsVariante == MissionsVariante.UnterFeuer) gegnerArt = 2
    else if (jagd) gegnerArt = festerZufall(missionsStartwert, gegnerUebrig, siegeGesamt + 19) % 3
    else if (marktEreignisArt == MarktEreignisArt.Blockade && marktEreignisWelt == flugZiel &&
        spieltag <= marktEreignisEnde) gegnerArt = 4
    else gegnerArt = festerZufall(flugStartwert, gegnerUebrig, siegeGesamt) % 3
    gegnerX = 35 + festerZufall(flugStartwert, gegnerUebrig, 8) % 90
    gegnerY = 24 + festerZufall(flugStartwert, gegnerUebrig, 9) % 35
    gegnerVx = festerZufall(flugStartwert, gegnerUebrig, 10) % 2 == 0 ? -1 : 1
    gegnerVy = festerZufall(flugStartwert, gegnerUebrig, 11) % 2 == 0 ? -1 : 1
    let gefahr = wirksameWeltGefahr(flugZiel)
    gegnerGroesse = 8 + gefahr * 2 + Math.min(4, gegnerArt)
    gegnerRumpf = 2 + gefahr + gegnerArt + (jagd ? 2 : 0) + spielModus
    if (gegnerArt == 4) gegnerRumpf += 5 + spielModus * 2
    gegnerSchild = gegnerArt == 2 ? 2 + gefahr
        : (gegnerArt == 3 ? 3 + gefahr : (gegnerArt == 4 ? 5 + gefahr : 0))
    formationArt = gegnerArt >= 3 ? 0 : festerZufall(flugStartwert, gegnerUebrig, 301) % 3
    formationBegleiter = formationArt == 1 ? 2 : (formationArt == 2 ? 1 : 0)
    if (gegnerArt == 4) {
        bossPhase = 1
        bossMaxRumpf = gegnerRumpf
        bossWartet = false
        bossVerstaerkung = 0
    }
    gegnerMusterSchritt = 0
    gegnerBewegungMs = jetzt + gegnerBewegungVerzoegerung()
    gegnerNaechsterAngriffMs = jetzt + 1000 + festerZufall(flugStartwert, gegnerUebrig, 12) % 600
    angriffAusloesungMs = 0
    flugMeldung = gegnerArtName(gegnerArt)
}

function aktualisiereBossSchwachpunkt(): void {
    if (bossPhase == 1) {
        bossSchwachpunktX = gegnerX - Math.idiv(gegnerGroesse, 2)
        bossSchwachpunktY = gegnerY
    } else if (bossPhase == 2) {
        bossSchwachpunktX = gegnerX + Math.idiv(gegnerGroesse, 2)
        bossSchwachpunktY = gegnerY - 2
    } else {
        bossSchwachpunktX = gegnerX
        bossSchwachpunktY = gegnerY + Math.idiv(gegnerGroesse, 3)
    }
}

function bringeBossVerstaerkung(): void {
    let jetzt = game.runtime()
    gegnerAktiv = true
    gegnerArt = bossVerstaerkung % 2 == 0 ? 2 : 0
    gegnerGroesse = gegnerArt == 2 ? 10 : 8
    gegnerRumpf = 3 + wirksameWeltGefahr(flugZiel) + spielModus
    gegnerSchild = gegnerArt == 2 ? 2 : 0
    gegnerX = bossVerstaerkung % 2 == 0 ? 38 : 122
    gegnerY = 30 + bossVerstaerkung * 7
    gegnerVx = gegnerX < 80 ? 1 : -1
    gegnerVy = 1
    gegnerMusterSchritt = 0
    gegnerBewegungMs = jetzt + gegnerBewegungVerzoegerung()
    gegnerNaechsterAngriffMs = jetzt + 850
    angriffAusloesungMs = 0
    formationArt = 1
    formationBegleiter = 0
    flugMeldung = Texte.t(558)
    klangAlarm()
}

function starteBossVerstaerkung(menge: number): void {
    bossRumpfGemerkt = gegnerRumpf
    bossSchildGemerkt = gegnerSchild
    bossVerstaerkung = menge
    bossWartet = true
    bringeBossVerstaerkung()
}

function stelleBossNachVerstaerkungHer(): void {
    let jetzt = game.runtime()
    bossWartet = false
    gegnerAktiv = true
    gegnerArt = 4
    gegnerGroesse = 14 + wirksameWeltGefahr(flugZiel)
    gegnerRumpf = bossRumpfGemerkt
    gegnerSchild = bossSchildGemerkt + bossPhase
    gegnerX = 80
    gegnerY = 40
    gegnerVx = bossPhase >= 3 ? 2 : 1
    gegnerVy = 1
    gegnerMusterSchritt = 0
    gegnerBewegungMs = jetzt + gegnerBewegungVerzoegerung()
    gegnerNaechsterAngriffMs = jetzt + 900
    angriffAusloesungMs = 0
    formationArt = 0
    formationBegleiter = 0
    flugMeldung = Texte.t(559) + bossPhase
    klangBegegnung()
}

function pruefeBossPhase(): void {
    if (gegnerArt != 4 || bossWartet || gegnerRumpf <= 0) return
    if (bossPhase == 1 && gegnerRumpf * 3 <= bossMaxRumpf * 2) {
        bossPhase = 2
        starteBossVerstaerkung(2 + spielModus)
    } else if (bossPhase == 2 && gegnerRumpf * 3 <= bossMaxRumpf) {
        bossPhase = 3
        starteBossVerstaerkung(1 + spielModus)
    }
}

function gegnerArtName(art: number): string {
    if (art == 0) return Texte.t(560)
    if (art == 1) return Texte.t(561)
    if (art == 2) return Texte.t(562)
    if (art == 3) return Texte.t(563)
    return Texte.t(564)
}

function gegnerBewegungVerzoegerung(): number {
    if (gegnerArt == 0) return 34
    if (gegnerArt == 1) return 42
    if (gegnerArt == 2) return 72
    if (gegnerArt == 3) return 30
    return 82
}

function beginneRettungBegegnung(): void {
    flugPhase = FlugPhase.Begegnung
    phaseBegonnen = game.runtime()
    flugMeldung = Texte.t(500)
    gegnerAktiv = false
    rettungskapselX = 42 + festerZufall(flugStartwert, missionsStartwert, 2) % 77
    rettungskapselY = 27 + festerZufall(flugStartwert, missionsStartwert, 3) % 35
    traktorFortschritt = 0
    klangRettungSignal()
}

function beginneAnflug(spieleEinsatz: boolean): void {
    flugPhase = FlugPhase.Anflug
    phaseBegonnen = game.runtime()
    gegnerAktiv = false
    angriffAusloesungMs = 0
    fluchtBeginnMs = 0
    andockFortschritt = 0
    flugMeldung = Texte.t(565)
    if (spieleEinsatz) klangAnflug()
}

function aktualisiereFadenkreuz(dt: number): void {
    let bewegt = controller.left.isPressed() || controller.right.isPressed() || controller.up.isPressed() ||
        controller.down.isPressed()
    if (!bewegt) {
        fadenkreuzBewegungUebertrag = 0
        return
    }
    let tempoJeSekunde = controller.B.isPressed() ? 94 : 63
    if (energieModus == 3) tempoJeSekunde += 24
    tempoJeSekunde = Math.max(28, tempoJeSekunde - modulSchaden[Schiffsmodul.Antrieb] * 11)
    fadenkreuzBewegungUebertrag += dt * tempoJeSekunde
    let schritt = Math.idiv(fadenkreuzBewegungUebertrag, 1000)
    fadenkreuzBewegungUebertrag %= 1000
    if (schritt <= 0) return
    if (controller.left.isPressed()) fadenkreuzX -= schritt
    if (controller.right.isPressed()) fadenkreuzX += schritt
    if (controller.up.isPressed()) fadenkreuzY -= schritt
    if (controller.down.isPressed()) fadenkreuzY += schritt
    fadenkreuzX = Math.clamp(12, 148, fadenkreuzX)
    fadenkreuzY = Math.clamp(17, 82, fadenkreuzY)
}

function aktualisiereFlugEnergie(dt: number): void {
    let energieRate = energieModus == 2 ? 15 : (energieModus == 1 ? 6 : 9)
    energieRate = Math.max(2, energieRate - modulSchaden[Schiffsmodul.Waffen] * 2)
    waffenEnergieUebertrag += dt * energieRate
    while (waffenEnergieUebertrag >= 1000) {
        stelleWaffenEnergieHer(1)
        waffenEnergieUebertrag -= 1000
    }
    if (flugPhase == FlugPhase.Begegnung && flugSchild < maxSchild()) {
        let schildRate = energieModus == 1 ? 3 : 1
        schildEnergieUebertrag += dt * schildRate
        let schildSchritt = energieModus == 1 ? 1800 : 3600
        if (schildEnergieUebertrag >= schildSchritt) {
            flugSchild++
            schildEnergieUebertrag = 0
        }
    } else schildEnergieUebertrag = 0
}

function aktualisiereFlug(): void {
    if (aktiveSzene != Szene.Flug) return
    let jetzt = game.runtime()
    if (jetzt - flugLetzteAktualisierung < 32) return
    let dt = Math.min(80, jetzt - flugLetzteAktualisierung)
    flugLetzteAktualisierung = jetzt
    aktualisiereFadenkreuz(dt)
    aktualisiereFlugEnergie(dt)
    if (laserHitze > 0) {
        laserKuehlUebertrag += dt
        let kuehlSchritt = energieModus == 2 ? 85 : 120
        while (laserKuehlUebertrag >= kuehlSchritt && laserHitze > 0) {
            laserHitze--
            laserKuehlUebertrag -= kuehlSchritt
        }
    } else laserKuehlUebertrag = 0
    if (flugPhase == FlugPhase.Start) {
        if (jetzt - phaseBegonnen > 1700) beginneReiseflug()
    } else if (flugPhase == FlugPhase.Reiseflug) {
        if (jetzt - phaseBegonnen > 2500) waehleBegegnung()
    } else if (flugPhase == FlugPhase.Ereignis) {
        if (flugEreignisGeloest && jetzt - flugEreignisGeloestMs > 1150) verlasseFlugEreignis()
    } else if (flugPhase == FlugPhase.Begegnung) {
        if (missionsArt == MissionsArt.Rettung && missionsZiel == flugZiel && missionsFortschritt == 0 &&
            !gegnerAktiv && !rettungNachKampf) aktualisiereTraktor(jetzt, dt)
        else aktualisiereKampf(jetzt)
        if (aktiveSzene != Szene.Flug) return
        aktualisiereFlucht(jetzt)
    } else if (flugPhase == FlugPhase.Anflug) {
        aktualisiereAndocken(jetzt, dt)
    }
}

function aktualisiereKampf(jetzt: number): void {
    if (!gegnerAktiv) return
    let bewegungSchritte = 0
    while (jetzt >= gegnerBewegungMs && bewegungSchritte < 4) {
        let tempo = gegnerArt == 0 || gegnerArt == 3 ? 2 : 1
        if (gegnerArt == 4 && bossPhase >= 3) tempo = 2
        gegnerX += gegnerVx * tempo
        gegnerY += gegnerVy
        gegnerMusterSchritt++
        if (gegnerArt == 1 && gegnerMusterSchritt % 9 == 0) gegnerVy = 0 - gegnerVy
        if (gegnerArt == 3 && gegnerMusterSchritt % 13 == 0) gegnerVx = 0 - gegnerVx
        if (gegnerX < 24 || gegnerX > 136) gegnerVx = 0 - gegnerVx
        if (gegnerY < 20 || gegnerY > 70) gegnerVy = 0 - gegnerVy
        gegnerBewegungMs += gegnerBewegungVerzoegerung()
        bewegungSchritte++
    }
    if (gegnerArt == 4) aktualisiereBossSchwachpunkt()
    if (bewegungSchritte >= 4 && jetzt >= gegnerBewegungMs)
        gegnerBewegungMs = jetzt + gegnerBewegungVerzoegerung()
    if (angriffAusloesungMs == 0 && jetzt >= gegnerNaechsterAngriffMs) {
        angriffX = fadenkreuzX
        angriffY = fadenkreuzY
        angriffAusloesungMs = jetzt + (gegnerArt == 3 ? 470 : (gegnerArt == 2 || gegnerArt == 4 ? 760 : 620))
        gegnerAngriffFolge++
        klangGegnerErfasst()
    } else if (angriffAusloesungMs > 0 && jetzt >= angriffAusloesungMs) {
        if (Math.abs(fadenkreuzX - angriffX) < 13 && Math.abs(fadenkreuzY - angriffY) < 13) {
            let schaden = 1 + (gegnerArt >= 2 ? 1 : 0) + (gegnerArt == 4 ? 1 : 0) + (spielModus == 2 ? 1 : 0)
            if (formationBegleiter > 0) schaden++
            beschaedigeSpieler(schaden)
            if (aktiveSzene != Szene.Flug) return
        }
        angriffAusloesungMs = 0
        gegnerNaechsterAngriffMs = jetzt + 820 +
            festerZufall(flugStartwert, gegnerAngriffFolge, gegnerUebrig + 31) % 720
    }
}

function aktualisiereTraktor(jetzt: number, dt: number): void {
    let driftSchritte = 0
    while (jetzt >= rettungsDriftMs && driftSchritte < 3) {
        rettungskapselX += festerZufall(flugStartwert, rettungsDriftSchritt, 5) % 3 - 1
        rettungskapselY += festerZufall(flugStartwert, rettungsDriftSchritt, 6) % 3 - 1
        rettungsDriftSchritt++
        rettungsDriftMs += 96
        driftSchritte++
    }
    if (driftSchritte >= 3 && jetzt >= rettungsDriftMs) rettungsDriftMs = jetzt + 96
    rettungskapselX = Math.clamp(24, 136, rettungskapselX)
    rettungskapselY = Math.clamp(22, 70, rettungskapselY)
    let inReichweite = Math.abs(fadenkreuzX - rettungskapselX) <= 11 && Math.abs(fadenkreuzY - rettungskapselY) <= 11
    if (controller.A.isPressed() && inReichweite) traktorFortschritt += dt
    else traktorFortschritt = Math.max(0, traktorFortschritt - dt * 2)
    if (traktorFortschritt >= 900) {
        missionsFortschritt = 1
        klangRettungFertig()
        beginneAnflug(false)
    }
}

function aktualisiereFlucht(jetzt: number): void {
    if (flugPhase != FlugPhase.Begegnung) return
    if (controller.B.isPressed() && treibstoff > 0) {
        if (fluchtBeginnMs == 0) fluchtBeginnMs = jetzt
        if (jetzt - fluchtBeginnMs >= fluchtLadezeit()) {
            treibstoff--
            flugMeldung = Texte.t(566)
            klangFlucht()
            beginneAnflug(false)
        }
    } else fluchtBeginnMs = 0
}

function aktualisiereAndocken(jetzt: number, dt: number): void {
    let torX = 80 + Math.round(Math.sin((jetzt - phaseBegonnen) / 700) * 12)
    let torY = 46
    if (Math.abs(fadenkreuzX - torX) < 9 && Math.abs(fadenkreuzY - torY) < 9) andockFortschritt += dt
    else andockFortschritt = Math.max(0, andockFortschritt - dt * 2)
    if (andockFortschritt >= 900 && jetzt - phaseBegonnen > 1200) beendeAndocken()
}

function loeseWaffeAus(): void {
    if (aktiveSzene != Szene.Flug || eingabeGesperrt) return
    let jetzt = game.runtime()
    if (flugPhase == FlugPhase.Ereignis) {
        entscheideFlugEreignis(true)
        return
    }
    if (flugPhase != FlugPhase.Begegnung) return
    if (missionsArt == MissionsArt.Rettung && missionsZiel == flugZiel && missionsFortschritt == 0 &&
        !gegnerAktiv) return
    if (jetzt < waffeBereitMs || !gegnerAktiv || modulSchaden[Schiffsmodul.Waffen] >= 3) {
        if (modulSchaden[Schiffsmodul.Waffen] >= 3) zeigeFlugHinweis(Texte.t(567))
        return
    }
    // Ist das Raketen- oder Minenfach leer, schaltet die Waffe auf den Laser zurück, damit A immer etwas auslöst.
    if (aktiveWaffe == WaffenArt.Rakete && raketen <= 0 ||
        aktiveWaffe == WaffenArt.Mine && minen <= 0) {
        aktiveWaffe = WaffenArt.Laser
        zeigeFlugHinweis(Texte.t(580) + waffenName(aktiveWaffe))
    }
    if (aktiveWaffe == WaffenArt.Rakete) loeseRaketeAus(jetzt)
    else if (aktiveWaffe == WaffenArt.Mine) loeseMineAus(jetzt)
    else loeseLaserAus(jetzt)
}

function zeigeFlugHinweis(meldung: string): void {
    hinweisText = meldung
    hinweisTextBisMs = game.runtime() + 900
    flugHinweisBisMs = hinweisTextBisMs
}

function loeseLaserAus(jetzt: number): void {
    if (laserHitze >= 10 || waffenEnergie < 7) {
        klangFehler()
        zeigeFlugHinweis(laserHitze >= 10 ? Texte.t(568) : Texte.t(569))
        return
    }
    waffeBereitMs = jetzt + laserAbkuehlzeit()
    waffenBlitzBisMs = jetzt + 90
    laserHitze = Math.min(10, laserHitze + 3)
    waffenEnergie -= 7
    waffenTreffer = Math.abs(fadenkreuzX - gegnerX) <= gegnerGroesse && Math.abs(fadenkreuzY - gegnerY) <= gegnerGroesse
    klangLaser(waffenTreffer)
    if (waffenTreffer) {
        wendeGegnerSchadenAn(laserSchaden(), false)
    }
}

function loeseRaketeAus(jetzt: number): void {
    if (!benutzeRakete()) {
        klangFehler()
        zeigeFlugHinweis(raketen <= 0 ? Texte.t(570) : Texte.t(571))
        return
    }
    waffeBereitMs = jetzt + 720
    waffenBlitzBisMs = jetzt + 180
    waffenTreffer = Math.abs(fadenkreuzX - gegnerX) <= gegnerGroesse + 18 &&
        Math.abs(fadenkreuzY - gegnerY) <= gegnerGroesse + 18
    klangLaser(waffenTreffer)
    if (waffenTreffer) wendeGegnerSchadenAn(5 + ausbauten[AUSBAU_LASER], true)
}

function loeseMineAus(jetzt: number): void {
    if (!benutzeMine()) {
        klangFehler()
        zeigeFlugHinweis(minen <= 0 ? Texte.t(572) : Texte.t(573))
        return
    }
    waffeBereitMs = jetzt + 900
    waffenBlitzBisMs = jetzt + 220
    waffenTreffer = true
    angriffAusloesungMs = 0
    gegnerNaechsterAngriffMs = jetzt + 1500
    klangExplosion()
    if (formationBegleiter > 0) {
        siegeGesamt += formationBegleiter
        formationBegleiter = 0
        zeigeFlugHinweis(Texte.t(574))
    }
    wendeGegnerSchadenAn(3 + ausbauten[AUSBAU_LASER], false)
}

function wendeGegnerSchadenAn(menge: number, praezisionsWaffe: boolean): void {
    let jetzt = game.runtime()
    if (formationBegleiter > 0) {
        formationBegleiter--
        siegeGesamt++
        credits += 12
        klangExplosion()
        zeigeFlugHinweis(Texte.t(575))
        aktualisiereErfolge()
        return
    }
    if (gegnerArt == 4) {
        aktualisiereBossSchwachpunkt()
        let schwachpunktTreffer = praezisionsWaffe ||
            Math.abs(fadenkreuzX - bossSchwachpunktX) <= 8 && Math.abs(fadenkreuzY - bossSchwachpunktY) <= 8
        if (!schwachpunktTreffer) {
            menge = Math.max(1, Math.idiv(menge, 3))
            zeigeFlugHinweis(Texte.t(576))
        } else zeigeFlugHinweis(Texte.t(577))
    }
    if (gegnerSchild > 0) {
        let abgefangen = Math.min(gegnerSchild, menge)
        gegnerSchild -= abgefangen
        menge -= abgefangen
        hinweisText = Texte.t(578) + abgefangen
        hinweisTextBisMs = jetzt + 650
    }
    gegnerRumpf -= menge
    if (gegnerRumpf <= 0) besiegeGegner()
    else pruefeBossPhase()
}

function bearbeiteBImFlug(): void {
    if (aktiveSzene != Szene.Flug || eingabeGesperrt) return
    if (flugPhase == FlugPhase.Ereignis) {
        entscheideFlugEreignis(false)
        return
    }
    if (controller.left.isPressed()) {
        wechsleEnergieModus(-1)
        klangNavigation()
        zeigeFlugHinweis(Texte.t(579) + energieModusName())
    } else if (controller.right.isPressed()) {
        wechsleEnergieModus(1)
        klangNavigation()
        zeigeFlugHinweis(Texte.t(579) + energieModusName())
    } else {
        wechsleWaffe(1)
        klangNavigation()
        zeigeFlugHinweis(Texte.t(580) + waffenName(aktiveWaffe))
    }
}

function besiegeGegner(): void {
    gegnerAktiv = false
    angriffAusloesungMs = 0
    siegeGesamt++
    let kopfgeld = 18 + wirksameWeltGefahr(flugZiel) * 12 + gegnerArt * 7
    if (spielModus > 0) kopfgeld += Math.idiv(kopfgeld * spielModus, 4)
    credits += kopfgeld
    if (bossWartet) {
        bossVerstaerkung--
        klangExplosion()
        aktualisiereErfolge()
        if (bossVerstaerkung > 0) bringeBossVerstaerkung()
        else stelleBossNachVerstaerkungHer()
        return
    }
    gegnerUebrig--
    if (missionsArt == MissionsArt.Jagd && missionsZiel == flugZiel) missionsFortschritt++
    if (gegnerArt == 4) {
        bossSiege++
        aendereRuf(Fraktion.Bund, 5)
        fuegeArtefaktHinzu(festerZufall(flugStartwert, spieltag, bossSiege + 313) % ANZAHL_ARTEFAKTE)
    }
    gibBergung()
    klangExplosion()
    formationBegleiter = 0
    aktualisiereErfolge()
    if (gegnerUebrig > 0) bringeGegner(missionsArt == MissionsArt.Jagd && missionsZiel == flugZiel)
    else if (rettungNachKampf) {
        rettungNachKampf = false
        beginneRettungBegegnung()
    } else beginneAnflug(false)
}

function gibBergung(): void {
    let zahl = festerZufall(flugStartwert, siegeGesamt, gegnerArt + gegnerUebrig * 7) % 100
    let chance = 32 + (schiffsrolle == Schiffsrolle.Kaufmann ? 23 : 0) + ausbauten[AUSBAU_SCANNER] * 8
    if (gegnerArt >= 3 && zahl < 12 &&
        fuegeRaritaetHinzu(festerZufall(flugStartwert, siegeGesamt, 317) % ANZAHL_RARITAETEN, 1)) {
        hinweisText = Texte.t(581)
    } else if (frachtEinheiten() < frachtKapazitaet() && zahl < chance) {
        let ware = festerZufall(flugStartwert, siegeGesamt, gegnerArt + 73) % ANZAHL_WAREN
        fracht[ware]++
        hinweisText = Texte.t(582) + Texte.t(WARE_NAMEN[ware])
    } else {
        let schrott = 6 + gegnerArt * 3
        credits += schrott
        hinweisText = Texte.t(583) + schrott + Texte.t(319)
    }
    hinweisTextBisMs = game.runtime() + 1200
}

function beschaedigeSpieler(menge: number): boolean {
    let ausweichen = controller.B.isPressed() ? 50 : 0
    if (schiffsrolle == Schiffsrolle.Kurier) ausweichen += 15
    if (energieModus == 3) ausweichen += 18
    ausweichen -= modulSchaden[Schiffsmodul.Antrieb] * 12
    if (festerZufall(flugStartwert, gegnerAngriffFolge, fadenkreuzX) % 100 < ausweichen) {
        hinweisText = Texte.t(584)
        hinweisTextBisMs = game.runtime() + 700
        return false
    }
    schadenBlitzBisMs = game.runtime() + 180
    let rumpfVorher = rumpf
    let schildVorher = flugSchild
    if (energieModus == 1 && menge > 1) menge--
    while (menge > 0 && flugSchild > 0) {
        flugSchild--
        menge--
    }
    if (schildVorher > 0 && flugSchild <= 0) klangSchildBruch()
    rumpf -= menge
    if (rumpf < rumpfVorher && missionsArt == MissionsArt.Lieferung &&
        missionsVariante == MissionsVariante.Zerbrechlich)
        missionsFortschritt = 1
    let handelsFracht = 0
    for (let i = 0; i < ANZAHL_WAREN; i++) handelsFracht += fracht[i]
    if (rumpf < rumpfVorher && gegnerArt == 1 && handelsFracht > 0 &&
        festerZufall(flugStartwert, gegnerAngriffFolge, 91) % 3 == 0) {
        entferneFrachtEinheiten(1)
        hinweisText = Texte.t(585)
        hinweisTextBisMs = game.runtime() + 900
    }
    if (rumpf < rumpfVorher) {
        let modulZufall = festerZufall(flugStartwert, gegnerAngriffFolge, rumpf + 331) % 100
        if (modulZufall < 24 + wirksameWeltGefahr(flugZiel) * 5) {
            let modul = festerZufall(flugStartwert, gegnerAngriffFolge, 337) % ANZAHL_MODULE
            beschaedigeModul(modul, 1)
            hinweisText = kurzerModulName(modul) + Texte.t(586)
            hinweisTextBisMs = game.runtime() + 1000
            if (modul == Schiffsmodul.Fracht && frachtEinheiten() > 0) entferneFrachtEinheiten(1)
        }
    }
    klangSchaden()
    if (rumpf <= 0) fuehreVersicherteRettungAus()
    return true
}

function kurzerModulName(modul: number): string {
    if (modul == Schiffsmodul.Antrieb) return Texte.t(115)
    if (modul == Schiffsmodul.Scanner) return Texte.t(116)
    if (modul == Schiffsmodul.Waffen) return Texte.t(117)
    return Texte.t(587)
}

function versicherterFrachtVerlust(): number {
    let gesamt = 0
    for (let i = 0; i < ANZAHL_WAREN; i++) gesamt += fracht[i]
    if (gesamt <= 0) return 0
    let stufe = ausbauten[AUSBAU_VERSICHERUNG]
    if (stufe >= 2) return 1
    if (stufe == 1) return Math.idiv(gesamt + 5, 6)
    return Math.idiv(gesamt + 2, 3)
}

function entferneFrachtEinheiten(menge: number): void {
    let stelle = flugStartwert % ANZAHL_WAREN
    let entfernt = 0
    let versuche = 0
    while (entfernt < menge && versuche < ANZAHL_WAREN * 20) {
        let ware = stelle % ANZAHL_WAREN
        if (fracht[ware] > 0) {
            let alteEinheiten = fracht[ware]
            let kostenJeEinheit = Math.idiv(frachtKosten[ware], alteEinheiten)
            fracht[ware]--
            frachtKosten[ware] = Math.max(0, frachtKosten[ware] - kostenJeEinheit)
            if (fracht[ware] == 0) frachtKosten[ware] = 0
            entfernt++
        }
        stelle += 5
        versuche++
    }
}

function fuehreVersicherteRettungAus(): void {
    klangBesiegt()
    if (!ladeSpiel()) {
        neuesSpiel()
        zeigeMeldung(Texte.t(222), Texte.t(588), "", Szene.Hangar)
        return
    }
    let verloren = versicherterFrachtVerlust()
    entferneFrachtEinheiten(verloren)
    if (missionsArt != MissionsArt.Keine) gescheiterteMissionen++
    if (missionsHerkunft == 2) tutorialStufe = 1
    leereMission()
    aktuelleWelt = flugStart
    zielWelt = aktuelleWelt
    inFlug = 0
    rumpf = maxRumpf()
    treibstoff = Math.max(1, treibstoff)
    gibNotfallTreibstoff()
    schreibeSpielstand()
    zeigeMeldung(Texte.t(589), Texte.t(590) + verloren, Texte.t(591), Szene.Hangar)
}

function beendeAndocken(): void {
    let routeEndziel = routeSprungAnzahl() > 0 ? routenWeltAnStelle(routeSprungAnzahl()) : -1
    aktuelleWelt = flugZiel
    zielWelt = aktuelleWelt
    let routeGehtWeiter = false
    if (routeEndziel >= 0 && routeEndziel != aktuelleWelt && planeRouteNach(routeEndziel) &&
        routeSprungAnzahl() > 0) {
        zielWelt = routenWeltAnStelle(1)
        routeGehtWeiter = true
    } else leereGeplanteRoute()
    inFlug = 0
    spieltag++
    erfasseSprung()
    let gezahlterLohn = missionsLohn
    let ergebnis = entscheideMissionImDock()
    if (ausbauten[AUSBAU_REPARATUR] > 0) rumpf = Math.min(maxRumpf(), rumpf + 1)
    if (ausbauten[AUSBAU_REPARATUR] > 0) repariereModule()
    else {
        for (let modul = 0; modul < ANZAHL_MODULE; modul++) {
            if (modulSchaden[modul] > 0) modulSchaden[modul]--
        }
    }
    waffenEnergie = 100
    let notfallTreibstoff = gibNotfallTreibstoff()
    aktualisiereMarktEreignis()
    erneuereMarkt()
    merkeAktuellenMarkt()
    aktualisiereErfolge()
    schreibeSpielstand()
    if (ergebnis == 2) {
        klangMission()
        zeigeMeldung(Texte.t(592), "+" + gezahlterLohn + Texte.t(593), Texte.t(594), Szene.Hangar)
    } else if (ergebnis == 4) {
        klangMission()
        zeigeMeldung(Texte.t(595), Texte.t(596), Texte.t(317) + rangName(), Szene.Hangar)
    } else if (ergebnis == 3) {
        klangMission()
        zeigeMeldung(Texte.t(597), "+" + gezahlterLohn + Texte.t(593),
            Texte.t(389) + kampagnenStufe + "/6", Szene.Hangar)
    } else if (ergebnis == 1) {
        klangMission()
        let rangZeile = aktuellerRang() > flugRangVorher ? Texte.t(598) + rangName() : Texte.t(599)
        zeigeMeldung(Texte.t(600), "+" + gezahlterLohn + Texte.t(593), rangZeile, Szene.Hangar)
    } else if (ergebnis == -1) {
        klangFehler()
        zeigeMeldung(Texte.t(601), Texte.t(602), Texte.t(599), Szene.Hangar)
    } else if (ergebnis == -2) {
        klangFehler()
        zeigeMeldung(Texte.t(603), Texte.t(604), Texte.t(599), Szene.Hangar)
    } else {
        klangDock()
        let dockZeile = notfallTreibstoff ? Texte.t(605)
            : (routeGehtWeiter ? Texte.t(606) + WELT_NAMEN[routeEndziel] : Texte.t(607))
        zeigeMeldung(Texte.t(608) + WELT_NAMEN[aktuelleWelt], dockZeile, Texte.t(599), Szene.Hangar)
    }
}

function gibNotfallTreibstoff(): boolean {
    let mindestwert = Math.min(2, maxTreibstoff())
    let noetig = mindestwert - treibstoff
    if (noetig > 0 && credits < noetig * 8) {
        treibstoff = mindestwert
        return true
    }
    return false
}

function entscheideMissionImDock(): number {
    if (missionsArt == MissionsArt.Keine) return 0
    if (spieltag > missionsFrist) {
        gescheiterteMissionen++
        if (missionsHerkunft == 2) tutorialStufe = 1
        leereMission()
        return -1
    }
    let fertig = false
    if (aktuelleWelt == missionsZiel) {
        if (missionsArt == MissionsArt.Lieferung) {
            if (missionsVariante == MissionsVariante.Zerbrechlich && missionsFortschritt > 0) {
                gescheiterteMissionen++
                leereMission()
                return -2
            }
            fertig = true
        }
        if (missionsArt == MissionsArt.Jagd && missionsFortschritt >= missionsMenge) fertig = true
        if (missionsArt == MissionsArt.Rettung && missionsFortschritt > 0) fertig = true
    }
    if (!fertig) return 0
    let herkunft = missionsHerkunft
    let erfuellteArt = missionsArt
    let erfuellteVariante = missionsVariante
    credits += missionsLohn
    erfuellteMissionen++
    if (erfuellteArt == MissionsArt.Lieferung) erfasseLieferung()
    if (erfuellteArt == MissionsArt.Rettung) erfasseRettung()
    let missionsFraktion = flugEreignisFraktion()
    aendereRuf(missionsFraktion, herkunft == 1 ? 5 : 2)
    if (erfuellteVariante == MissionsVariante.Illegal) {
        aendereRuf(Fraktion.Korsaren, 4)
        aendereRuf(Fraktion.Bund, -2)
    }
    if (herkunft == 2) {
        tutorialStufe = 4
        ausbauten[AUSBAU_SCANNER] = Math.max(1, ausbauten[AUSBAU_SCANNER])
    } else if (herkunft == 1) rueckeKampagneVor()
    else if (herkunft == 3) schliesseTagesMissionAb()
    leereMission()
    if (herkunft == 2) return 2
    if (herkunft == 1 && kampagnenStufe >= 6) return 4
    if (herkunft == 1) return 3
    return 1
}

function zeichneFlugSterne(jetzt: number): void {
    let wackelX = flugWackelX()
    let wackelY = flugWackelY()
    for (let i = 0; i < 24; i++) {
        let x = (festerZufall(flugStartwert, i, 3) + wackelX + 160) % 160
        let grundY = festerZufall(flugStartwert, i, 7) % 88
        let tempo = 1 + i % 3
        let y = (grundY + Math.idiv(jetzt - phaseBegonnen, 35) * tempo + wackelY + 88) % 88
        screen.setPixel(x, y, i % 5 == 0 ? FARBE_TUERKIS : FARBE_TEXT)
    }
}

function flugWackelX(): number {
    if (!kameraWackeln || game.runtime() >= schadenBlitzBisMs) return 0
    return Math.idiv(game.runtime(), 35) % 2 == 0 ? -2 : 2
}

function flugWackelY(): number {
    if (!kameraWackeln || game.runtime() >= schadenBlitzBisMs) return 0
    return Math.idiv(game.runtime(), 55) % 2 == 0 ? -1 : 1
}

function zeichneCockpit(): void {
    screen.fill(FARBE_HINTERGRUND)
    zeichneFlugSterne(game.runtime())
    let wackelX = flugWackelX()
    let wackelY = flugWackelY()
    screen.drawLine(0, 88 + wackelY, 31 + wackelX, 70 + wackelY, FARBE_GEDIMMT)
    screen.drawLine(159, 88 + wackelY, 129 + wackelX, 70 + wackelY, FARBE_GEDIMMT)
    screen.drawLine(31 + wackelX, 70 + wackelY, 47 + wackelX, 88 + wackelY, FARBE_GEDIMMT)
    screen.drawLine(129 + wackelX, 70 + wackelY, 113 + wackelX, 88 + wackelY, FARBE_GEDIMMT)
    screen.fillRect(0, 89, 160, 31, FARBE_BLAU)
    screen.drawLine(0, 89, 160, 89, FARBE_TUERKIS)
    druckeSpielText(Texte.t(260), 3, 94, FARBE_TUERKIS)
    screen.fillRect(13, 95, flugSchild * 22 / Math.max(1, maxSchild()), 4, FARBE_TUERKIS)
    druckeSpielText(Texte.t(609), 3, 104, FARBE_GRUEN)
    screen.fillRect(13, 105, rumpf * 22 / Math.max(1, maxRumpf()), 4, rumpf <= 2 ? FARBE_ROT : FARBE_GRUEN)
    druckeSpielText(Texte.t(610), 45, 94, FARBE_GELB)
    screen.fillRect(55, 95, laserHitze * 2, 4, laserHitze >= 8 ? FARBE_ROT : FARBE_GELB)
    druckeSpielText(Texte.t(281) + treibstoff, 45, 104, FARBE_GRUEN)
    druckeSpielText(flugMeldung, 3, 80, FARBE_TEXT)
    druckeSpielText(waffenAnzeigeName(), 78, 103, FARBE_GELB)
    druckeSpielText(Texte.t(611) + waffenEnergie, 111, 103, energieModus == 2 ? FARBE_GELB : FARBE_TUERKIS)
    druckeSpielText(Texte.t(612) + energieModusName(), 78, 111, energieModus == 0 ? FARBE_GEDIMMT : FARBE_GRUEN)
    let beschaedigteModule = 0
    for (let modul = 0; modul < ANZAHL_MODULE; modul++) if (modulSchaden[modul] > 0) beschaedigteModule++
    if (beschaedigteModule > 0) druckeSpielText(Texte.t(613) + beschaedigteModule, 139, 111, FARBE_ROT)
    if (fluchtBeginnMs > 0) {
        let ladung = Math.min(28, Math.idiv((game.runtime() - fluchtBeginnMs) * 28, fluchtLadezeit()))
        screen.drawRect(78, 107, 30, 6, FARBE_GELB)
        screen.fillRect(79, 108, ladung, 4, FARBE_GELB)
    }
    if (game.runtime() < hinweisTextBisMs) {
        // Beim Stationsanflug und solange die Rettungskapsel gezeigt wird, sitzt der Hinweis oben: Zeile 80 trägt die
        // Flugmeldung, die Zeilen 66 bis 72 die Anweisung zum Andocken oder zum Traktorstrahl samt Balken. Mit der
        // Kapsel ist das Radar (y 9 bis 26) im Bild, darum liegt der Hinweis knapp darunter; die Kapsel wird später
        // gezeichnet und nie vom Hinweis verdeckt.
        let hinweisY = flugPhase == FlugPhase.Anflug ? 18 : (rettungskapselGezeigt() ? 29 : 78)
        screen.fillRect(45, hinweisY - 2, 112, 10, FARBE_HINTERGRUND)
        druckeRechts(hinweisText, 156, hinweisY, FARBE_GELB)
    }
    if (game.runtime() < schadenBlitzBisMs) {
        screen.drawRect(0, 8, 159, 80, FARBE_ROT)
        screen.drawRect(2, 10, 155, 76, FARBE_ORANGE)
    }
    zeichneCockpitRadar()
}

function waffenAnzeigeName(): string {
    if (aktiveWaffe == WaffenArt.Rakete) return Texte.t(614) + raketen
    if (aktiveWaffe == WaffenArt.Mine) return Texte.t(615) + minen
    return Texte.t(616)
}

function zeichneCockpitRadar(): void {
    if (flugPhase != FlugPhase.Begegnung) return
    let scannerSchaden = modulSchaden[Schiffsmodul.Scanner]
    screen.drawRect(132, 9, 25, 18, scannerSchaden >= 2 ? FARBE_ROT : FARBE_TUERKIS)
    screen.setPixel(144, 18, FARBE_GRUEN)
    if (scannerSchaden >= 3 && Math.idiv(game.runtime(), 180) % 2 == 0) {
        druckeSpielText(Texte.t(201), 136, 14, FARBE_ROT)
        return
    }
    if (gegnerAktiv) {
        let rx = 144 + Math.clamp(-10, 10, Math.idiv(gegnerX - fadenkreuzX, 7))
        let ry = 18 + Math.clamp(-7, 7, Math.idiv(gegnerY - fadenkreuzY, 7))
        screen.fillRect(rx - 1, ry - 1, 3, 3, gegnerArt == 4 ? FARBE_ROT : FARBE_ORANGE)
    }
    if (formationBegleiter > 0 && scannerSchaden < 2) {
        screen.setPixel(136, 13, FARBE_GELB)
        if (formationBegleiter > 1) screen.setPixel(153, 23, FARBE_GELB)
    }
}

function zeichneFadenkreuz(): void {
    screen.drawLine(fadenkreuzX - 6, fadenkreuzY, fadenkreuzX - 2, fadenkreuzY, FARBE_GRUEN)
    screen.drawLine(fadenkreuzX + 2, fadenkreuzY, fadenkreuzX + 6, fadenkreuzY, FARBE_GRUEN)
    screen.drawLine(fadenkreuzX, fadenkreuzY - 6, fadenkreuzX, fadenkreuzY - 2, FARBE_GRUEN)
    screen.drawLine(fadenkreuzX, fadenkreuzY + 2, fadenkreuzX, fadenkreuzY + 6, FARBE_GRUEN)
}

function zeichneGegner(): void {
    if (!gegnerAktiv) return
    let x = gegnerX + flugWackelX()
    let y = gegnerY + flugWackelY()
    let s = gegnerGroesse
    let farbe = gegnerArt >= 3 ? FARBE_ROT
        : (gegnerArt == 2 ? FARBE_LILA : (gegnerArt == 1 ? FARBE_GELB : FARBE_ORANGE))
    zeichneGegnerFormation(x, y, s, farbe)
    if (gegnerArt == 0 || gegnerArt == 3) {
        screen.drawLine(x - s, y, x, y - Math.idiv(s, 2), farbe)
        screen.drawLine(x, y - Math.idiv(s, 2), x + s, y, farbe)
        screen.drawLine(x + s, y, x, y + Math.idiv(s, 2), farbe)
        screen.drawLine(x, y + Math.idiv(s, 2), x - s, y, farbe)
    } else if (gegnerArt == 1) {
        screen.drawLine(x - s, y + Math.idiv(s, 2), x, y - s, farbe)
        screen.drawLine(x, y - s, x + s, y + Math.idiv(s, 2), farbe)
        screen.drawLine(x + s, y + Math.idiv(s, 2), x - s, y + Math.idiv(s, 2), farbe)
    } else {
        screen.drawRect(x - s, y - Math.idiv(s, 2), s * 2, s, farbe)
        screen.drawLine(x - s, y, x - s - 4, y - 5, farbe)
        screen.drawLine(x + s, y, x + s + 4, y - 5, farbe)
    }
    if (gegnerSchild > 0) {
        let puls = Math.idiv(game.runtime(), 90) % 3
        zeichneVorschauRaute(x, y, s + 5 + puls, Math.idiv(s, 2) + 5 + puls, FARBE_TUERKIS)
    }
    if (gegnerArt == 4) {
        aktualisiereBossSchwachpunkt()
        screen.drawCircle(bossSchwachpunktX + flugWackelX(), bossSchwachpunktY + flugWackelY(),
            3 + Math.idiv(game.runtime(), 120) % 2, FARBE_GELB)
        druckeSpielText(Texte.t(617) + bossPhase, x - 3, y - s - 8, FARBE_ROT)
    }
    druckeSpielText((gegnerSchild > 0 ? Texte.t(260) + gegnerSchild + " " : "") + Texte.t(609) + gegnerRumpf,
        x - 8, y + s + 2, FARBE_ROT)
}

function zeichneGegnerFormation(x: number, y: number, groesse: number, farbe: number): void {
    if (formationArt == 2) {
        screen.drawRect(x - groesse - 9, y - 4, groesse * 2 + 18, 8, FARBE_GEDIMMT)
        screen.drawLine(x - groesse - 12, y, x - groesse - 5, y, FARBE_GELB)
        screen.drawLine(x + groesse + 5, y, x + groesse + 12, y, FARBE_GELB)
    }
    if (formationBegleiter > 0) {
        screen.drawLine(x - groesse - 12, y + 7, x - groesse - 6, y + 3, farbe)
        screen.drawLine(x - groesse - 6, y + 3, x - groesse - 4, y + 9, farbe)
    }
    if (formationBegleiter > 1) {
        screen.drawLine(x + groesse + 12, y + 7, x + groesse + 6, y + 3, farbe)
        screen.drawLine(x + groesse + 6, y + 3, x + groesse + 4, y + 9, farbe)
    }
}

function zeichneFlugEreignis(): void {
    screen.fillRect(5, 16, 150, 76, FARBE_BLAU)
    screen.drawRect(5, 16, 150, 76, flugEreignisGeloest ? FARBE_GRUEN : FARBE_TUERKIS)
    druckeSpielText(flugEreignisTitel(), 9, 21, FARBE_GELB)
    if (flugEreignisGeloest) {
        druckeUmbrochenText(flugEreignisErgebnis, 9, 36, 23, FARBE_GRUEN)
        druckeSpielText(Texte.t(618), 9, 75, FARBE_TEXT)
    } else {
        druckeUmbrochenText(flugEreignisInfo(), 9, 36, 23, FARBE_TEXT)
        druckeSpielText(flugEreignisAnnehmenBeschriftung(), 9, 67, FARBE_GRUEN)
        druckeSpielText(flugEreignisAblehnungBeschriftung(), 9, 80, FARBE_ORANGE)
    }
}

function rettungskapselGezeigt(): boolean {
    return flugPhase == FlugPhase.Begegnung && missionsArt == MissionsArt.Rettung &&
        missionsZiel == flugZiel && missionsFortschritt == 0 && !gegnerAktiv && !rettungNachKampf
}

function zeichneFlug(): void {
    zeichneCockpit()
    let jetzt = game.runtime()
    if (flugPhase == FlugPhase.Start) {
        let offen = Math.min(34, Math.idiv(jetzt - phaseBegonnen, 45))
        screen.drawRect(80 - offen, 18, offen * 2, 64, FARBE_TUERKIS)
        druckeSpielText(Texte.t(254), 65, 43, FARBE_TEXT)
    } else if (flugPhase == FlugPhase.Reiseflug) {
        druckeSpielText(Texte.t(619) + WELT_NAMEN[flugZiel], 35, 18, FARBE_TUERKIS)
    } else if (flugPhase == FlugPhase.Ereignis) {
        zeichneFlugEreignis()
    } else if (flugPhase == FlugPhase.Begegnung) {
        if (rettungskapselGezeigt()) {
            // Wie die Andock-Anweisung steht der Hinweis zum Traktorstrahl links von seinem Balken (Zeile 80 bleibt für
            // die Flugmeldung frei). Die Kapsel treibt durch das ganze Bild, darum wird sie zuletzt gezeichnet und nie
            // vom Hinweis oder vom Balken verdeckt.
            druckeRechts(Texte.t(620), 111, 66, FARBE_GELB)
            screen.drawRect(113, 67, 34, 5, FARBE_TUERKIS)
            screen.fillRect(114, 68, Math.min(32, Math.idiv(traktorFortschritt * 32, 900)), 3, FARBE_TUERKIS)
            screen.drawRect(rettungskapselX - 5, rettungskapselY - 5, 10, 10, FARBE_GELB)
            screen.drawLine(rettungskapselX - 7, rettungskapselY,
                rettungskapselX + 7, rettungskapselY, FARBE_GELB)
        } else zeichneGegner()
        if (angriffAusloesungMs > 0) {
            screen.drawRect(angriffX - 9, angriffY - 9, 18, 18, FARBE_ROT)
            screen.drawLine(angriffX - 12, angriffY, angriffX + 12, angriffY, FARBE_ROT)
        }
        if (jetzt < waffenBlitzBisMs) {
            screen.drawLine(50, 88, waffenTreffer ? gegnerX : fadenkreuzX, waffenTreffer ?
                gegnerY : fadenkreuzY, FARBE_GELB)
            screen.drawLine(110, 88, waffenTreffer ? gegnerX : fadenkreuzX, waffenTreffer ?
                gegnerY : fadenkreuzY, FARBE_GELB)
        }
    } else if (flugPhase == FlugPhase.Anflug) {
        let vergangen = jetzt - phaseBegonnen
        let torX = 80 + Math.round(Math.sin(vergangen / 700) * 12)
        let groesse = Math.min(34, 13 + Math.idiv(vergangen, 180))
        screen.drawRect(torX - groesse, 46 - Math.idiv(groesse, 2), groesse * 2, groesse, FARBE_TUERKIS)
        screen.drawRect(torX - Math.idiv(groesse, 2), 46 - Math.idiv(groesse, 4), groesse, Math.idiv(groesse, 2),
            FARBE_GRUEN)
        // Die Anweisung zum Andocken steht links vom Andockbalken, unter dem Tor (Unterkante höchstens bei y 62):
        // Zeile 80 bleibt für die Flugmeldung frei, damit lange Titel wie STATIONSANFLUG nicht hineinlaufen.
        druckeRechts(Texte.t(621), 111, 66, FARBE_TEXT)
        screen.drawRect(113, 67, 34, 5, FARBE_GRUEN)
        screen.fillRect(114, 68, Math.min(32, Math.idiv(andockFortschritt * 32, 900)), 3, FARBE_GRUEN)
    }
    if (flugPhase != FlugPhase.Ereignis) zeichneFadenkreuz()
}
