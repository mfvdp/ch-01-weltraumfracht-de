// Die Regeln und der Zustand des Spiels: Markt, Aufträge, Kampagne und Erfolge.
enum Szene {
    Titel,
    Hangar,
    Markt,
    Werft,
    Missionen,
    Sternkarte,
    Status,
    Flug,
    Meldung,
    SpielstandLoeschen,
    Intro
}

enum MissionsArt {
    Keine,
    Lieferung,
    Jagd,
    Rettung
}

enum MissionsVariante {
    Standard,
    Zerbrechlich,
    Express,
    Illegal,
    Ass,
    UnterFeuer
}

enum MarktEreignisArt {
    Keine,
    Knappheit,
    Ueberschuss,
    Blockade,
    Boom
}

enum Schiffsrolle {
    Kaufmann,
    Kurier,
    Jaeger
}

enum SpielModus {
    Standard,
    Veteran,
    Eisern
}

enum FlugPhase {
    Start,
    Reiseflug,
    Begegnung,
    Ereignis,
    Anflug,
    Andocken,
    Rettung
}

enum Fraktion {
    Bund,
    Gilde,
    Forscher,
    Korsaren
}

enum Raritaet {
    Relikt,
    Netzkern,
    Aliensaat
}

enum WaffenArt {
    Laser,
    Rakete,
    Mine
}

enum Schiffsmodul {
    Antrieb,
    Scanner,
    Waffen,
    Fracht
}

enum EndeArt {
    Keine,
    Bund,
    Handelskrone,
    Entdecker,
    Freibeuter
}

// Dauerhafter Zustand der Spielerin oder des Spielers. Feste Inhalte stehen in daten.ts und werden über
// ihre Nummer angesprochen.
let credits = 0
let aktuelleWelt = 0
let zielWelt = 0
let spieltag = 1
let treibstoff = 0
let rumpf = 0
let handelsGewinn = 0
let siegeGesamt = 0
let erfuellteMissionen = 0
let gescheiterteMissionen = 0
let fracht: number[] = []
let frachtKosten: number[] = []
let ausbauten: number[] = []
let marktVorrat: number[] = []

// Fortschritt und Zustand der Galaxie. speichern.ts legt diese Werte im Spielstand ab.
let tutorialStufe = 0
let kampagnenStufe = 0
let galaxieStartwert = 1
let marktEreignisArt = MarktEreignisArt.Keine
let marktEreignisWelt = 0
let marktEreignisWare = 0
let marktEreignisEnde = 0
let schiffsrolle = Schiffsrolle.Kaufmann
let spielModus = SpielModus.Standard

// Dieser Zustand steckt mit Absicht in kleinen Zahlenlisten und Bitmasken. So bleiben der Speicher während des Spiels
// und die drei Spielstände auf dem Gerät klein.
let fraktionRuf: number[] = []
let endeWahl = EndeArt.Keine
let marktEinfluss: number[] = []
let marktGedaechtnisTag: number[] = []
let marktGedaechtnisWare: number[] = []
let marktGedaechtnisKauf: number[] = []
let marktGedaechtnisVerkauf: number[] = []
let marktGedaechtnisTrend: number[] = []
let raritaeten: number[] = []
let artefaktMaske = 0
let geheimeWeltenMaske = 0
let eigeneSchiffeMaske = 1 << Schiffsrolle.Kaufmann
let schiffsnameNr: number[] = []
let schiffsLack: number[] = []
let erfolgMaske = 0
let besuchteWeltenMaskeNiedrig = 0
let besuchteWeltenMaskeHoch = 0
let spruengeGesamt = 0
let rettungenGesamt = 0
let lieferungenGesamt = 0
let verdienstGesamt = 0
let groessterHandelsgewinn = 0
let bossSiege = 0
let schwarzmarktGeschaefte = 0
let erledigteEreignisse = 0
let tagesMissionsTag = 0
let tagesMissionsErledigt = 0
let neuesSpielPlusStufe = 0
let aktiveWaffe = WaffenArt.Laser
let raketen = 3
let minen = 2
let waffenEnergie = 100
// 0 ausgeglichen, 1 Schild, 2 Waffen, 3 Antrieb.
let energieModus = 0
let modulSchaden: number[] = []
let textTempo = 1
let hoherKontrast = 0
let kameraWackeln = 1
let entwicklerModus = 0

