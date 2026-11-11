// Zentraler Klangentwurf für den Lautsprecher des Calliope mini 3 und des GameKits. Kurze hohe Töne sind auf dem
// kleinen eingebauten Lautsprecher viel klarer als tiefe Klicks.
const KLANG_EINSTELLUNG_SCHLUESSEL = "ot.sound.level"
const EFFEKT_DICHTE_SCHLUESSEL = "ot.sound.fx"
const KLANGRASTE_LAUTSTAERKEN = hex`0060a8e6`
const KLANGRASTE_NAMEN = hex`c9007002eb007102`
const EFFEKT_DICHTE_NAMEN = hex`2000eb007202`
// Anzahl der Dichtestufen. EFFEKT_DICHTE_NAMEN besteht aus 16-Bit-Einträgen, darum ist seine Länge doppelt so groß
// wie dieser Wert.
const ANZAHL_EFFEKT_DICHTE = 3
const STANDARD_KLANGRASTE = 2
const STANDARD_EFFEKT_DICHTE = 1
const INTRO_MELODIE_FILM_TEMPO = 120
// Wie der Melodie-Spieler von MakeCode zählt spieleIntroMelodie in ganzzahligen Ticks: floor(15000 / Tempo). 159 BPM
// ergeben 94 ms je Dauer-Einheit und damit 48,128 s für diese Partitur mit 512 Einheiten.
const INTRO_MELODIE_NORMAL_TEMPO = 159
// Wird im Spiel nirgends gelesen; die Intro-Melodie darunter ist 512 Dauer-Einheiten lang.
const INTRO_MELODIE_SCHLAEGE = 128
const KLANG_BESTAETIGUNG_NOTEN = [1319, 1760]
const KLANG_SCHILD_BRUCH_NOTEN = [2093, 1568, 1047, 740]
const KLANG_ALARM_NOTEN = [2093, 0, 2093]
// Die Intro-Melodie als Paare von Bytes (Ton, Dauer): Ton = Index für music.lookupFrequency, 0 = Pause; die Dauer zählt
// Einheiten des Tempos. Beide Tempos (FILM und NORMAL) spielen dieselben Noten. Bytes statt
// Melody-Objekten sparen Speicher.
const INTRO_MELODIE = hex`3a023d024104460841043d0438043a043a0841043d043a043d044108440441043f043d044604440441083f0441044404460841043f043d043a023a023d023a0241023a023d023a02380238023c0238023f0238023c0238023a023a023d023f0241023f023d023c023a0841043d043a0838043a043d04410846043a023a023d023f0241043f043d043a0438083a043d044108000441044404460449084604440441043f0441024402460441083a023a023d023a023f023d023a0238023a043d0441043f043d043c043a043804350238023c023f02410446083a023c023d023f02410242024402460248024902460448044910460841043d043a043d044104440446083a023d0241024604440441043d083a06`
let introMelodieWiedergabeNr = 0
let klanglandschaftSzene = -1
let klanglandschaftPhase = -1
let klanglandschaftWelt = -1
let naechsterAtmosphaerenKlangMs = 0
let klangWiedergabeNr = 0
let klangraste = STANDARD_KLANGRASTE
let effektDichte = STANDARD_EFFEKT_DICHTE
let aktiveKlangMuster = 0
let naechsterBestaetigungsKlangMs = 0
let naechsterSchildBruchKlangMs = 0
let naechsterAlarmKlangMs = 0

// Stoppt jeden laufenden Klang des Mischers: der native Aufruf in music.stopAllSounds(). Das Spiel startet nie
// Melody-Objekte, Songs oder Endlos-Wiedergaben, darum hatte der Rest von stopAllSounds nichts zu stoppen; die
// Intro-Melodie stoppt über introMelodieWiedergabeNr.
//% shim=music::stopPlaying
function mischerStopp(): void { }

function stoppeKlaenge(): void {
    klangWiedergabeNr++
    aktiveKlangMuster = 0
    introMelodieWiedergabeNr++
    mischerStopp()
}

