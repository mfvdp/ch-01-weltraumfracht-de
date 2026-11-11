// Die festen Daten des Spiels: Welten, Waren, Schiffe, Aufträge und die Kampagne.
const ANZAHL_OEFFENTLICHER_WELTEN = 24
const ANZAHL_WELTEN = 26
const ANZAHL_WAREN = 12
const ANZAHL_AUSBAUTEN = 10
const ANZAHL_FRAKTIONEN = 4
const ANZAHL_RARITAETEN = 3
const ANZAHL_ARTEFAKTE = 4
const ANZAHL_SCHIFFSROLLEN = 3
const ANZAHL_MODULE = 4
const ANZAHL_WAFFEN = 3
const ANZAHL_ERFOLGE = 12
const ANZAHL_LACKE = 6
const ANZAHL_SCHIFFSNAMEN = 8
const STARTWELT = 0
const ANZAHL_MISSIONSANGEBOTE = 5
const ANZAHL_KAMPAGNENMISSIONEN = 6

const AUSBAU_FRACHT = 0
const AUSBAU_SCHILD = 1
const AUSBAU_PANZER = 2
const AUSBAU_LASER = 3
const AUSBAU_KUEHLER = 4
const AUSBAU_BOOSTER = 5
const AUSBAU_SCANNER = 6
const AUSBAU_SPRUNG = 7
const AUSBAU_REPARATUR = 8
const AUSBAU_VERSICHERUNG = 9

const WELT_NAMEN = [
    "LUMA", "VEXO", "NORI", "KAVO", "PIXA", "ZUNO",
    "MIRO", "TAVI", "REKO", "SOLA", "BIRI", "YUNO",
    "DOVA", "FENO", "RUNA", "KIRI", "JEXA", "WELA",
    "AURI", "MEKI", "ONDA", "QUBI", "ZERA", "TALO",
    "NEXUS-9", "EDEN-X"
]
const WELT_X = hex`0c2743607d9614304b6784970925405e7995122f4c6884995391`
const WELT_Y = hex`100b140d120a2b2531272f2648414d444f43655e695e675c3971`
const WELT_WIRTSCHAFT = hex`0001050203040400020501030104000305020502030004010300`
const WELT_GEFAHR = hex`0001000201030100010002020102010203020001030102030301`
const WELT_FRAKTION = hex`0001010002000001010201020301000203020101000103000202`
const WIRTSCHAFT_NAMEN = hex`1a1b1c1d1e1f`
const GEFAHR_NAMEN = hex`20212223`

// Jede Welt hat ein kleines Merkmal. Die Zu- und Abschläge sind absichtlich klein, damit die Wirtschaftsart und die
// Entscheidungen der Spielerin oder des Spielers wichtiger bleiben als das Merkmal.
const WELT_MERKMAL_NAMEN = hex`2425262728292a2b2c2d2e2f303132333435363738393a3b3c3d`
const WELT_MERKMAL_INFOS = hex`3e3f404142434445464748494a4b4c4d4e4f5051525354555657`
const WELT_MERKMAL_PREIS_PROZENT = hex`fefffdff00000400030005000200fcffffff0200fdff03000600fdfffcff0300070003000600feff07000100080005000a00faff`
const WELT_MERKMAL_WERFT_PROZENT = hex`f8ff0200f6ff08000000040003000000fcff02000500fbff0a00feff0100fdff0c0008000500faff0900feff0f0004001400f6ff`
const WELT_MERKMAL_GEFAHR = hex`0000000000000100000001000000ffff0000ffff0000010001000000ffff000001000100ffff000001000000010001000100ffff`

const FRAKTION_NAMEN = hex`58595a5b`
const RARITAET_NAMEN = hex`5c5d5e`
const RARITAET_WERTE = hex`8a0284037805`
const ARTEFAKT_NAMEN = hex`5f606162`
const SCHIFFSNAMEN = ["NOMAD", "KESTREL", "RAPTOR", "AURORA", "MERCURY", "NOVA", "PHOENIX", "ORBITER"]
const LACK_NAMEN = hex`6b6c6d6e6f70`
const WAFFEN_NAMEN = hex`71721b`
const MODUL_NAMEN = hex`73747576`
const ENDE_NAMEN = hex`775878797a`
const ERFOLG_NAMEN = hex`7b7c7d7e7f80818283848586`
const ERFOLG_INFOS = hex`8788898a8b8c8d8e8f909192`

