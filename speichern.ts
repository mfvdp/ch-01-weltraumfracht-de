// Speichern und Laden: zwei automatische Plätze und ein Platz zum Speichern von Hand.
const SPIELSTAND_KENNZAHL = 731904
const SPIELSTAND_VERSION = 3
const SPIELSTAND_VERSION_V1 = 1
const SPIELSTAND_VERSION_V2 = 2
const SPIELSTAND_SCHLUESSEL_A = "ot.save.a"
const SPIELSTAND_SCHLUESSEL_B = "ot.save.b"
const SPIELSTAND_SCHLUESSEL_MANUELL = "ot.save.manual"

const ANZAHL_SPIELSTAND_KERNFELDER = 26
const ANZAHL_SPIELSTAND_V2_ALTE_ZUSATZFELDER = 11
const ANZAHL_SPIELSTAND_V3_NEUE_FELDER = 200
const ANZAHL_SPIELSTAND_V3_ZUSATZFELDER = ANZAHL_SPIELSTAND_V2_ALTE_ZUSATZFELDER + ANZAHL_SPIELSTAND_V3_NEUE_FELDER
// Alter Name, wird nirgends mehr gelesen: In einem aktuellen Spielstand beginnen die Listen der Fracht hinter allen
// Feldern, die von der Version abhängen.
const ANZAHL_SPIELSTAND_V2_ZUSATZFELDER = ANZAHL_SPIELSTAND_V3_ZUSATZFELDER
const ANZAHL_SPIELSTAND_LISTENFELDER = ANZAHL_WAREN * 3 + ANZAHL_AUSBAUTEN
const SPIELSTAND_MAX_ZAEHLER = 9999999
const SPIELSTAND_MAX_PUNKTE = 999999999
const SPIELSTAND_MAX_FOLGE = 2000000000
const SPIELSTAND_MAX_STARTWERT = 32748

function spielstandPruefsummeLaenge(werte: number[], laenge: number): number {
    let ergebnis = 19
    for (let i = 0; i < laenge; i++) {
        let teil = werte[i] % 1000003
        if (teil < 0) teil += 1000003
        ergebnis = (ergebnis + teil * (i + 7)) % 1000003
    }
    return ergebnis
}

function spielstandPruefsumme(werte: number[]): number {
    return spielstandPruefsummeLaenge(werte, werte.length)
}

function erwarteteSpielstandLaengeFuerVersion(version: number): number {
    let extra = 0
    if (version == SPIELSTAND_VERSION_V2) extra = ANZAHL_SPIELSTAND_V2_ALTE_ZUSATZFELDER
    else if (version == SPIELSTAND_VERSION) extra = ANZAHL_SPIELSTAND_V3_ZUSATZFELDER
    return ANZAHL_SPIELSTAND_KERNFELDER + extra + ANZAHL_SPIELSTAND_LISTENFELDER + 1
}

function erwarteteSpielstandLaenge(): number {
    return erwarteteSpielstandLaengeFuerVersion(SPIELSTAND_VERSION)
}

function spielstandGanzzahlImBereich(wert: number, mindestwert: number, hoechstwert: number): boolean {
    return wert == (wert | 0) && wert >= mindestwert && wert <= hoechstwert
}

function stelleV3ZustandSicher(): void {
    if (!fraktionRuf || fraktionRuf.length != ANZAHL_FRAKTIONEN)
        fraktionRuf = fuelleZahlenListe(ANZAHL_FRAKTIONEN, 0)
    if (!marktEinfluss || marktEinfluss.length != ANZAHL_WELTEN)
        marktEinfluss = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    if (!marktGedaechtnisTag || marktGedaechtnisTag.length != ANZAHL_WELTEN)
        marktGedaechtnisTag = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    if (!marktGedaechtnisWare || marktGedaechtnisWare.length != ANZAHL_WELTEN)
        marktGedaechtnisWare = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    if (!marktGedaechtnisKauf || marktGedaechtnisKauf.length != ANZAHL_WELTEN)
        marktGedaechtnisKauf = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    if (!marktGedaechtnisVerkauf || marktGedaechtnisVerkauf.length != ANZAHL_WELTEN)
        marktGedaechtnisVerkauf = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    if (!marktGedaechtnisTrend || marktGedaechtnisTrend.length != ANZAHL_WELTEN)
        marktGedaechtnisTrend = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    if (!raritaeten || raritaeten.length != ANZAHL_RARITAETEN) raritaeten = fuelleZahlenListe(ANZAHL_RARITAETEN, 0)
    if (!schiffsnameNr || schiffsnameNr.length != ANZAHL_SCHIFFSROLLEN) schiffsnameNr = [0, 1, 2]
    if (!schiffsLack || schiffsLack.length != ANZAHL_SCHIFFSROLLEN)
        schiffsLack = fuelleZahlenListe(ANZAHL_SCHIFFSROLLEN, 0)
    if (!modulSchaden || modulSchaden.length != ANZAHL_MODULE)
        modulSchaden = fuelleZahlenListe(ANZAHL_MODULE, 0)
    eigeneSchiffeMaske |= (1 << Schiffsrolle.Kaufmann) | (1 << schiffsrolle)
}