function klangrasteFuerLautstaerke(lautstaerke: number): number {
    for (let i = 0; i < KLANGRASTE_LAUTSTAERKEN.length; i++) {
        if (KLANGRASTE_LAUTSTAERKEN[i] == lautstaerke) return i
    }
    return STANDARD_KLANGRASTE
}

function richteKlangEin(): void {
    stoppeKlaenge()
    if (settings.exists(KLANG_EINSTELLUNG_SCHLUESSEL))
        klangraste = klangrasteFuerLautstaerke(settings.readNumber(KLANG_EINSTELLUNG_SCHLUESSEL))
    else klangraste = STANDARD_KLANGRASTE
    if (settings.exists(EFFEKT_DICHTE_SCHLUESSEL)) {
        let gespeicherteDichte = Math.round(settings.readNumber(EFFEKT_DICHTE_SCHLUESSEL))
        effektDichte = gespeicherteDichte >= 0 && gespeicherteDichte <= 2 ? gespeicherteDichte : STANDARD_EFFEKT_DICHTE
    } else effektDichte = STANDARD_EFFEKT_DICHTE
    music.setVolume(KLANGRASTE_LAUTSTAERKEN[klangraste])
    klanglandschaftSzene = -1
    klanglandschaftPhase = -1
    klanglandschaftWelt = -1
    naechsterAtmosphaerenKlangMs = 0
}

function wechsleKlangraste(aenderung: number): void {
    let naechste = (klangraste + aenderung) % KLANGRASTE_LAUTSTAERKEN.length
    if (naechste < 0) naechste += KLANGRASTE_LAUTSTAERKEN.length
    if (naechste == klangraste) return
    stoppeKlaenge()
    klangraste = naechste
    let lautstaerke = KLANGRASTE_LAUTSTAERKEN[klangraste]
    music.setVolume(lautstaerke)
    settings.writeNumber(KLANG_EINSTELLUNG_SCHLUESSEL, lautstaerke)
    naechsterAtmosphaerenKlangMs = game.runtime() + 250
}

function klangrasteName(): string {
    return Texte.t(tabelleI16(KLANGRASTE_NAMEN, klangraste))
}

function wechsleEffektDichte(aenderung: number): void {
    let naechste = (effektDichte + aenderung) % ANZAHL_EFFEKT_DICHTE
    if (naechste < 0) naechste += ANZAHL_EFFEKT_DICHTE
    if (naechste == effektDichte) return
    effektDichte = naechste
    settings.writeNumber(EFFEKT_DICHTE_SCHLUESSEL, effektDichte)
    naechsterAtmosphaerenKlangMs = game.runtime() + 350
}

function effektDichteName(): string {
    return Texte.t(tabelleI16(EFFEKT_DICHTE_NAMEN, effektDichte))
}

function effektMusterGrenze(): number {
    // Ein, zwei oder drei kurze Muster gleichzeitig. Selbst DICHT bleibt unter der Kanallast, die auf dem Calliope
    // mini 3 zu Aussetzern führte.
    return effektDichte + 1
}

function atmosphaereVerzoegerung(grundVerzoegerungMs: number): number {
    if (effektDichte == 0) return Math.idiv(grundVerzoegerungMs * 16, 10)
    if (effektDichte == 2) return Math.idiv(grundVerzoegerungMs * 7, 10)
    return grundVerzoegerungMs
}

function hoerbareFrequenz(frequenz: number): number {
    if (frequenz <= 0) return 700
    while (frequenz < 700) frequenz *= 2
    return Math.clamp(700, 2200, frequenz)
}

// Läuft in einem Hintergrundprozess (Fiber) und bremst die Animation nicht (genau das, was music.tonePlayable mit
// PlaybackMode.InBackground tat, ohne die Playable-Klassen einzubinden).
function spieleTon(frequenz: number, dauer: number): void {
    if (KLANGRASTE_LAUTSTAERKEN[klangraste] == 0) return
    let tonhoehe = hoerbareFrequenz(frequenz)
    let laenge = Math.max(70, dauer)
    control.runInParallel(function () { music.playTone(tonhoehe, laenge) })
}