const WARE_NAMEN = hex`939495969798999a9b9c9d9e`
const WARE_GRUNDPREIS = hex`0a0e08162d1e1a3040527396`
// Bit n bedeutet: Die Wirtschaft mit der Nummer n erzeugt diese Ware oder braucht sie.
const WARE_ERZEUGER_MASKE = hex`010111020210050408080c20`
const WARE_BEDARF_MASKE = hex`2a2406142807221b23341309`

const AUSBAU_NAMEN = hex`9fa0a171a2a374a4a5a6`
const AUSBAU_MAX = hex`03030303020202030102`
const AUSBAU_PREIS_1 = hex`5e01f401c20126025e01c2012c015802dc058a02`
const AUSBAU_PREIS_2 = hex`52031405b004aa05e80314058403dc050000a406`
const AUSBAU_PREIS_3 = hex`0807540b8c0a800c000000000000800c00000000`

const RANG_NAMEN = hex`a7a8a9aaabac`

// Die Kampagne baut das Handelsnetz wieder auf, von dem der Prolog erzählt.
const KAMPAGNE_TITEL = hex`adaeaf5db0b1`
const KAMPAGNE_EINWEISUNGEN = hex`b2b3b4b5b6b7`
const KAMPAGNE_NOETIGER_RANG = hex`000102030405`
const KAMPAGNE_ZIEL = hex`010710141617`
const KAMPAGNE_ART = [MissionsArt.Lieferung, MissionsArt.Rettung, MissionsArt.Jagd, MissionsArt.Lieferung,
    MissionsArt.Rettung, MissionsArt.Jagd]
const KAMPAGNE_WARE = hex`080800090800`
const KAMPAGNE_VARIANTE = [MissionsVariante.Standard, MissionsVariante.UnterFeuer, MissionsVariante.Ass,
    MissionsVariante.Zerbrechlich, MissionsVariante.UnterFeuer, MissionsVariante.Ass]
const KAMPAGNE_MENGE = hex`020102020104`
const KAMPAGNE_LOHN = hex`a401bc024c040807f00a8813`

function wirtschaftErzeugt(ware: number, wirtschaft: number): boolean {
    return (WARE_ERZEUGER_MASKE[ware] & (1 << wirtschaft)) != 0
}

function wirtschaftBraucht(ware: number, wirtschaft: number): boolean {
    return (WARE_BEDARF_MASKE[ware] & (1 << wirtschaft)) != 0
}

function festerZufall(a: number, b: number, c: number): number {
    let wert = (a * 109 + b * 47 + c * 23 + 97) % 32749
    wert = (wert * 73 + 41) % 32749
    return wert
}

function galaxieZufall(a: number, b: number, c: number): number {
    return festerZufall(a + galaxieStartwert, b + galaxieStartwert % 97, c + galaxieStartwert % 31)
}

function fraktionName(fraktion: Fraktion): string {
    return Texte.t(FRAKTION_NAMEN[Math.clamp(0, ANZAHL_FRAKTIONEN - 1, fraktion)])
}

function weltFraktion(welt: number): Fraktion {
    return WELT_FRAKTION[Math.clamp(0, ANZAHL_WELTEN - 1, welt)]
}

function raritaetName(nummer: Raritaet): string {
    return Texte.t(RARITAET_NAMEN[Math.clamp(0, ANZAHL_RARITAETEN - 1, nummer)])
}

function raritaetWert(nummer: Raritaet): number {
    let grund = tabelleI16(RARITAET_WERTE, Math.clamp(0, ANZAHL_RARITAETEN - 1, nummer))
    return Math.max(1, Math.idiv(grund * (100 + wirksameWeltGefahr(aktuelleWelt) * 5) + 50, 100))
}

function artefaktName(nummer: number): string {
    return Texte.t(ARTEFAKT_NAMEN[Math.clamp(0, ANZAHL_ARTEFAKTE - 1, nummer)])
}

function waffenName(art: WaffenArt): string {
    return Texte.t(WAFFEN_NAMEN[Math.clamp(0, ANZAHL_WAFFEN - 1, art)])
}

function endeName(ende: EndeArt): string {
    return Texte.t(ENDE_NAMEN[Math.clamp(0, ENDE_NAMEN.length - 1, ende)])
}

function erfolgName(nummer: number): string {
    return Texte.t(ERFOLG_NAMEN[Math.clamp(0, ANZAHL_ERFOLGE - 1, nummer)])
}