// Es gibt nur eine aktive Mission. So bleiben die Anzeige und der Spielstand klein.
let missionsArt = MissionsArt.Keine
let missionsAnnahmeWelt = 0
let missionsZiel = 0
let missionsFrist = 0
let missionsLohn = 0
let missionsWare = 0
let missionsMenge = 0
let missionsFortschritt = 0
let missionsStartwert = 0
let missionsVariante = MissionsVariante.Standard
// 0 = normal, 1 = Kampagne, 2 = Tutorial, 3 = Tages-Spezial.
let missionsHerkunft = 0

// Der Startpunkt eines Flugs wird gespeichert, damit ein Neustart (Reset) denselben Flug noch einmal beginnen kann.
let inFlug = 0
let flugStart = 0
let flugZiel = 0
let flugStartwert = 0

// Der Zustand der Anzeige gilt nur für den Augenblick und wird nie gespeichert.
let aktiveSzene = Szene.Titel
let rueckkehrSzene = Szene.Hangar
let menueStelle = 0
let ersteSichtbareZeile = 0
let eingabeGesperrt = false
let handelsMenge = 0
let handelOffen = false
let bestaetigungOffen = false
let spielstandFolge = 0
let hatSpielstand = false
let spielstandDefekt = false
let meldungZeile1 = ""
let meldungZeile2 = ""
let meldungZeile3 = ""

// Die Routenplanung gilt nur für den Augenblick; man kann sie jederzeit aus der Karte neu berechnen.
let geplanteRoute: number[] = []
let geplanteRouteTreibstoff = 0
let neuesSpielSpaeterSpeichern = false

function fuelleZahlenListe(laenge: number, wert: number): number[] {
    let liste: number[] = []
    for (let i = 0; i < laenge; i++) liste.push(wert)
    return liste
}

function frachtEinheiten(): number {
    let belegt =
        (missionsArt == MissionsArt.Lieferung || missionsArt == MissionsArt.Rettung) ? missionsMenge : 0
    for (let i = 0; i < ANZAHL_WAREN; i++) belegt += fracht[i]
    for (let i = 0; i < ANZAHL_RARITAETEN; i++) belegt += raritaeten[i]
    return belegt
}

function frachtKapazitaet(): number {
    return frachtKapazitaetFuerRolle(schiffsrolle)
}

function frachtKapazitaetFuerRolle(rolle: Schiffsrolle): number {
    let schadenAbzug = modulSchaden &&
        modulSchaden.length > Schiffsmodul.Fracht ? modulSchaden[Schiffsmodul.Fracht] : 0
    return Math.max(4, 8 + ausbauten[AUSBAU_FRACHT] * 4 +
        (rolle == Schiffsrolle.Kaufmann ? 4 : 0) - schadenAbzug * 2)
}

function maxRumpf(): number {
    return 8 + ausbauten[AUSBAU_PANZER] * 3
}

function maxSchild(): number {
    return 4 + ausbauten[AUSBAU_SCHILD] * 3 + (schiffsrolle == Schiffsrolle.Jaeger ? 3 : 0)
}

function maxTreibstoff(): number {
    let schadenAbzug = modulSchaden &&
        modulSchaden.length > Schiffsmodul.Antrieb ? modulSchaden[Schiffsmodul.Antrieb] : 0
    return Math.max(3, 5 + ausbauten[AUSBAU_SPRUNG] +
        (schiffsrolle == Schiffsrolle.Kurier ? 2 : 0) - schadenAbzug)
}

function maxSprungKosten(): number {
    let schadenAbzug = modulSchaden &&
        modulSchaden.length > Schiffsmodul.Antrieb ? modulSchaden[Schiffsmodul.Antrieb] : 0
    return Math.max(1, 2 + ausbauten[AUSBAU_SPRUNG] - Math.idiv(schadenAbzug + 1, 2))
}

function laserSchaden(): number {
    let schadenAbzug = modulSchaden &&
        modulSchaden.length > Schiffsmodul.Waffen ? modulSchaden[Schiffsmodul.Waffen] : 0
    let modusBonus = energieModus == 2 ? 1 : 0
    return Math.max(1,
        1 + ausbauten[AUSBAU_LASER] +
            (schiffsrolle == Schiffsrolle.Jaeger ? 1 : 0) + modusBonus - schadenAbzug)
}

function laserAbkuehlzeit(): number {
    let modus = energieModus == 2 ? -60 : (energieModus == 1 || energieModus == 3 ? 60 : 0)
    return Math.max(160, 440 - ausbauten[AUSBAU_KUEHLER] * 100 + modus)
}