function spieleKlangMuster(noten: number[], dauer: number, luecke: number): void {
    if (KLANGRASTE_LAUTSTAERKEN[klangraste] == 0 || aktiveKlangMuster >= effektMusterGrenze()) return
    let wiedergabeNr = klangWiedergabeNr
    aktiveKlangMuster++
    control.runInParallel(function () {
        for (let i = 0; i < noten.length; i++) {
            if (wiedergabeNr != klangWiedergabeNr) return
            if (noten[i] > 0) music.playTone(hoerbareFrequenz(noten[i]), Math.max(70, dauer))
            else pause(Math.max(70, dauer))
            if (luecke > 0 && i < noten.length - 1) pause(luecke)
        }
        if (wiedergabeNr == klangWiedergabeNr) aktiveKlangMuster = Math.max(0, aktiveKlangMuster - 1)
    })
}

function spieleGleitton(welle: WaveShape, anfangFrequenz: number, endeFrequenz: number, dauer: number,
    effekt: SoundExpressionEffect): void {
    if (KLANGRASTE_LAUTSTAERKEN[klangraste] == 0) return
    music.playInstructions(0,
        gleittonPuffer(welle, anfangFrequenz, endeFrequenz, dauer, effekt, music.volume()))
}

// Baut denselben Befehlspuffer wie music.soundToInstructionBuffer(wave, start, end, 180, 0, dauer, effekt,
// InterpolationCurve.Curve, 20, 1, gesamtLautstaerke) aus Arcade 4.2.1, ohne die SoundEffect-Klassen.
function gleittonPuffer(welle: WaveShape, anfangFrequenz: number, endeFrequenz: number, dauer: number,
    effekt: SoundExpressionEffect, gesamtLautstaerke: number): Buffer {
    const anfangLautstaerke = 180
    const endeLautstaerke = 0
    let effektSchritte = Math.min(20, Math.floor(dauer / 5))
    let zeitAbschnitt = dauer / effektSchritte
    let frequenzen: number[] = []
    let lautstaerken: number[] = []
    for (let i = 0; i < effektSchritte; i++) {
        let t = i * zeitAbschnitt
        let frequenz = anfangFrequenz + (endeFrequenz - anfangFrequenz) *
            Math.sin(t / dauer * (Math.PI / 2))
        let lautstaerke =
            ((anfangLautstaerke + t * (endeLautstaerke - anfangLautstaerke) / dauer) / 255) * gesamtLautstaerke
        if (effekt === SoundExpressionEffect.Tremolo) {
            if (i % 2 === 0) lautstaerke = Math.max(lautstaerke - 500, 0)
            else lautstaerke = Math.min(lautstaerke + 500, 1023)
        } else if (effekt === SoundExpressionEffect.Vibrato) {
            if (i % 2 === 0) frequenz = Math.max(frequenz - 100, 0)
            else frequenz = frequenz + 100
        } else if (effekt === SoundExpressionEffect.Warble) {
            if (i % 2 === 0) frequenz = Math.max(frequenz - 1000, 0)
            else frequenz = frequenz + 1000
        }
        frequenzen.push(frequenz)
        lautstaerken.push(lautstaerke)
    }
    let ausgabe = control.createBuffer(12 * (effektSchritte - 1))
    let schrittDauerMs = Math.floor(dauer / (effektSchritte - 1))
    // Wellenform als Wert: Sinus 3, Sägezahn 2, Dreieck 1, Rechteck 15, Rauschen 18 (Index = WaveShape)
    let welleWert = hex`0302010f12`[welle]
    for (let i = 0; i < effektSchritte - 1; i++) {
        let versatz = i * 12
        ausgabe.setNumber(NumberFormat.UInt8LE, versatz, welleWert)
        ausgabe.setNumber(NumberFormat.UInt16LE, versatz + 2, frequenzen[i])
        ausgabe.setNumber(NumberFormat.UInt16LE, versatz + 4, schrittDauerMs)
        ausgabe.setNumber(NumberFormat.UInt16LE, versatz + 6, lautstaerken[i])
        ausgabe.setNumber(NumberFormat.UInt16LE, versatz + 8, lautstaerken[i + 1])
        ausgabe.setNumber(NumberFormat.UInt16LE, versatz + 10, frequenzen[i + 1])
    }
    return ausgabe
}