function haengeAlteV2FelderAn(werte: number[]): void {
    werte.push(tutorialStufe)
    werte.push(kampagnenStufe)
    werte.push(missionsVariante)
    werte.push(missionsHerkunft)
    werte.push(galaxieStartwert)
    werte.push(marktEreignisArt)
    werte.push(marktEreignisWelt)
    werte.push(marktEreignisWare)
    werte.push(marktEreignisEnde)
    werte.push(schiffsrolle)
    werte.push(spielModus)
}

function haengeV3FelderAn(werte: number[]): void {
    for (let i = 0; i < ANZAHL_FRAKTIONEN; i++) werte.push(fraktionRuf[i])
    werte.push(endeWahl)
    for (let i = 0; i < ANZAHL_WELTEN; i++) werte.push(marktEinfluss[i])
    for (let i = 0; i < ANZAHL_WELTEN; i++) werte.push(marktGedaechtnisTag[i])
    for (let i = 0; i < ANZAHL_WELTEN; i++) werte.push(marktGedaechtnisWare[i])
    for (let i = 0; i < ANZAHL_WELTEN; i++) werte.push(marktGedaechtnisKauf[i])
    for (let i = 0; i < ANZAHL_WELTEN; i++) werte.push(marktGedaechtnisVerkauf[i])
    for (let i = 0; i < ANZAHL_WELTEN; i++) werte.push(marktGedaechtnisTrend[i])
    for (let i = 0; i < ANZAHL_RARITAETEN; i++) werte.push(raritaeten[i])
    werte.push(artefaktMaske)
    werte.push(geheimeWeltenMaske)
    werte.push(eigeneSchiffeMaske)
    for (let i = 0; i < ANZAHL_SCHIFFSROLLEN; i++) werte.push(schiffsnameNr[i])
    for (let i = 0; i < ANZAHL_SCHIFFSROLLEN; i++) werte.push(schiffsLack[i])
    werte.push(erfolgMaske)
    werte.push(besuchteWeltenMaskeNiedrig)
    werte.push(besuchteWeltenMaskeHoch)
    werte.push(spruengeGesamt)
    werte.push(rettungenGesamt)
    werte.push(lieferungenGesamt)
    werte.push(verdienstGesamt)
    werte.push(groessterHandelsgewinn)
    werte.push(bossSiege)
    werte.push(schwarzmarktGeschaefte)
    werte.push(erledigteEreignisse)
    werte.push(tagesMissionsTag)
    werte.push(tagesMissionsErledigt)
    werte.push(neuesSpielPlusStufe)
    werte.push(aktiveWaffe)
    werte.push(raketen)
    werte.push(minen)
    werte.push(waffenEnergie)
    werte.push(energieModus)
    for (let i = 0; i < ANZAHL_MODULE; i++) werte.push(modulSchaden[i])
    werte.push(textTempo)
    werte.push(hoherKontrast)
    werte.push(kameraWackeln)
    werte.push(entwicklerModus)
}

function haengeSpielstandListenAn(werte: number[]): void {
    for (let i = 0; i < ANZAHL_WAREN; i++) werte.push(fracht[i])
    for (let i = 0; i < ANZAHL_WAREN; i++) werte.push(frachtKosten[i])
    for (let i = 0; i < ANZAHL_AUSBAUTEN; i++) werte.push(ausbauten[i])
    for (let i = 0; i < ANZAHL_WAREN; i++) werte.push(marktVorrat[i])
}