function fluchtLadezeit(): number {
    let rolleBonus = schiffsrolle == Schiffsrolle.Kurier ? 400 : 0
    let modusBonus = energieModus == 3 ? 450 : 0
    let antriebAbzug = modulSchaden &&
        modulSchaden.length > Schiffsmodul.Antrieb ? modulSchaden[Schiffsmodul.Antrieb] * 220 : 0
    return Math.max(800, 2600 - ausbauten[AUSBAU_BOOSTER] * 500 - rolleBonus - modusBonus + antriebAbzug)
}

function schiffsrolleNoetigerRang(rolle: Schiffsrolle): number {
    if (rolle == Schiffsrolle.Kurier) return 1
    if (rolle == Schiffsrolle.Jaeger) return 2
    return 0
}

function istSchiffsrolleFreigeschaltet(rolle: Schiffsrolle): boolean {
    return besitztSchiff(rolle) || aktuellerRang() >= schiffsrolleNoetigerRang(rolle)
}

function schiffsrolleName(rolle: Schiffsrolle): string {
    if (rolle == Schiffsrolle.Kurier) return Texte.t(168)
    if (rolle == Schiffsrolle.Jaeger) return Texte.t(224)
    return Texte.t(170)
}

function schiffsrolleInfo(rolle: Schiffsrolle): string {
    if (rolle == Schiffsrolle.Kurier) return Texte.t(225)
    if (rolle == Schiffsrolle.Jaeger) return Texte.t(226)
    return Texte.t(227)
}

function besitztSchiff(rolle: Schiffsrolle): boolean {
    return rolle >= Schiffsrolle.Kaufmann && rolle <= Schiffsrolle.Jaeger &&
        (eigeneSchiffeMaske & (1 << rolle)) != 0
}

function schiffsKaufKosten(rolle: Schiffsrolle): number {
    if (besitztSchiff(rolle)) return 0
    if (rolle == Schiffsrolle.Kurier) return werftPreis(1800)
    if (rolle == Schiffsrolle.Jaeger) return werftPreis(2600)
    return werftPreis(1200)
}

function waehleSchiff(rolle: Schiffsrolle): boolean {
    if (!besitztSchiff(rolle) || frachtEinheiten() > frachtKapazitaetFuerRolle(rolle)) return false
    schiffsrolle = rolle
    treibstoff = Math.min(treibstoff, maxTreibstoff())
    rumpf = Math.min(rumpf, maxRumpf())
    leereGeplanteRoute()
    return true
}

function kaufeOderWaehleSchiff(rolle: Schiffsrolle): boolean {
    if (!besitztSchiff(rolle) && !istSchiffsrolleFreigeschaltet(rolle)) return false
    if (frachtEinheiten() > frachtKapazitaetFuerRolle(rolle)) return false
    if (!besitztSchiff(rolle)) {
        let kosten = schiffsKaufKosten(rolle)
        if (credits < kosten) return false
        credits -= kosten
        eigeneSchiffeMaske |= 1 << rolle
    }
    return waehleSchiff(rolle)
}

function schiffsAnzeigeName(rolle: Schiffsrolle): string {
    let nummer = schiffsnameNr && schiffsnameNr.length > rolle ? schiffsnameNr[rolle] : rolle
    return SCHIFFSNAMEN[Math.clamp(0, ANZAHL_SCHIFFSNAMEN - 1, nummer)]
}

function wechsleSchiffsName(rolle: Schiffsrolle, aenderung: number): void {
    if (!schiffsnameNr || schiffsnameNr.length != ANZAHL_SCHIFFSROLLEN)
        schiffsnameNr = fuelleZahlenListe(ANZAHL_SCHIFFSROLLEN, 0)
    schiffsnameNr[rolle] = (schiffsnameNr[rolle] + aenderung + ANZAHL_SCHIFFSNAMEN) % ANZAHL_SCHIFFSNAMEN
}

function wechsleSchiffsLack(rolle: Schiffsrolle, aenderung: number): void {
    if (!schiffsLack || schiffsLack.length != ANZAHL_SCHIFFSROLLEN)
        schiffsLack = fuelleZahlenListe(ANZAHL_SCHIFFSROLLEN, 0)
    schiffsLack[rolle] = (schiffsLack[rolle] + aenderung + ANZAHL_LACKE) % ANZAHL_LACKE
}