function klangStarteIntroMusik(): void {
    stoppeKlaenge()
    if (KLANGRASTE_LAUTSTAERKEN[klangraste] == 0) return
    spieleIntroMelodie(introNutztFilmTempo() ? INTRO_MELODIE_FILM_TEMPO : INTRO_MELODIE_NORMAL_TEMPO)
}

// Gleiche Planung und Lautstärke wie music.MelodyPlayer.play für eine einfache Notenliste
// (Dreieckswelle, keine Hüllkurve).
function spieleIntroMelodie(tempo: number): void {
    let wiedergabeNr = introMelodieWiedergabeNr
    let lautstaerke = Math.clamp(0, 255, (music.volume() * music.volume()) >> 8)
    control.runInParallel(function () {
        let einheitMs = Math.idiv(15000, tempo)
        let anfangMs = control.millis()
        let zeitPos = 0
        let jetzt = 0
        for (let i = 0; i < INTRO_MELODIE.length; i += 2) {
            if (wiedergabeNr != introMelodieWiedergabeNr) return
            let ms = INTRO_MELODIE[i + 1] * einheitMs
            let notenNummer = INTRO_MELODIE[i]
            if (notenNummer > 0) {
                let hz = music.lookupFrequency(notenNummer)
                let note = control.createBuffer(13)
                music.addNote(note, 0, ms, 255, 255, 1, hz, lautstaerke, hz)
                music.playInstructions(zeitPos - jetzt, note.slice(0, 12))
            }
            zeitPos += ms
            let restZeit = zeitPos - jetzt
            if (restZeit > 200) {
                pause(restZeit - 100)
                jetzt = control.millis() - anfangMs
            }
        }
    })
}

function klangPrologEinsatz(einsatz: number): void {
    if (einsatz == 0) spieleKlangMuster([880, 1047, 1319], 85, 30)
    else if (einsatz == 1) spieleGleitton(WaveShape.Noise, 1500, 480, 420, SoundExpressionEffect.Tremolo)
    else if (einsatz == 2) klangBegegnung()
    else spieleKlangMuster([988, 1319, 1760], 105, 35)
}

function klangIntroEinsatz(einsatz: number): void {
    if (einsatz == 0) return
    else if (einsatz == 1) spieleKlangMuster([1568, 2093], 75, 20)
    else if (einsatz == 2) spieleGleitton(WaveShape.Sawtooth, 760, 520, 380, SoundExpressionEffect.Tremolo)
    else if (einsatz == 3) spieleGleitton(WaveShape.Sawtooth, 520, 1450, 480, SoundExpressionEffect.Vibrato)
    else if (einsatz == 4) spieleGleitton(WaveShape.Square, 740, 1950, 520, SoundExpressionEffect.Warble)
    else if (einsatz == 5) spieleKlangMuster([1319, 0, 1760], 85, 45)
    else if (einsatz == 6) klangBegegnung()
    else if (einsatz == 7) klangGegnerErfasst()
    else if (einsatz == 8) spieleGleitton(WaveShape.Square, 2200, 900, 160, SoundExpressionEffect.None)
    else if (einsatz == 9) spieleGleitton(WaveShape.Noise, 1150, 420, 260, SoundExpressionEffect.Tremolo)
    else if (einsatz == 10) spieleGleitton(WaveShape.Noise, 900, 180, 480, SoundExpressionEffect.Warble)
    else if (einsatz == 11) klangRettungSignal()
    else if (einsatz == 12) spieleGleitton(WaveShape.Sawtooth, 740, 1200, 420, SoundExpressionEffect.Vibrato)
    else if (einsatz == 13) spieleGleitton(WaveShape.Sawtooth, 920, 1720, 440, SoundExpressionEffect.Vibrato)
    else if (einsatz == 14) spieleGleitton(WaveShape.Square, 1250, 2200, 560, SoundExpressionEffect.Warble)
    else if (einsatz == 15) spieleKlangMuster([988, 1319], 100, 35)
    else if (einsatz == 16) spieleKlangMuster([1175, 1568], 90, 35)
    else if (einsatz == 17) spieleKlangMuster([1319, 1568], 85, 25)
    else if (einsatz == 18) spieleKlangMuster([1568, 1760], 85, 20)
    else spieleKlangMuster([1760, 2093], 95, 20)
}