function packeSpielstand(): number[] {
    stelleV3ZustandSicher()
    let werte: number[] = []
    werte.push(SPIELSTAND_KENNZAHL)
    werte.push(SPIELSTAND_VERSION)
    werte.push(spielstandFolge)
    werte.push(aktuelleWelt)
    werte.push(zielWelt)
    werte.push(spieltag)
    werte.push(credits)
    werte.push(treibstoff)
    werte.push(rumpf)
    werte.push(handelsGewinn)
    werte.push(siegeGesamt)
    werte.push(erfuellteMissionen)
    werte.push(gescheiterteMissionen)
    werte.push(missionsArt)
    werte.push(missionsAnnahmeWelt)
    werte.push(missionsZiel)
    werte.push(missionsFrist)
    werte.push(missionsLohn)
    werte.push(missionsWare)
    werte.push(missionsMenge)
    werte.push(missionsFortschritt)
    werte.push(missionsStartwert)
    werte.push(inFlug)
    werte.push(flugStart)
    werte.push(flugZiel)
    werte.push(flugStartwert)
    haengeAlteV2FelderAn(werte)
    haengeV3FelderAn(werte)
    haengeSpielstandListenAn(werte)
    werte.push(spielstandPruefsumme(werte))
    return werte
}

function istPruefsummeGueltig(werte: number[]): boolean {
    let pruefsummeStelle = werte.length - 1
    if (!spielstandGanzzahlImBereich(werte[pruefsummeStelle], 0, 1000002)) return false
    return spielstandPruefsummeLaenge(werte, pruefsummeStelle) == werte[pruefsummeStelle]
}

function istKernGueltig(werte: number[], listenAnfang: number, gespeicherteSchiffsrolle: number): boolean {
    if (!spielstandGanzzahlImBereich(werte[2], 0, SPIELSTAND_MAX_FOLGE)) return false
    if (!spielstandGanzzahlImBereich(werte[3], 0, ANZAHL_WELTEN - 1)) return false
    if (!spielstandGanzzahlImBereich(werte[4], 0, ANZAHL_WELTEN - 1)) return false
    if (!spielstandGanzzahlImBereich(werte[5], 1, SPIELSTAND_MAX_ZAEHLER)) return false
    if (!spielstandGanzzahlImBereich(werte[6], 0, SPIELSTAND_MAX_ZAEHLER)) return false
    if (!spielstandGanzzahlImBereich(werte[9], 0, SPIELSTAND_MAX_PUNKTE)) return false
    if (!spielstandGanzzahlImBereich(werte[10], 0, SPIELSTAND_MAX_ZAEHLER)) return false
    if (!spielstandGanzzahlImBereich(werte[11], 0, SPIELSTAND_MAX_ZAEHLER)) return false
    if (!spielstandGanzzahlImBereich(werte[12], 0, SPIELSTAND_MAX_ZAEHLER)) return false
    if (!spielstandGanzzahlImBereich(werte[13], MissionsArt.Keine, MissionsArt.Rettung)) return false
    if (!spielstandGanzzahlImBereich(werte[14], 0, ANZAHL_WELTEN - 1)) return false
    if (!spielstandGanzzahlImBereich(werte[15], 0, ANZAHL_WELTEN - 1)) return false
    if (!spielstandGanzzahlImBereich(werte[16], 0, SPIELSTAND_MAX_ZAEHLER)) return false
    if (!spielstandGanzzahlImBereich(werte[17], 0, SPIELSTAND_MAX_ZAEHLER)) return false
    if (!spielstandGanzzahlImBereich(werte[18], 0, ANZAHL_WAREN - 1)) return false
    if (!spielstandGanzzahlImBereich(werte[19], 0, 99)) return false
    if (!spielstandGanzzahlImBereich(werte[20], 0, werte[19])) return false
    if (!spielstandGanzzahlImBereich(werte[21], 0, SPIELSTAND_MAX_STARTWERT)) return false
    if (!spielstandGanzzahlImBereich(werte[22], 0, 1)) return false
    if (!spielstandGanzzahlImBereich(werte[23], 0, ANZAHL_WELTEN - 1)) return false
    if (!spielstandGanzzahlImBereich(werte[24], 0, ANZAHL_WELTEN - 1)) return false
    if (!spielstandGanzzahlImBereich(werte[25], 0, SPIELSTAND_MAX_STARTWERT)) return false
    if (werte[22] == 1 && werte[23] == werte[24]) return false
    if (werte[13] == MissionsArt.Keine) {
        if (werte[16] != 0 || werte[17] != 0 || werte[19] != 0 || werte[20] != 0) return false
    } else if (werte[16] < 1 || werte[17] < 1 || werte[19] < 1) return false

    let ausbauAnfang = listenAnfang + ANZAHL_WAREN * 2
    for (let i = 0; i < ANZAHL_AUSBAUTEN; i++) {
        if (!spielstandGanzzahlImBereich(werte[ausbauAnfang + i], 0, AUSBAU_MAX[i])) return false
    }
    let gespeicherteFrachtKapazitaet = 8 + werte[ausbauAnfang + AUSBAU_FRACHT] * 4
    if (gespeicherteSchiffsrolle == Schiffsrolle.Kaufmann) gespeicherteFrachtKapazitaet += 4
    let gespeicherterMaxTreibstoff = 5 + werte[ausbauAnfang + AUSBAU_SPRUNG]
    if (gespeicherteSchiffsrolle == Schiffsrolle.Kurier) gespeicherterMaxTreibstoff += 2
    let gespeicherterMaxRumpf = 8 + werte[ausbauAnfang + AUSBAU_PANZER] * 3
    if (!spielstandGanzzahlImBereich(werte[7], 0, gespeicherterMaxTreibstoff)) return false
    if (!spielstandGanzzahlImBereich(werte[8], 1, gespeicherterMaxRumpf)) return false
    let belegtFracht = werte[13] == MissionsArt.Lieferung || werte[13] == MissionsArt.Rettung ? werte[19] : 0
    for (let i = 0; i < ANZAHL_WAREN; i++) {
        let einheiten = werte[listenAnfang + i]
        let kosten = werte[listenAnfang + ANZAHL_WAREN + i]
        if (!spielstandGanzzahlImBereich(einheiten, 0, gespeicherteFrachtKapazitaet)) return false
        if (!spielstandGanzzahlImBereich(kosten, 0, SPIELSTAND_MAX_ZAEHLER)) return false
        if (einheiten == 0 && kosten != 0) return false
        belegtFracht += einheiten
    }
    if (belegtFracht > gespeicherteFrachtKapazitaet) return false
    let vorratAnfang = ausbauAnfang + ANZAHL_AUSBAUTEN
    for (let i = 0; i < ANZAHL_WAREN; i++)
        if (!spielstandGanzzahlImBereich(werte[vorratAnfang + i], 0, 99)) return false
    return true
}