function schiffsLackName(rolle: Schiffsrolle): string {
    let nummer = schiffsLack && schiffsLack.length > rolle ? schiffsLack[rolle] : 0
    return Texte.t(LACK_NAMEN[Math.clamp(0, ANZAHL_LACKE - 1, nummer)])
}

function rufVonFraktion(fraktion: Fraktion): number {
    if (!fraktionRuf || fraktionRuf.length != ANZAHL_FRAKTIONEN) return 0
    return fraktionRuf[fraktion]
}

function aendereRuf(fraktion: Fraktion, aenderung: number): void {
    if (!fraktionRuf || fraktionRuf.length != ANZAHL_FRAKTIONEN)
        fraktionRuf = fuelleZahlenListe(ANZAHL_FRAKTIONEN, 0)
    fraktionRuf[fraktion] = Math.clamp(-100, 100, fraktionRuf[fraktion] + aenderung)
}

function aendereFraktionsRuf(fraktion: Fraktion, aenderung: number): void {
    aendereRuf(fraktion, aenderung)
}

function staerksteFraktion(): Fraktion {
    let beste = Fraktion.Bund
    for (let i = 1; i < ANZAHL_FRAKTIONEN; i++)
        if (rufVonFraktion(i) > rufVonFraktion(beste)) beste = i
    return beste
}

function waehleEnde(ende: EndeArt): boolean {
    if (!istEndeVerfuegbar(ende)) return false
    endeWahl = ende
    aktualisiereErfolge()
    return true
}

function istEndeVerfuegbar(ende: EndeArt): boolean {
    if (!kampagneFertig()) return false
    if (ende == EndeArt.Bund) return rufVonFraktion(Fraktion.Bund) >= 20 ||
        staerksteFraktion() == Fraktion.Bund
    if (ende == EndeArt.Handelskrone) return rufVonFraktion(Fraktion.Gilde) >= 20 ||
        staerksteFraktion() == Fraktion.Gilde
    if (ende == EndeArt.Entdecker) return rufVonFraktion(Fraktion.Forscher) >= 20 ||
        artefaktAnzahl() >= 2
    if (ende == EndeArt.Freibeuter) return rufVonFraktion(Fraktion.Korsaren) >= 20 ||
        staerksteFraktion() == Fraktion.Korsaren
    return false
}

function istWeltBesucht(welt: number): boolean {
    if (welt < 0 || welt >= ANZAHL_WELTEN) return false
    if (welt < 16) return (besuchteWeltenMaskeNiedrig & (1 << welt)) != 0
    return (besuchteWeltenMaskeHoch & (1 << (welt - 16))) != 0
}

function markiereWeltBesucht(welt: number): void {
    if (welt < 0 || welt >= ANZAHL_WELTEN) return
    if (welt < 16) besuchteWeltenMaskeNiedrig |= 1 << welt
    else besuchteWeltenMaskeHoch |= 1 << (welt - 16)
    if (welt >= ANZAHL_OEFFENTLICHER_WELTEN) geheimeWeltenMaske |= 1 << (welt - ANZAHL_OEFFENTLICHER_WELTEN)
    aktualisiereErfolge()
}

function entdeckeGeheimeWelt(welt: number): boolean {
    if (welt < ANZAHL_OEFFENTLICHER_WELTEN || welt >= ANZAHL_WELTEN) return false
    let vorher = geheimeWeltenMaske
    geheimeWeltenMaske |= 1 << (welt - ANZAHL_OEFFENTLICHER_WELTEN)
    return vorher != geheimeWeltenMaske
}

function istWeltSichtbar(welt: number): boolean {
    if (welt < 0 || welt >= ANZAHL_WELTEN) return false
    if (welt < ANZAHL_OEFFENTLICHER_WELTEN) return true
    return (geheimeWeltenMaske & (1 << (welt - ANZAHL_OEFFENTLICHER_WELTEN))) != 0
}

function artefaktAnzahl(): number {
    let anzahl = 0
    for (let i = 0; i < ANZAHL_ARTEFAKTE; i++) if ((artefaktMaske & (1 << i)) != 0) anzahl++
    return anzahl
}

function hatArtefakt(nummer: number): boolean {
    return nummer >= 0 && nummer < ANZAHL_ARTEFAKTE && (artefaktMaske & (1 << nummer)) != 0
}