function klangTitel(): void {
    stoppeKlaenge()
    spieleKlangMuster([880, 1047, 1319, 1760], 115, 25)
}

function klangNavigation(): void {
    spieleTon(1175, 70)
}

// Positive Menüaktion: die letzten zwei Noten des Auftragsklangs, kürzer und mit kleinerer Pause.
function klangBestaetigung(): void {
    if (KLANGRASTE_LAUTSTAERKEN[klangraste] == 0) return
    let jetzt = game.runtime()
    if (jetzt < naechsterBestaetigungsKlangMs) return
    naechsterBestaetigungsKlangMs = jetzt + 140
    spieleKlangMuster(KLANG_BESTAETIGUNG_NOTEN, 70, 15)
}

// Zusammenbruch des Schilds der Spielerin oder des Spielers. Die absteigende Linie bleibt auch unter
// dem Kampflärm klar.
function klangSchildBruch(): void {
    if (KLANGRASTE_LAUTSTAERKEN[klangraste] == 0) return
    let jetzt = game.runtime()
    if (jetzt < naechsterSchildBruchKlangMs) return
    naechsterSchildBruchKlangMs = jetzt + 600
    spieleKlangMuster(KLANG_SCHILD_BRUCH_NOTEN, 70, 8)
}

// Kritische Warnung. Aufrufer dürfen sie in jedem Bild auslösen; höchstens ein Puls alle 900 ms wird zugelassen.
function klangAlarm(): void {
    if (KLANGRASTE_LAUTSTAERKEN[klangraste] == 0) return
    let jetzt = game.runtime()
    if (jetzt < naechsterAlarmKlangMs) return
    naechsterAlarmKlangMs = jetzt + 900
    spieleKlangMuster(KLANG_ALARM_NOTEN, 70, 35)
}

function klangKauf(): void {
    spieleKlangMuster([1319, 1760], 80, 20)
}

function klangVerkauf(): void {
    spieleKlangMuster([1568, 1175], 80, 20)
}

function klangMission(): void {
    spieleKlangMuster([988, 1319, 1760], 95, 20)
}

function klangFehler(): void {
    spieleKlangMuster([784, 740], 120, 20)
}

function klangStart(): void {
    spieleKlangMuster([740, 880, 1175, 1568], 95, 20)
}

function klangReiseflug(): void {
    spieleKlangMuster([880, 988], 80, 20)
}

function klangBegegnung(): void {
    spieleKlangMuster([740, 988, 740], 110, 45)
}

function klangGegnerErfasst(): void {
    spieleKlangMuster([1760, 1760], 70, 55)
}

function klangRettungSignal(): void {
    spieleKlangMuster([1319, 0, 1319], 100, 30)
}

function klangRettungFertig(): void {
    spieleKlangMuster([988, 1319, 1760], 100, 25)
}

function klangAnflug(): void {
    spieleKlangMuster([1175, 1319], 90, 30)
}

function klangFlucht(): void {
    spieleKlangMuster([880, 1175, 1568], 90, 20)
}

function klangLaser(treffer: boolean): void {
    if (treffer) spieleKlangMuster([2093, 1568], 70, 5)
    else spieleTon(1760, 75)
}

function klangExplosion(): void {
    spieleKlangMuster([1047, 880, 740], 110, 10)
}

function klangSchaden(): void {
    spieleKlangMuster([784, 740], 115, 15)
}

function klangBesiegt(): void {
    stoppeKlaenge()
    spieleKlangMuster([1047, 880, 784, 740], 150, 25)
}