function sindAlteV2FelderGueltig(werte: number[], anfang: number): boolean {
    let p = anfang
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 4)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, ANZAHL_KAMPAGNENMISSIONEN)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], MissionsVariante.Standard, MissionsVariante.UnterFeuer)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 3)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 1, SPIELSTAND_MAX_STARTWERT)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], MarktEreignisArt.Keine, MarktEreignisArt.Boom)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, ANZAHL_WELTEN - 1)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, ANZAHL_WAREN - 1)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, SPIELSTAND_MAX_ZAEHLER)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], Schiffsrolle.Kaufmann, Schiffsrolle.Jaeger)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], SpielModus.Standard, SpielModus.Eisern)) return false
    return true
}

function istSpielstandV1Gueltig(werte: number[]): boolean {
    if (werte.length != erwarteteSpielstandLaengeFuerVersion(SPIELSTAND_VERSION_V1)) return false
    if (!istPruefsummeGueltig(werte)) return false
    return istKernGueltig(werte, ANZAHL_SPIELSTAND_KERNFELDER, -1)
}

function istSpielstandV2Gueltig(werte: number[]): boolean {
    if (werte.length != erwarteteSpielstandLaengeFuerVersion(SPIELSTAND_VERSION_V2)) return false
    if (!istPruefsummeGueltig(werte) ||
        !sindAlteV2FelderGueltig(werte, ANZAHL_SPIELSTAND_KERNFELDER)) return false
    return istKernGueltig(werte, ANZAHL_SPIELSTAND_KERNFELDER +
        ANZAHL_SPIELSTAND_V2_ALTE_ZUSATZFELDER, werte[35])
}