function fuegeArtefaktHinzu(nummer: number): boolean {
    if (nummer < 0 || nummer >= ANZAHL_ARTEFAKTE || hatArtefakt(nummer)) return false
    artefaktMaske |= 1 << nummer
    if (artefaktAnzahl() >= 2) entdeckeGeheimeWelt(ANZAHL_OEFFENTLICHER_WELTEN)
    if (artefaktAnzahl() >= ANZAHL_ARTEFAKTE) entdeckeGeheimeWelt(ANZAHL_OEFFENTLICHER_WELTEN + 1)
    aktualisiereErfolge()
    return true
}

function fuegeRaritaetHinzu(nummer: Raritaet, menge: number): boolean {
    if (nummer < 0 || nummer >= ANZAHL_RARITAETEN || menge <= 0 || frachtEinheiten() + menge > frachtKapazitaet())
        return false
    raritaeten[nummer] += menge
    return true
}

function verkaufeRaritaet(nummer: Raritaet, menge: number): number {
    if (nummer < 0 || nummer >= ANZAHL_RARITAETEN || menge <= 0) return 0
    menge = Math.min(menge, raritaeten[nummer])
    let einnahme = raritaetWert(nummer) * menge
    raritaeten[nummer] -= menge
    credits += einnahme
    handelsGewinn = Math.min(SPIELSTAND_MAX_PUNKTE, handelsGewinn + einnahme)
    erfasseHandelsgewinn(einnahme)
    return einnahme
}

function wendeHandelsEinflussAufWeltAn(welt: number, ware: number, vorzeichenMenge: number): void {
    if (welt < 0 || welt >= ANZAHL_WELTEN || ware < 0 ||
        ware >= ANZAHL_WAREN || vorzeichenMenge == 0) return
    let richtung = vorzeichenMenge > 0 ? 1 : -1
    marktEinfluss[welt] = Math.clamp(-20, 20,
        marktEinfluss[welt] + richtung * Math.min(4, Math.abs(vorzeichenMenge)))
}

function wendeHandelsEinflussAn(ware: number, vorzeichenMenge: number): void {
    wendeHandelsEinflussAufWeltAn(aktuelleWelt, ware, vorzeichenMenge)
}

function merkeAktuellenMarkt(): void {
    let beste = besteHandelsWare((aktuelleWelt + 1) % ANZAHL_OEFFENTLICHER_WELTEN)
    let altVerkauf = marktGedaechtnisVerkauf[aktuelleWelt]
    marktGedaechtnisTag[aktuelleWelt] = spieltag
    marktGedaechtnisWare[aktuelleWelt] = beste
    marktGedaechtnisKauf[aktuelleWelt] = kaufPreis(beste)
    marktGedaechtnisVerkauf[aktuelleWelt] = verkaufPreis(beste)
    marktGedaechtnisTrend[aktuelleWelt] = altVerkauf == 0 ? 0
        : Math.clamp(-2, 2, marktGedaechtnisVerkauf[aktuelleWelt] - altVerkauf)
    markiereWeltBesucht(aktuelleWelt)
}

function istMarktBekannt(welt: number): boolean {
    return welt >= 0 && welt < ANZAHL_WELTEN && marktGedaechtnisTag[welt] > 0
}

function marktwissenAlter(welt: number): number { return istMarktBekannt(welt)
    ? Math.max(0, spieltag - marktGedaechtnisTag[welt]) : -1 }
function marktwissenWare(welt: number):
    number { return istMarktBekannt(welt) ? marktGedaechtnisWare[welt] : -1 }
function marktwissenKauf(welt: number):
    number { return istMarktBekannt(welt) ? marktGedaechtnisKauf[welt] : 0 }
function marktwissenVerkauf(welt: number): number { return istMarktBekannt(welt) ? marktGedaechtnisVerkauf[welt] : 0 }
function marktwissenTrend(welt: number):
    number { return istMarktBekannt(welt) ? marktGedaechtnisTrend[welt] : 0 }

function erfasseRettung(): void {
    rettungenGesamt = Math.min(SPIELSTAND_MAX_ZAEHLER, rettungenGesamt + 1)
    aktualisiereErfolge()
}

function erfasseLieferung(): void {
    lieferungenGesamt = Math.min(SPIELSTAND_MAX_ZAEHLER, lieferungenGesamt + 1)
    aktualisiereErfolge()
}

function erfasseSprung(): void {
    spruengeGesamt = Math.min(SPIELSTAND_MAX_ZAEHLER, spruengeGesamt + 1)
    markiereWeltBesucht(aktuelleWelt)
}