function erfolgInfo(nummer: number): string {
    return Texte.t(ERFOLG_INFOS[Math.clamp(0, ANZAHL_ERFOLGE - 1, nummer)])
}

function weltMerkmalName(welt: number): string {
    return Texte.t(WELT_MERKMAL_NAMEN[Math.clamp(0, ANZAHL_WELTEN - 1, welt)])
}

function weltMerkmalInfo(welt: number): string {
    return Texte.t(WELT_MERKMAL_INFOS[Math.clamp(0, ANZAHL_WELTEN - 1, welt)])
}

function weltMerkmalPreisProzent(welt: number): number {
    return tabelleI16(WELT_MERKMAL_PREIS_PROZENT, Math.clamp(0, ANZAHL_WELTEN - 1, welt))
}

function weltMerkmalWerftProzent(welt: number): number {
    return tabelleI16(WELT_MERKMAL_WERFT_PROZENT, Math.clamp(0, ANZAHL_WELTEN - 1, welt))
}

function weltMerkmalGefahrAenderung(welt: number): number {
    return tabelleI16(WELT_MERKMAL_GEFAHR, Math.clamp(0, ANZAHL_WELTEN - 1, welt))
}

function wirksameWeltGefahr(welt: number): number {
    let gefahr = WELT_GEFAHR[welt] + weltMerkmalGefahrAenderung(welt)
    if (marktEreignisAktivIn(welt) && marktEreignisArt == MarktEreignisArt.Blockade) gefahr++
    return Math.clamp(0, 3, gefahr)
}

function werftPreisIn(welt: number, grundPreis: number): number {
    if (grundPreis <= 0) return 0
    return Math.max(1, Math.idiv(grundPreis * (100 + weltMerkmalWerftProzent(welt)) + 50, 100))
}

function werftPreis(grundPreis: number): number {
    return werftPreisIn(aktuelleWelt, grundPreis)
}

function aktualisiereMarktEreignis(): void {
    if (marktEreignisArt != MarktEreignisArt.Keine && spieltag <= marktEreignisEnde) return
    let zyklus = spieltag + Math.idiv(galaxieStartwert, 37)
    marktEreignisArt = 1 + galaxieZufall(zyklus, spielstandFolge + 17, 41) % 4
    marktEreignisWelt = galaxieZufall(zyklus, marktEreignisArt, 53) % ANZAHL_OEFFENTLICHER_WELTEN
    marktEreignisWare = galaxieZufall(zyklus, marktEreignisWelt, 67) % ANZAHL_WAREN
    marktEreignisEnde = spieltag + 2 + galaxieZufall(zyklus, marktEreignisWare, 71) % 3
}

function marktEreignisAktivIn(welt: number): boolean {
    return marktEreignisArt != MarktEreignisArt.Keine &&
        spieltag <= marktEreignisEnde && marktEreignisWelt == welt
}

function marktEreignisPreisProzent(welt: number, ware: number): number {
    if (!marktEreignisAktivIn(welt)) return 0
    if (marktEreignisArt == MarktEreignisArt.Knappheit) return ware == marktEreignisWare ? 42 : 6
    if (marktEreignisArt == MarktEreignisArt.Ueberschuss)
        return ware == marktEreignisWare ? -36 : -4
    if (marktEreignisArt == MarktEreignisArt.Blockade) return ware == marktEreignisWare ? 30 : 18
    if (marktEreignisArt == MarktEreignisArt.Boom) return ware == marktEreignisWare ? 24 : 10
    return 0
}

function marktEreignisName(): string {
    if (marktEreignisArt == MarktEreignisArt.Knappheit) return Texte.t(184)
    if (marktEreignisArt == MarktEreignisArt.Ueberschuss) return Texte.t(185)
    if (marktEreignisArt == MarktEreignisArt.Blockade) return Texte.t(186)
    if (marktEreignisArt == MarktEreignisArt.Boom) return Texte.t(187)
    return Texte.t(32)
}

function marktEreignisInfo(): string {
    if (marktEreignisArt == MarktEreignisArt.Keine || spieltag > marktEreignisEnde) return Texte.t(188)
    let ware = Texte.t(WARE_NAMEN[marktEreignisWare])
    let welt = WELT_NAMEN[marktEreignisWelt]
    if (marktEreignisArt == MarktEreignisArt.Knappheit) return ware + Texte.t(189) + welt
    if (marktEreignisArt == MarktEreignisArt.Ueberschuss) return ware + Texte.t(190) + welt
    if (marktEreignisArt == MarktEreignisArt.Blockade) return Texte.t(191) + welt
    return Texte.t(192) + welt
}