function sindV3FelderGueltig(werte: number[], anfang: number, listenAnfang: number): boolean {
    let p = anfang
    for (let i = 0; i < ANZAHL_FRAKTIONEN; i++) if (!spielstandGanzzahlImBereich(werte[p++], -100, 100)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], EndeArt.Keine, EndeArt.Freibeuter)) return false
    for (let i = 0; i < ANZAHL_WELTEN; i++) if (!spielstandGanzzahlImBereich(werte[p++], -20, 20)) return false
    for (let i = 0; i < ANZAHL_WELTEN; i++) if (!spielstandGanzzahlImBereich(werte[p++], 0, SPIELSTAND_MAX_ZAEHLER))
        return false
    for (let i = 0; i < ANZAHL_WELTEN; i++) if (!spielstandGanzzahlImBereich(werte[p++], 0, ANZAHL_WAREN - 1))
        return false
    for (let i = 0; i < ANZAHL_WELTEN; i++) if (!spielstandGanzzahlImBereich(werte[p++], 0, 9999)) return false
    for (let i = 0; i < ANZAHL_WELTEN; i++) if (!spielstandGanzzahlImBereich(werte[p++], 0, 9999)) return false
    for (let i = 0; i < ANZAHL_WELTEN; i++) if (!spielstandGanzzahlImBereich(werte[p++], -2, 2)) return false
    let raritaetenEinheiten = 0
    for (let i = 0; i < ANZAHL_RARITAETEN; i++) {
        if (!spielstandGanzzahlImBereich(werte[p], 0, 99)) return false
        raritaetenEinheiten += werte[p++]
    }
    if (!spielstandGanzzahlImBereich(werte[p++], 0, (1 << ANZAHL_ARTEFAKTE) - 1)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0,
        (1 << (ANZAHL_WELTEN - ANZAHL_OEFFENTLICHER_WELTEN)) - 1)) return false
    let gespeicherteEigeneSchiffe = werte[p++]
    if (!spielstandGanzzahlImBereich(gespeicherteEigeneSchiffe, 1, (1 << ANZAHL_SCHIFFSROLLEN) - 1)) return false
    if ((gespeicherteEigeneSchiffe & 1) == 0 ||
        (gespeicherteEigeneSchiffe & (1 << werte[35])) == 0) return false
    for (let i = 0; i < ANZAHL_SCHIFFSROLLEN; i++)
        if (!spielstandGanzzahlImBereich(werte[p++], 0, ANZAHL_SCHIFFSNAMEN - 1))
        return false
    for (let i = 0; i < ANZAHL_SCHIFFSROLLEN; i++)
        if (!spielstandGanzzahlImBereich(werte[p++], 0, ANZAHL_LACKE - 1))
        return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, (1 << ANZAHL_ERFOLGE) - 1)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 65535)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 1023)) return false
    for (let i = 0; i < 3; i++) if (!spielstandGanzzahlImBereich(werte[p++], 0, SPIELSTAND_MAX_ZAEHLER)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, SPIELSTAND_MAX_PUNKTE)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, SPIELSTAND_MAX_ZAEHLER)) return false
    for (let i = 0; i < 3; i++) if (!spielstandGanzzahlImBereich(werte[p++], 0, SPIELSTAND_MAX_ZAEHLER)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, SPIELSTAND_MAX_ZAEHLER)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 1)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 9)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], WaffenArt.Laser, WaffenArt.Mine)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 12)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 8)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 100)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 3)) return false
    for (let i = 0; i < ANZAHL_MODULE; i++) if (!spielstandGanzzahlImBereich(werte[p++], 0, 3)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 2)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 1)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 1)) return false
    if (!spielstandGanzzahlImBereich(werte[p++], 0, 1)) return false
    if (p != listenAnfang) return false
    let ausbauAnfang = listenAnfang + ANZAHL_WAREN * 2
    let kapazitaet = 8 + werte[ausbauAnfang + AUSBAU_FRACHT] * 4 +
        (werte[ANZAHL_SPIELSTAND_KERNFELDER + 9] == Schiffsrolle.Kaufmann ? 4 : 0)
    let grundBelegt = werte[13] == MissionsArt.Lieferung || werte[13] == MissionsArt.Rettung ? werte[19] : 0
    for (let i = 0; i < ANZAHL_WAREN; i++) grundBelegt += werte[listenAnfang + i]
    return grundBelegt + raritaetenEinheiten <= kapazitaet
}