function erfasseEreignis(): void {
    erledigteEreignisse = Math.min(SPIELSTAND_MAX_ZAEHLER, erledigteEreignisse + 1)
    aktualisiereErfolge()
}

function erfasseHandelsgewinn(menge: number): void {
    if (menge <= 0) return
    groessterHandelsgewinn = Math.max(groessterHandelsgewinn, menge)
    verdienstGesamt = Math.min(SPIELSTAND_MAX_PUNKTE, verdienstGesamt + menge)
    aktualisiereErfolge()
}

function istErfolgFreigeschaltet(nummer: number): boolean {
    return nummer >= 0 && nummer < ANZAHL_ERFOLGE && (erfolgMaske & (1 << nummer)) != 0
}

function schalteErfolgFrei(nummer: number): boolean {
    if (nummer < 0 || nummer >= ANZAHL_ERFOLGE || istErfolgFreigeschaltet(nummer)) return false
    erfolgMaske |= 1 << nummer
    return true
}

function besuchteWeltenAnzahl(): number {
    let ergebnis = 0
    for (let i = 0; i < ANZAHL_WELTEN; i++) if (istWeltBesucht(i)) ergebnis++
    return ergebnis
}

function aktualisiereErfolge(): void {
    if (spruengeGesamt >= 1) schalteErfolgFrei(0)
    if (handelsGewinn >= 1000) schalteErfolgFrei(1)
    if (siegeGesamt >= 10) schalteErfolgFrei(2)
    if (rettungenGesamt >= 5) schalteErfolgFrei(3)
    if (besuchteWeltenAnzahl() >= ANZAHL_OEFFENTLICHER_WELTEN) schalteErfolgFrei(4)
    if (eigeneSchiffeMaske == 7) schalteErfolgFrei(5)
    if (artefaktAnzahl() >= ANZAHL_ARTEFAKTE) schalteErfolgFrei(6)
    if (schwarzmarktGeschaefte >= 5) schalteErfolgFrei(7)
    if (kampagneFertig()) schalteErfolgFrei(8)
    if (endeWahl != EndeArt.Keine) schalteErfolgFrei(9)
    if (neuesSpielPlusStufe > 0) schalteErfolgFrei(10)
    if (spielPunkte() >= 50000) schalteErfolgFrei(11)
}

function wechsleWaffe(aenderung: number): void {
    aktiveWaffe = (aktiveWaffe + aenderung + ANZAHL_WAFFEN) % ANZAHL_WAFFEN
}

function benutzeRakete(): boolean {
    if (raketen <= 0 || waffenEnergie < 20 || modulSchaden[Schiffsmodul.Waffen] >= 3) return false
    raketen--
    waffenEnergie -= 20
    return true
}

function benutzeMine(): boolean {
    if (minen <= 0 || waffenEnergie < 12 || modulSchaden[Schiffsmodul.Waffen] >= 3) return false
    minen--
    waffenEnergie -= 12
    return true
}

function stelleWaffenEnergieHer(menge: number): void {
    if (menge > 0) waffenEnergie = Math.min(100, waffenEnergie + menge)
}

function energieModusName(): string {
    if (energieModus == 1) return Texte.t(160)
    if (energieModus == 2) return Texte.t(117)
    if (energieModus == 3) return Texte.t(115)
    return Texte.t(228)
}

function wechsleEnergieModus(aenderung: number): void {
    energieModus = (energieModus + aenderung + 4) % 4
}

function beschaedigeModul(modul: Schiffsmodul, menge: number): void {
    if (modul < 0 || modul >= ANZAHL_MODULE || menge <= 0) return
    modulSchaden[modul] = Math.clamp(0, 3, modulSchaden[modul] + menge)
    treibstoff = Math.min(treibstoff, maxTreibstoff())
}

function repariereModule(): void {
    for (let i = 0; i < ANZAHL_MODULE; i++) modulSchaden[i] = 0
}

function modulSchadenName(modul: Schiffsmodul): string {
    let stufe = modulSchaden[modul]
    if (stufe >= 3) return Texte.t(229)
    if (stufe == 2) return Texte.t(230)
    if (stufe == 1) return Texte.t(231)
    return Texte.t(232)
}

function leereGeplanteRoute(): void {
    geplanteRoute = []
    geplanteRouteTreibstoff = 0
}