function marktEreignisMissionsLohnProzent(welt: number, art: MissionsArt, ware: number): number {
    if (!marktEreignisAktivIn(welt)) return 0
    if (marktEreignisArt == MarktEreignisArt.Blockade) return 35
    if (marktEreignisArt == MarktEreignisArt.Knappheit && art == MissionsArt.Lieferung &&
        ware == marktEreignisWare) return 45
    if (marktEreignisArt == MarktEreignisArt.Boom) return 20
    if (marktEreignisArt == MarktEreignisArt.Ueberschuss && art == MissionsArt.Jagd) return 10
    return 5
}

function weltEntfernung(von: number, nach: number): number {
    let dx = WELT_X[von] - WELT_X[nach]
    let dy = WELT_Y[von] - WELT_Y[nach]
    return Math.round(Math.sqrt(dx * dx + dy * dy))
}

function sprungKosten(von: number, nach: number): number {
    if (von == nach) return 0
    return Math.max(1, Math.idiv(weltEntfernung(von, nach) + 17, 18))
}

function istWeltErreichbar(welt: number): boolean {
    if (!istWeltSichtbar(welt)) return false
    let kosten = sprungKosten(aktuelleWelt, welt)
    return welt != aktuelleWelt && kosten <= maxSprungKosten() && kosten <= treibstoff
}

function weltPreis(welt: number, ware: number): number {
    let wirtschaft = WELT_WIRTSCHAFT[welt]
    let profil = 0
    if (wirtschaftErzeugt(ware, wirtschaft)) profil = -28
    else if (wirtschaftBraucht(ware, wirtschaft)) profil = 24
    let rauschen = galaxieZufall(welt, ware, spieltag) % 17 - 8
    let prozent = 100 + profil + rauschen + wirksameWeltGefahr(welt) * 3
    prozent += weltMerkmalPreisProzent(welt) + marktEreignisPreisProzent(welt, ware)
    if (marktEinfluss && marktEinfluss.length == ANZAHL_WELTEN) prozent += marktEinfluss[welt]
    return Math.max(2, Math.idiv(WARE_GRUNDPREIS[ware] * prozent + 50, 100))
}

function kaufPreis(ware: number): number {
    let prozent = 105 - Math.idiv(rufVonFraktion(weltFraktion(aktuelleWelt)), 20)
    return Math.max(1, Math.idiv(weltPreis(aktuelleWelt, ware) * prozent + 99, 100))
}

function verkaufPreis(ware: number): number {
    let prozent = 95 + Math.idiv(rufVonFraktion(weltFraktion(aktuelleWelt)), 25)
    return Math.max(1, Math.idiv(weltPreis(aktuelleWelt, ware) * prozent, 100))
}

function preisIn(welt: number, ware: number, istKauf: boolean): number {
    let ortsPreis = weltPreis(welt, ware)
    let ruf = rufVonFraktion(weltFraktion(welt))
    if (istKauf) return Math.max(1, Math.idiv(ortsPreis * (105 - Math.idiv(ruf, 20)) + 99, 100))
    return Math.max(1, Math.idiv(ortsPreis * (95 + Math.idiv(ruf, 25)), 100))
}

function erneuereMarkt(): void {
    aktualisiereMarktEreignis()
    if (!marktVorrat || marktVorrat.length != ANZAHL_WAREN)
        marktVorrat = fuelleZahlenListe(ANZAHL_WAREN, 0)
    let wirtschaft = WELT_WIRTSCHAFT[aktuelleWelt]
    for (let ware = 0; ware < ANZAHL_WAREN; ware++) {
        let startwert = galaxieZufall(aktuelleWelt, ware, spieltag)
        if (wirtschaftErzeugt(ware, wirtschaft)) marktVorrat[ware] = 7 + startwert % 7
        else if (wirtschaftBraucht(ware, wirtschaft)) marktVorrat[ware] = 1 + startwert % 3
        else marktVorrat[ware] = 4 + startwert % 5
        if (marktEinfluss && marktEinfluss.length == ANZAHL_WELTEN) {
            marktVorrat[ware] = Math.clamp(0, 99,
                marktVorrat[ware] - Math.idiv(marktEinfluss[aktuelleWelt], 4))
        }
        if (marktEreignisAktivIn(aktuelleWelt)) {
            if (marktEreignisArt == MarktEreignisArt.Knappheit && ware == marktEreignisWare)
                marktVorrat[ware] = Math.max(0, Math.idiv(marktVorrat[ware], 3))
            else if (marktEreignisArt == MarktEreignisArt.Ueberschuss && ware == marktEreignisWare)
                marktVorrat[ware] = Math.min(99, marktVorrat[ware] + 9)
            else if (marktEreignisArt == MarktEreignisArt.Blockade)
                marktVorrat[ware] = Math.max(0, Math.idiv(marktVorrat[ware] + 1, 2))
            else if (marktEreignisArt == MarktEreignisArt.Boom && ware == marktEreignisWare)
                marktVorrat[ware] = Math.max(0, marktVorrat[ware] - 2)
        }
    }
}