function istSpielstandV3Gueltig(werte: number[]): boolean {
    if (werte.length != erwarteteSpielstandLaenge()) return false
    if (!istPruefsummeGueltig(werte) ||
        !sindAlteV2FelderGueltig(werte, ANZAHL_SPIELSTAND_KERNFELDER)) return false
    let listenAnfang = ANZAHL_SPIELSTAND_KERNFELDER + ANZAHL_SPIELSTAND_V3_ZUSATZFELDER
    if (!sindV3FelderGueltig(werte, ANZAHL_SPIELSTAND_KERNFELDER +
        ANZAHL_SPIELSTAND_V2_ALTE_ZUSATZFELDER, listenAnfang))
        return false
    return istKernGueltig(werte, listenAnfang, werte[35])
}

function istSpielstandGueltig(werte: number[]): boolean {
    if (!werte || werte.length < 3 || werte[0] != SPIELSTAND_KENNZAHL) return false
    if (werte[1] == SPIELSTAND_VERSION_V1) return istSpielstandV1Gueltig(werte)
    if (werte[1] == SPIELSTAND_VERSION_V2) return istSpielstandV2Gueltig(werte)
    if (werte[1] == SPIELSTAND_VERSION) return istSpielstandV3Gueltig(werte)
    return false
}

function liesSpeicherListe(schluessel: string): number[] {
    if (!settings.exists(schluessel)) return null
    return settings.readNumberArray(schluessel)
}

function neuesterGueltigerSpielstand(a: number[], b: number[]): number[] {
    let gueltigA = istSpielstandGueltig(a)
    let gueltigB = istSpielstandGueltig(b)
    if (!gueltigA) return gueltigB ? b : null
    if (!gueltigB) return a
    return a[2] >= b[2] ? a : b
}

function schreibeSpielstand(): void {
    spielstandFolge++
    let werte = packeSpielstand()
    if (spielstandFolge % 2 == 0) settings.writeNumberArray(SPIELSTAND_SCHLUESSEL_A, werte)
    else settings.writeNumberArray(SPIELSTAND_SCHLUESSEL_B, werte)
    hatSpielstand = true
}

function manuellerSpielstandVorhanden(): boolean {
    return istSpielstandGueltig(liesSpeicherListe(SPIELSTAND_SCHLUESSEL_MANUELL))
}

function schreibeManuellenSpielstand(): void {
    spielstandFolge++
    settings.writeNumberArray(SPIELSTAND_SCHLUESSEL_MANUELL, packeSpielstand())
    hatSpielstand = true
}

function ladeManuellenSpielstand(): boolean {
    let werte = liesSpeicherListe(SPIELSTAND_SCHLUESSEL_MANUELL)
    if (!istSpielstandGueltig(werte)) return false
    let neuester = spielstandFolge
    entpackeSpielstand(werte)
    // Nach dem neuesten automatischen Spielstand weiterzählen, sonst würde der nächste Start wieder genau diesen laden.
    spielstandFolge = Math.max(spielstandFolge, neuester)
    schreibeSpielstand()
    return true
}

function loescheManuellenSpielstand(): void {
    if (settings.exists(SPIELSTAND_SCHLUESSEL_MANUELL)) settings.remove(SPIELSTAND_SCHLUESSEL_MANUELL)
}

function uebertragenerGalaxieStartwert(welt: number, tag: number): number {
    return 1 + festerZufall(welt, tag, 17) % SPIELSTAND_MAX_STARTWERT
}

function richteUebertragenenV2ZustandEin(): void {
    fraktionRuf = fuelleZahlenListe(ANZAHL_FRAKTIONEN, 0)
    endeWahl = EndeArt.Keine
    marktEinfluss = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    marktGedaechtnisTag = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    marktGedaechtnisWare = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    marktGedaechtnisKauf = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    marktGedaechtnisVerkauf = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    marktGedaechtnisTrend = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    raritaeten = fuelleZahlenListe(ANZAHL_RARITAETEN, 0)
    artefaktMaske = 0
    geheimeWeltenMaske = 0
    eigeneSchiffeMaske = (1 << Schiffsrolle.Kaufmann) | (1 << schiffsrolle)
    schiffsnameNr = [0, 1, 2]
    schiffsLack = fuelleZahlenListe(ANZAHL_SCHIFFSROLLEN, 0)
    erfolgMaske = 0
    besuchteWeltenMaskeNiedrig = aktuelleWelt < 16 ? 1 << aktuelleWelt : 0
    besuchteWeltenMaskeHoch = aktuelleWelt >= 16 ? 1 << (aktuelleWelt - 16) : 0
    spruengeGesamt = 0
    rettungenGesamt = 0
    lieferungenGesamt = 0
    verdienstGesamt = 0
    groessterHandelsgewinn = 0
    bossSiege = 0
    schwarzmarktGeschaefte = 0
    erledigteEreignisse = 0
    tagesMissionsTag = 0
    tagesMissionsErledigt = 0
    neuesSpielPlusStufe = 0
    aktiveWaffe = WaffenArt.Laser
    raketen = 3
    minen = 2
    waffenEnergie = 100
    energieModus = 0
    modulSchaden = fuelleZahlenListe(ANZAHL_MODULE, 0)
    textTempo = 1
    hoherKontrast = 0
    kameraWackeln = 1
    entwicklerModus = 0
}