function stationTonhoehe(grundFrequenz: number, welt: number): number {
    let abwandlung = Math.clamp(0, ANZAHL_WELTEN - 1, welt) % 3
    if (abwandlung == 1) return Math.idiv(grundFrequenz * 9, 8)
    if (abwandlung == 2) return Math.idiv(grundFrequenz * 5, 4)
    return grundFrequenz
}

function spieleStationMotiv(welt: number): void {
    let weltNr = Math.clamp(0, ANZAHL_WELTEN - 1, welt)
    let stationFraktion = weltFraktion(weltNr)
    let tonDauer = 82 + (weltNr % 2) * 18
    if (stationFraktion == 0) {
        spieleKlangMuster([stationTonhoehe(740, weltNr), stationTonhoehe(988, weltNr),
            stationTonhoehe(1175, weltNr)], tonDauer, 24)
    } else if (stationFraktion == 1) {
        spieleKlangMuster([stationTonhoehe(784, weltNr), stationTonhoehe(1175, weltNr), 0,
            stationTonhoehe(988, weltNr)], tonDauer, 18)
    } else if (stationFraktion == 2) {
        spieleKlangMuster([stationTonhoehe(880, weltNr), stationTonhoehe(1047, weltNr),
            stationTonhoehe(1319, weltNr), stationTonhoehe(1047, weltNr)], tonDauer, 14)
    } else {
        spieleKlangMuster([stationTonhoehe(740, weltNr), stationTonhoehe(880, weltNr),
            stationTonhoehe(740, weltNr), stationTonhoehe(1319, weltNr)], tonDauer, 20)
    }
}

function klangDock(): void {
    spieleStationMotiv(aktuelleWelt)
}

function istStationKlanglandschaft(): boolean {
    return aktiveSzene == Szene.Hangar || aktiveSzene == Szene.Markt ||
        aktiveSzene == Szene.Werft ||
        aktiveSzene == Szene.Missionen ||
            aktiveSzene == Szene.Sternkarte || aktiveSzene == Szene.Status
}

// Eine spärliche Klangkulisse hält Stationen und Flug lebendig, ohne wichtige Effekte zu übertönen. Menüs innerhalb
// einer Station teilen sich eine Klanglandschaft, darum kann schnelles Wechseln keine Motive neu starten und keine
// zusätzlichen Fibers erzeugen.
function aktualisiereKlanglandschaft(): void {
    let phase = aktiveSzene == Szene.Flug ? flugPhase : -1
    let jetzt = game.runtime()
    let stationSzene = istStationKlanglandschaft()
    let szeneGruppe = stationSzene ? 100 : aktiveSzene
    let welt = stationSzene ? aktuelleWelt : -1
    if (klanglandschaftSzene != szeneGruppe || klanglandschaftPhase != phase || klanglandschaftWelt != welt) {
        klanglandschaftSzene = szeneGruppe
        klanglandschaftPhase = phase
        klanglandschaftWelt = welt
        naechsterAtmosphaerenKlangMs = jetzt + 900
    }
    if (jetzt < naechsterAtmosphaerenKlangMs) return
    if (stationSzene) {
        spieleStationMotiv(aktuelleWelt)
        naechsterAtmosphaerenKlangMs = jetzt + atmosphaereVerzoegerung(4200 + (aktuelleWelt % 5) * 320)
    } else if (aktiveSzene == Szene.Flug &&
        (phase == FlugPhase.Start || phase == FlugPhase.Reiseflug)) {
        spieleKlangMuster([740, 784], 75, 10)
        naechsterAtmosphaerenKlangMs = jetzt + atmosphaereVerzoegerung(1250)
    } else if (aktiveSzene == Szene.Flug && phase == FlugPhase.Begegnung) {
        spieleTon(988, 75)
        naechsterAtmosphaerenKlangMs = jetzt + atmosphaereVerzoegerung(1450)
    } else if (aktiveSzene == Szene.Flug && phase == FlugPhase.Anflug) {
        spieleTon(1319, 80)
        naechsterAtmosphaerenKlangMs = jetzt + atmosphaereVerzoegerung(1650)
    } else naechsterAtmosphaerenKlangMs = jetzt + 60000
}