function besteHandelsWare(ziel: number): number {
    let besteWare = 0
    let besteSpanne = -9999
    for (let ware = 0; ware < ANZAHL_WAREN; ware++) {
        let spanne = preisIn(ziel, ware, false) - kaufPreis(ware)
        if (spanne > besteSpanne) {
            besteSpanne = spanne
            besteWare = ware
        }
    }
    return besteWare
}

function ausbauPreis(nummer: number, naechsteStufe: number): number {
    if (naechsteStufe == 1) return werftPreis(tabelleI16(AUSBAU_PREIS_1, nummer))
    if (naechsteStufe == 2) return werftPreis(tabelleI16(AUSBAU_PREIS_2, nummer))
    if (naechsteStufe == 3) return werftPreis(tabelleI16(AUSBAU_PREIS_3, nummer))
    return 0
}

function kampagneNoetigerRang(stufe: number): number {
    if (stufe < 0 || stufe >= ANZAHL_KAMPAGNENMISSIONEN) return 5
    return KAMPAGNE_NOETIGER_RANG[stufe]
}

function kampagneTitel(stufe: number): string {
    if (stufe < 0 || stufe >= ANZAHL_KAMPAGNENMISSIONEN) return Texte.t(88)
    return Texte.t(KAMPAGNE_TITEL[stufe])
}

function kampagneEinweisung(stufe: number): string {
    if (stufe < 0 || stufe >= ANZAHL_KAMPAGNENMISSIONEN) return Texte.t(205)
    return Texte.t(KAMPAGNE_EINWEISUNGEN[stufe])
}

function kampagneMissionsArt(stufe: number): MissionsArt {
    return KAMPAGNE_ART[Math.clamp(0, ANZAHL_KAMPAGNENMISSIONEN - 1, stufe)]
}

function kampagneMissionsZiel(stufe: number): number {
    return KAMPAGNE_ZIEL[Math.clamp(0, ANZAHL_KAMPAGNENMISSIONEN - 1, stufe)]
}

function kampagneMissionsWare(stufe: number): number {
    return KAMPAGNE_WARE[Math.clamp(0, ANZAHL_KAMPAGNENMISSIONEN - 1, stufe)]
}

function kampagneMissionsVariante(stufe: number): MissionsVariante {
    return KAMPAGNE_VARIANTE[Math.clamp(0, ANZAHL_KAMPAGNENMISSIONEN - 1, stufe)]
}

function kampagneMissionsMenge(stufe: number): number {
    return KAMPAGNE_MENGE[Math.clamp(0, ANZAHL_KAMPAGNENMISSIONEN - 1, stufe)]
}

function kampagneMissionsLohn(stufe: number): number {
    return tabelleI16(KAMPAGNE_LOHN, Math.clamp(0, ANZAHL_KAMPAGNENMISSIONEN - 1, stufe))
}

function kampagneMissionVerfuegbar(): boolean {
    if (tutorialStufe < 4 || kampagnenStufe < 0 || kampagnenStufe >= ANZAHL_KAMPAGNENMISSIONEN) return false
    if (missionsArt != MissionsArt.Keine || aktuellerRang() < kampagneNoetigerRang(kampagnenStufe)) return false
    return aktuelleWelt != kampagneMissionsZiel(kampagnenStufe)
}

function kampagneFertig(): boolean {
    return kampagnenStufe >= ANZAHL_KAMPAGNENMISSIONEN
}

function rueckeKampagneVor(): void {
    kampagnenStufe = Math.min(ANZAHL_KAMPAGNENMISSIONEN, kampagnenStufe + 1)
}