function liesAlteV2Felder(werte: number[], p: number): number {
    tutorialStufe = werte[p++]
    kampagnenStufe = werte[p++]
    missionsVariante = werte[p++]
    missionsHerkunft = werte[p++]
    galaxieStartwert = werte[p++]
    marktEreignisArt = werte[p++]
    marktEreignisWelt = werte[p++]
    marktEreignisWare = werte[p++]
    marktEreignisEnde = werte[p++]
    schiffsrolle = werte[p++]
    spielModus = werte[p++]
    return p
}

function liesV3Felder(werte: number[], p: number): number {
    fraktionRuf = fuelleZahlenListe(ANZAHL_FRAKTIONEN, 0)
    for (let i = 0; i < ANZAHL_FRAKTIONEN; i++) fraktionRuf[i] = werte[p++]
    endeWahl = werte[p++]
    marktEinfluss = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    for (let i = 0; i < ANZAHL_WELTEN; i++) marktEinfluss[i] = werte[p++]
    marktGedaechtnisTag = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    for (let i = 0; i < ANZAHL_WELTEN; i++) marktGedaechtnisTag[i] = werte[p++]
    marktGedaechtnisWare = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    for (let i = 0; i < ANZAHL_WELTEN; i++) marktGedaechtnisWare[i] = werte[p++]
    marktGedaechtnisKauf = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    for (let i = 0; i < ANZAHL_WELTEN; i++) marktGedaechtnisKauf[i] = werte[p++]
    marktGedaechtnisVerkauf = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    for (let i = 0; i < ANZAHL_WELTEN; i++) marktGedaechtnisVerkauf[i] = werte[p++]
    marktGedaechtnisTrend = fuelleZahlenListe(ANZAHL_WELTEN, 0)
    for (let i = 0; i < ANZAHL_WELTEN; i++) marktGedaechtnisTrend[i] = werte[p++]
    raritaeten = fuelleZahlenListe(ANZAHL_RARITAETEN, 0)
    for (let i = 0; i < ANZAHL_RARITAETEN; i++) raritaeten[i] = werte[p++]
    artefaktMaske = werte[p++]
    geheimeWeltenMaske = werte[p++]
    eigeneSchiffeMaske = werte[p++]
    schiffsnameNr = fuelleZahlenListe(ANZAHL_SCHIFFSROLLEN, 0)
    for (let i = 0; i < ANZAHL_SCHIFFSROLLEN; i++) schiffsnameNr[i] = werte[p++]
    schiffsLack = fuelleZahlenListe(ANZAHL_SCHIFFSROLLEN, 0)
    for (let i = 0; i < ANZAHL_SCHIFFSROLLEN; i++) schiffsLack[i] = werte[p++]
    erfolgMaske = werte[p++]
    besuchteWeltenMaskeNiedrig = werte[p++]
    besuchteWeltenMaskeHoch = werte[p++]
    spruengeGesamt = werte[p++]
    rettungenGesamt = werte[p++]
    lieferungenGesamt = werte[p++]
    verdienstGesamt = werte[p++]
    groessterHandelsgewinn = werte[p++]
    bossSiege = werte[p++]
    schwarzmarktGeschaefte = werte[p++]
    erledigteEreignisse = werte[p++]
    tagesMissionsTag = werte[p++]
    tagesMissionsErledigt = werte[p++]
    neuesSpielPlusStufe = werte[p++]
    aktiveWaffe = werte[p++]
    raketen = werte[p++]
    minen = werte[p++]
    waffenEnergie = werte[p++]
    energieModus = werte[p++]
    modulSchaden = fuelleZahlenListe(ANZAHL_MODULE, 0)
    for (let i = 0; i < ANZAHL_MODULE; i++) modulSchaden[i] = werte[p++]
    textTempo = werte[p++]
    hoherKontrast = werte[p++]
    kameraWackeln = werte[p++]
    entwicklerModus = werte[p++]
    return p
}