function planeRouteNach(ziel: number): boolean {
    leereGeplanteRoute()
    if (ziel < 0 || ziel >= ANZAHL_WELTEN || !istWeltSichtbar(ziel)) return false
    if (ziel == aktuelleWelt) {
        geplanteRoute.push(aktuelleWelt)
        return true
    }
    let vorherige = fuelleZahlenListe(ANZAHL_WELTEN, -2)
    let schlange: number[] = []
    schlange.push(aktuelleWelt)
    vorherige[aktuelleWelt] = -1
    let leseStelle = 0
    while (leseStelle < schlange.length && vorherige[ziel] == -2) {
        let von = schlange[leseStelle++]
        for (let nach = 0; nach < ANZAHL_WELTEN; nach++) {
            if (!istWeltSichtbar(nach) || vorherige[nach] != -2 || nach == von) continue
            let kosten = sprungKosten(von, nach)
            if (kosten > maxSprungKosten()) continue
            if (von == aktuelleWelt && kosten > treibstoff) continue
            vorherige[nach] = von
            schlange.push(nach)
            if (nach == ziel) break
        }
    }
    if (vorherige[ziel] == -2) return false
    let umgekehrt: number[] = []
    let welt = ziel
    while (welt >= 0) {
        umgekehrt.push(welt)
        welt = vorherige[welt]
    }
    for (let i = umgekehrt.length - 1; i >= 0; i--) geplanteRoute.push(umgekehrt[i])
    for (let i = 1; i < geplanteRoute.length; i++)
        geplanteRouteTreibstoff += sprungKosten(geplanteRoute[i - 1], geplanteRoute[i])
    return true
}

function routeSprungAnzahl(): number { return Math.max(0, geplanteRoute.length - 1) }
function routeTreibstoffKosten(): number { return geplanteRouteTreibstoff }
function routenWeltAnStelle(stelle: number): number { return stelle >= 0 &&
    stelle < geplanteRoute.length ? geplanteRoute[stelle] : -1 }

function wechsleTextTempo(aenderung: number): void { textTempo = (textTempo + aenderung + 3) % 3 }
function textTempoName(): string { return textTempo == 0 ? Texte.t(233)
    : (textTempo == 2 ? Texte.t(234) : Texte.t(235)) }
function schalteKontrast(): void { hoherKontrast = hoherKontrast == 0 ? 1 : 0 }
function schalteKameraWackeln(): void { kameraWackeln = kameraWackeln == 0 ? 1 : 0 }
function schalteEntwicklerModus(): void { entwicklerModus = entwicklerModus == 0 ? 1 : 0 }

function tutorialStufeName(): string {
    if (tutorialStufe == 1) return Texte.t(236)
    if (tutorialStufe == 2) return Texte.t(237)
    if (tutorialStufe == 3) return Texte.t(238)
    if (tutorialStufe >= 4) return Texte.t(239)
    return Texte.t(240)
}

function spielModusName(modus: SpielModus): string {
    if (modus == SpielModus.Veteran) return Texte.t(241)
    if (modus == SpielModus.Eisern) return Texte.t(242)
    return Texte.t(212)
}

function aktuellerRang(): number {
    let punkte = handelsGewinn + erfuellteMissionen * 100 + siegeGesamt * 25
    if (punkte >= 30000) return 5
    if (punkte >= 12000) return 4
    if (punkte >= 5000) return 3
    if (punkte >= 2000) return 2
    if (punkte >= 600) return 1
    return 0
}

function rangName(): string {
    return Texte.t(RANG_NAMEN[aktuellerRang()])
}

function spielPunkte(): number {
    return handelsGewinn + erfuellteMissionen * 100 + siegeGesamt * 25
}