function tagesSpezialVerfuegbar(): boolean {
    return hatSpielstand && tutorialStufe >= 4 && missionsArt == MissionsArt.Keine && tagesMissionsTag != spieltag
}

function tagesMissionsStartwert(): number {
    return galaxieZufall(spieltag, neuesSpielPlusStufe + 211, 907)
}

function tagesMissionsArt(): MissionsArt {
    return 1 + tagesMissionsStartwert() % 3
}

function tagesMissionsZiel(): number {
    let ziel = tagesMissionsStartwert() % ANZAHL_OEFFENTLICHER_WELTEN
    if (ziel == aktuelleWelt) ziel = (ziel + 7) % ANZAHL_OEFFENTLICHER_WELTEN
    return ziel
}

function tagesMissionsWare(): number {
    return missionsWareFuerZiel(tagesMissionsZiel(), tagesMissionsStartwert())
}

function tagesMissionsMenge(): number {
    if (tagesMissionsArt() == MissionsArt.Rettung) return 1
    return 2 + tagesMissionsStartwert() % 4
}

function tagesMissionsLohn(): number {
    let entfernung = weltEntfernung(aktuelleWelt, tagesMissionsZiel())
    return 400 + entfernung * 5 + tagesMissionsMenge() * 90 + neuesSpielPlusStufe * 100
}

function tagesMissionsFrist(): number {
    return spieltag + Math.max(2, Math.idiv(weltEntfernung(aktuelleWelt, tagesMissionsZiel()) + 25, 26) + 2)
}

function markiereTagesMissionsAngenommen(): void {
    tagesMissionsTag = spieltag
    tagesMissionsErledigt = 0
}

function schliesseTagesMissionAb(): void {
    tagesMissionsErledigt = 1
    aendereRuf(weltFraktion(missionsZiel), 3)
}

function missionsAngebotHerkunft(angebotNr: number): number {
    if (angebotNr == ANZAHL_MISSIONSANGEBOTE - 1 && tagesSpezialVerfuegbar()) return 3
    if (angebotNr != 0) return 0
    if (tutorialStufe == 1 && aktuelleWelt == STARTWELT) return 2
    if (kampagneMissionVerfuegbar()) return 1
    return 0
}

function missionsAngebotStartwert(angebotNr: number): number {
    return galaxieZufall(aktuelleWelt + angebotNr * 7, spieltag + angebotNr * 13, angebotNr + 101)
}

function missionsAngebotZiel(angebotNr: number): number {
    let herkunft = missionsAngebotHerkunft(angebotNr)
    if (herkunft == 2) return 1 // Trainingsroute LUMA -> VEXO.
    if (herkunft == 1) return kampagneMissionsZiel(kampagnenStufe)
    if (herkunft == 3) return tagesMissionsZiel()

    let ziel = missionsAngebotStartwert(angebotNr) % ANZAHL_OEFFENTLICHER_WELTEN
    let erlaubteGefahr = Math.min(3, 1 + Math.idiv(aktuellerRang(), 2))
    for (let i = 0; i < ANZAHL_OEFFENTLICHER_WELTEN; i++) {
        let kandidat = (ziel + i * 5 + 1) % ANZAHL_OEFFENTLICHER_WELTEN
        if (kandidat != aktuelleWelt && wirksameWeltGefahr(kandidat) <= erlaubteGefahr) return kandidat
    }
    return (aktuelleWelt + 1) % ANZAHL_OEFFENTLICHER_WELTEN
}

function missionsAngebotArt(angebotNr: number): MissionsArt {
    let herkunft = missionsAngebotHerkunft(angebotNr)
    if (herkunft == 2) return MissionsArt.Lieferung
    if (herkunft == 1) return kampagneMissionsArt(kampagnenStufe)
    if (herkunft == 3) return tagesMissionsArt()
    return 1 + (missionsAngebotStartwert(angebotNr) + angebotNr * 2) % 3
}

function missionsWareFuerZiel(ziel: number, startwert: number): number {
    let anfang = startwert % ANZAHL_WAREN
    let wirtschaft = WELT_WIRTSCHAFT[ziel]
    for (let i = 0; i < ANZAHL_WAREN; i++) {
        let ware = (anfang + i * 5) % ANZAHL_WAREN
        if (wirtschaftBraucht(ware, wirtschaft) &&
            !wirtschaftErzeugt(ware, WELT_WIRTSCHAFT[aktuelleWelt])) return ware
    }
    return besteHandelsWare(ziel)
}