function entpackeSpielstand(werte: number[]): void {
    let version = werte[1]
    let p = 2
    spielstandFolge = werte[p++]
    aktuelleWelt = werte[p++]
    zielWelt = werte[p++]
    spieltag = werte[p++]
    credits = werte[p++]
    treibstoff = werte[p++]
    rumpf = werte[p++]
    handelsGewinn = werte[p++]
    siegeGesamt = werte[p++]
    erfuellteMissionen = werte[p++]
    gescheiterteMissionen = werte[p++]
    missionsArt = werte[p++]
    missionsAnnahmeWelt = werte[p++]
    missionsZiel = werte[p++]
    missionsFrist = werte[p++]
    missionsLohn = werte[p++]
    missionsWare = werte[p++]
    missionsMenge = werte[p++]
    missionsFortschritt = werte[p++]
    missionsStartwert = werte[p++]
    inFlug = werte[p++]
    flugStart = werte[p++]
    flugZiel = werte[p++]
    flugStartwert = werte[p++]
    if (version >= SPIELSTAND_VERSION_V2) p = liesAlteV2Felder(werte, p)
    else {
        tutorialStufe = 1
        kampagnenStufe = 0
        missionsVariante = MissionsVariante.Standard
        missionsHerkunft = 0
        galaxieStartwert = uebertragenerGalaxieStartwert(aktuelleWelt, spieltag)
        marktEreignisArt = MarktEreignisArt.Keine
        marktEreignisWelt = 0
        marktEreignisWare = 0
        marktEreignisEnde = 0
        schiffsrolle = Schiffsrolle.Kaufmann
        spielModus = SpielModus.Standard
    }
    if (version == SPIELSTAND_VERSION) p = liesV3Felder(werte, p)
    else richteUebertragenenV2ZustandEin()
    fracht = fuelleZahlenListe(ANZAHL_WAREN, 0)
    frachtKosten = fuelleZahlenListe(ANZAHL_WAREN, 0)
    ausbauten = fuelleZahlenListe(ANZAHL_AUSBAUTEN, 0)
    marktVorrat = fuelleZahlenListe(ANZAHL_WAREN, 0)
    for (let i = 0; i < ANZAHL_WAREN; i++) fracht[i] = werte[p++]
    for (let i = 0; i < ANZAHL_WAREN; i++) frachtKosten[i] = werte[p++]
    for (let i = 0; i < ANZAHL_AUSBAUTEN; i++) ausbauten[i] = werte[p++]
    for (let i = 0; i < ANZAHL_WAREN; i++) marktVorrat[i] = werte[p++]
    treibstoff = Math.min(treibstoff, maxTreibstoff())
    leereGeplanteRoute()
}

function ladeSpiel(): boolean {
    let gewaehlt =
        neuesterGueltigerSpielstand(
        liesSpeicherListe(SPIELSTAND_SCHLUESSEL_A), liesSpeicherListe(SPIELSTAND_SCHLUESSEL_B))
    if (!gewaehlt) {
        hatSpielstand = false
        spielstandDefekt = settings.exists(SPIELSTAND_SCHLUESSEL_A) || settings.exists(SPIELSTAND_SCHLUESSEL_B)
        return false
    }
    let uebertragung = gewaehlt[1] != SPIELSTAND_VERSION
    entpackeSpielstand(gewaehlt)
    hatSpielstand = true
    spielstandDefekt = false
    if (uebertragung) schreibeSpielstand()
    return true
}

function loescheSpielstand(): void {
    if (settings.exists(SPIELSTAND_SCHLUESSEL_A)) settings.remove(SPIELSTAND_SCHLUESSEL_A)
    if (settings.exists(SPIELSTAND_SCHLUESSEL_B)) settings.remove(SPIELSTAND_SCHLUESSEL_B)
    loescheManuellenSpielstand()
    hatSpielstand = false
    spielstandDefekt = false
    spielstandFolge = 0
}