function neuesSpiel(): void {
    credits = 500
    aktuelleWelt = STARTWELT
    zielWelt = STARTWELT
    spieltag = 1
    handelsGewinn = 0
    siegeGesamt = 0
    erfuellteMissionen = 0
    gescheiterteMissionen = 0
    tutorialStufe = 1
    kampagnenStufe = 0
    galaxieStartwert = 1 + festerZufall(game.runtime(), spielstandFolge + 1, 2026) % 32748
    marktEreignisArt = MarktEreignisArt.Keine
    marktEreignisWelt = STARTWELT
    marktEreignisWare = 0
    marktEreignisEnde = 0
    schiffsrolle = Schiffsrolle.Kaufmann
    spielModus = SpielModus.Standard
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
    eigeneSchiffeMaske = 1 << Schiffsrolle.Kaufmann
    schiffsnameNr = [0, 1, 2]
    schiffsLack = fuelleZahlenListe(ANZAHL_SCHIFFSROLLEN, 0)
    erfolgMaske = 0
    besuchteWeltenMaskeNiedrig = 1 << STARTWELT
    besuchteWeltenMaskeHoch = 0
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
    fracht = fuelleZahlenListe(ANZAHL_WAREN, 0)
    frachtKosten = fuelleZahlenListe(ANZAHL_WAREN, 0)
    ausbauten = fuelleZahlenListe(ANZAHL_AUSBAUTEN, 0)
    marktVorrat = fuelleZahlenListe(ANZAHL_WAREN, 0)
    treibstoff = maxTreibstoff()
    rumpf = maxRumpf()
    leereMission()
    inFlug = 0
    flugStart = STARTWELT
    flugZiel = STARTWELT
    flugStartwert = 0
    erneuereMarkt()
    merkeAktuellenMarkt()
    leereGeplanteRoute()
    if (!neuesSpielSpaeterSpeichern) {
        schreibeSpielstand()
        hatSpielstand = true
    }
}

function kannNeuesSpielPlusStarten(): boolean {
    return kampagneFertig() && endeWahl != EndeArt.Keine && neuesSpielPlusStufe < 9
}

function starteNeuesSpielPlus(): boolean {
    if (!kannNeuesSpielPlusStarten()) return false
    let altStufe = neuesSpielPlusStufe
    let altBesitz = eigeneSchiffeMaske
    let altNamen = schiffsnameNr
    let altLack = schiffsLack
    let altErfolge = erfolgMaske
    let altArtefakte = artefaktMaske
    let altGeheimnisse = geheimeWeltenMaske
    let altStatistik =
        [spruengeGesamt, rettungenGesamt, lieferungenGesamt, verdienstGesamt, groessterHandelsgewinn,
        bossSiege, schwarzmarktGeschaefte, erledigteEreignisse]
    let altModus = spielModus
    neuesSpielSpaeterSpeichern = true
    neuesSpiel()
    neuesSpielSpaeterSpeichern = false
    neuesSpielPlusStufe = Math.min(9, altStufe + 1)
    eigeneSchiffeMaske = altBesitz
    schiffsnameNr = altNamen
    schiffsLack = altLack
    erfolgMaske = altErfolge
    artefaktMaske = altArtefakte
    geheimeWeltenMaske = altGeheimnisse
    spruengeGesamt = altStatistik[0]
    rettungenGesamt = altStatistik[1]
    lieferungenGesamt = altStatistik[2]
    verdienstGesamt = altStatistik[3]
    groessterHandelsgewinn = altStatistik[4]
    bossSiege = altStatistik[5]
    schwarzmarktGeschaefte = altStatistik[6]
    erledigteEreignisse = altStatistik[7]
    spielModus = altModus
    tutorialStufe = 4
    credits = 1000 + neuesSpielPlusStufe * 500
    for (let i = 0; i < ANZAHL_AUSBAUTEN; i++) if (AUSBAU_MAX[i] > 0) ausbauten[i] = 1
    treibstoff = maxTreibstoff()
    rumpf = maxRumpf()
    aktualisiereErfolge()
    schreibeSpielstand()
    return true
}

function leereMission(): void {
    missionsArt = MissionsArt.Keine
    missionsAnnahmeWelt = 0
    missionsZiel = 0
    missionsFrist = 0
    missionsLohn = 0
    missionsWare = 0
    missionsMenge = 0
    missionsFortschritt = 0
    missionsStartwert = 0
    missionsVariante = MissionsVariante.Standard
    missionsHerkunft = 0
}

function setzeSzene(naechste: Szene): void {
    aktiveSzene = naechste
    menueStelle = 0
    ersteSichtbareZeile = 0
    handelOffen = false
    handelsMenge = 0
    bestaetigungOffen = false
    eingabeGesperrt = true
}

function zeigeMeldung(zeile1: string, zeile2: string, zeile3: string, zurueckNach: Szene): void {
    meldungZeile1 = zeile1
    meldungZeile2 = zeile2
    meldungZeile3 = zeile3
    rueckkehrSzene = zurueckNach
    setzeSzene(Szene.Meldung)
}

function alleTastenLosgelassen(): boolean {
    return !controller.up.isPressed()
        && !controller.down.isPressed()
        && !controller.left.isPressed()
        && !controller.right.isPressed()
        && !controller.A.isPressed()
        && !controller.B.isPressed()
}