function missionsAngebotWare(angebotNr: number): number {
    let herkunft = missionsAngebotHerkunft(angebotNr)
    if (herkunft == 2) return 2
    if (herkunft == 1) return kampagneMissionsWare(kampagnenStufe)
    if (herkunft == 3) return tagesMissionsWare()
    let art = missionsAngebotArt(angebotNr)
    if (art == MissionsArt.Lieferung)
        return missionsWareFuerZiel(missionsAngebotZiel(angebotNr), missionsAngebotStartwert(angebotNr))
    if (art == MissionsArt.Rettung) return 8
    return 0
}

function missionsAngebotVariante(angebotNr: number): MissionsVariante {
    let herkunft = missionsAngebotHerkunft(angebotNr)
    if (herkunft == 2) return MissionsVariante.Standard
    if (herkunft == 1) return kampagneMissionsVariante(kampagnenStufe)
    if (herkunft == 3) return MissionsVariante.Express
    let art = missionsAngebotArt(angebotNr)
    let zahl = galaxieZufall(missionsAngebotStartwert(angebotNr), aktuellerRang(), 149) % 4
    if (art == MissionsArt.Lieferung) {
        if (zahl == 1) return MissionsVariante.Zerbrechlich
        if (zahl == 2) return MissionsVariante.Express
        if (zahl == 3 && aktuellerRang() >= 2) return MissionsVariante.Illegal
    } else if (art == MissionsArt.Jagd) {
        if (zahl == 1 && aktuellerRang() >= 2) return MissionsVariante.Ass
        if (zahl >= 2) return MissionsVariante.UnterFeuer
    } else if (art == MissionsArt.Rettung) {
        if (zahl == 1) return MissionsVariante.Express
        if (zahl >= 2) return MissionsVariante.UnterFeuer
    }
    return MissionsVariante.Standard
}

function missionsVarianteName(art: MissionsArt, variante: MissionsVariante): string {
    if (variante == MissionsVariante.Zerbrechlich) return Texte.t(207)
    if (variante == MissionsVariante.Express) return Texte.t(208)
    if (variante == MissionsVariante.Illegal) return Texte.t(209)
    if (variante == MissionsVariante.Ass) return Texte.t(210)
    if (variante == MissionsVariante.UnterFeuer) return Texte.t(211)
    return Texte.t(212)
}

function missionsVarianteInfo(art: MissionsArt, variante: MissionsVariante): string {
    if (variante == MissionsVariante.Zerbrechlich) return Texte.t(213)
    if (variante == MissionsVariante.Express) return Texte.t(214)
    if (variante == MissionsVariante.Illegal) return Texte.t(215)
    if (variante == MissionsVariante.Ass) return Texte.t(216)
    if (variante == MissionsVariante.UnterFeuer) return Texte.t(217)
    if (art == MissionsArt.Rettung) return Texte.t(218)
    return Texte.t(219)
}

function missionsAngebotMenge(angebotNr: number): number {
    let herkunft = missionsAngebotHerkunft(angebotNr)
    if (herkunft == 2) return 1
    if (herkunft == 1) return kampagneMissionsMenge(kampagnenStufe)
    if (herkunft == 3) return tagesMissionsMenge()
    let art = missionsAngebotArt(angebotNr)
    let variante = missionsAngebotVariante(angebotNr)
    if (art == MissionsArt.Rettung) return 1
    if (art == MissionsArt.Jagd) {
        if (variante == MissionsVariante.Ass) return 1
        return Math.min(5, 1 + Math.idiv(aktuellerRang(), 2) + missionsAngebotStartwert(angebotNr) % 2)
    }
    if (variante == MissionsVariante.Zerbrechlich) return 1
    return Math.min(5, 1 + Math.idiv(aktuellerRang(), 2) + missionsAngebotStartwert(angebotNr) % 3)
}

function missionsAngebotLohn(angebotNr: number): number {
    let herkunft = missionsAngebotHerkunft(angebotNr)
    if (herkunft == 2) return 150
    if (herkunft == 3) return tagesMissionsLohn()
    let ziel = missionsAngebotZiel(angebotNr)
    let art = missionsAngebotArt(angebotNr)
    let ware = missionsAngebotWare(angebotNr)
    let variante = missionsAngebotVariante(angebotNr)
    let entfernung = weltEntfernung(aktuelleWelt, ziel)
    let gefahr = wirksameWeltGefahr(ziel)
    let menge = missionsAngebotMenge(angebotNr)
    let lohn = herkunft == 1 ? kampagneMissionsLohn(kampagnenStufe) : 0
    if (herkunft == 0 && art == MissionsArt.Lieferung) lohn = 70 + entfernung * 3 + menge * 35 + gefahr * 35
    else if (herkunft == 0 && art == MissionsArt.Jagd) lohn = 120 + menge * 70 + entfernung * 2 + gefahr * 45
    else if (herkunft == 0) lohn = 150 + entfernung * 3 + gefahr * 55
    let varianteProzent = 0
    if (variante == MissionsVariante.Zerbrechlich) varianteProzent = 35
    else if (variante == MissionsVariante.Express) varianteProzent = 30
    else if (variante == MissionsVariante.Illegal) varianteProzent = 60
    else if (variante == MissionsVariante.Ass) varianteProzent = 50
    else if (variante == MissionsVariante.UnterFeuer) varianteProzent = 45
    let modusProzent = spielModus == SpielModus.Veteran ? 15 : (spielModus == SpielModus.Eisern ? 30 : 0)
    let ereignisProzent = marktEreignisMissionsLohnProzent(ziel, art, ware)
    return Math.idiv(lohn * (100 + varianteProzent + modusProzent + ereignisProzent) + 50, 100)
}

function missionsAngebotFrist(angebotNr: number): number {
    let herkunft = missionsAngebotHerkunft(angebotNr)
    if (herkunft == 2) return spieltag + 5
    if (herkunft == 3) return tagesMissionsFrist()
    let ziel = missionsAngebotZiel(angebotNr)
    let geschaetzteSpruenge = Math.max(1, Math.idiv(weltEntfernung(aktuelleWelt, ziel) + 21, 22))
    let puffer = herkunft == 1 ? 5 : 4
    if (missionsAngebotVariante(angebotNr) == MissionsVariante.Express) puffer = 1
    return spieltag + geschaetzteSpruenge + puffer
}

function missionsBeschriftung(art: MissionsArt): string {
    if (art == MissionsArt.Lieferung) return Texte.t(220)
    if (art == MissionsArt.Jagd) return Texte.t(221)
    if (art == MissionsArt.Rettung) return Texte.t(222)
    return Texte.t(223)
}

function verhandelterMissionsLohn(grundLohn: number, aenderung: number): number {
    let prozent = Math.clamp(-10, 25, aenderung * 5)
    return Math.max(1, Math.idiv(grundLohn * (100 + prozent) + 50, 100))
}

function verhandlungGelungen(startwert: number, aenderung: number): boolean {
    if (aenderung <= 0) return true
    let geschick = rufVonFraktion(Fraktion.Gilde) + ausbauten[AUSBAU_SCANNER] * 12
    let chance = Math.clamp(10, 90, 70 + geschick - aenderung * 18)
    return galaxieZufall(startwert, spieltag, aenderung + 991) % 100 < chance
}

function schwarzmarktVerfuegbar(): boolean {
    return aktuelleWelt == 12 || aktuelleWelt == ANZAHL_OEFFENTLICHER_WELTEN ||
        rufVonFraktion(Fraktion.Korsaren) >= 20
}

function schwarzmarktKaufPreis(ware: number): number {
    if (ware < 0 || ware >= ANZAHL_WAREN) return 0
    return Math.max(1, Math.idiv(kaufPreis(ware) * 88, 100))
}

function schwarzmarktVerkaufPreis(ware: number): number {
    if (ware < 0 || ware >= ANZAHL_WAREN) return 0
    return Math.max(1, Math.idiv(verkaufPreis(ware) * 125, 100))
}

function erfasseSchwarzmarktHandel(gewinn: number): void {
    schwarzmarktGeschaefte = Math.min(SPIELSTAND_MAX_ZAEHLER, schwarzmarktGeschaefte + 1)
    if (gewinn > 0) erfasseHandelsgewinn(gewinn)
    aendereRuf(Fraktion.Korsaren, 2)
    aendereRuf(Fraktion.Bund, -1)
    aktualisiereErfolge()
}

// Liest eine 16-Bit-Zahl mit Vorzeichen aus einer Tabelle (die Tabellen stehen als Hex-Zahlenreihen im Code,
// das spart Flash-Speicher).
function tabelleI16(tabelle: Buffer, stelle: number): number {
    return tabelle.getNumber(NumberFormat.Int16LE, stelle * 2)
}
