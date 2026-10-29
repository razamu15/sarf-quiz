// Which verb type a set of radicals implies. Port of classify() in
// web-prototype/js/lexicon/lexicon-service.js, line for line: the precedence
// below is real grammar, so it is kept in the same order.

extension LexiconService {
    private static let waw: Unicode.Scalar = "و"
    private static let yaa: Unicode.Scalar = "ي"
    private static let hamzas: Set<Unicode.Scalar> = ["ء", "أ", "إ", "ؤ", "ئ"]

    private static func isWeak(_ letter: Unicode.Scalar) -> Bool {
        letter == waw || letter == yaa
    }

    /// The verb type the radicals alone imply.
    ///
    /// The weak types resolve to their wāw / yāʾ variant, because that is what
    /// decides the iʿlāl and therefore which engine runs; `VerbType.group` folds
    /// them back to مِثَال / أَجْوَف / نَاقِص for the student.
    ///
    /// ORDER ENCODES PRECEDENCE:
    ///   1. two weak letters → lafīf, before anything else;
    ///   2. a weak ʿayn, then a weak lām, then a weak fāʾ — so a root weak in more
    ///      than one place is judged by the first of those it has (it cannot be two
    ///      of them without being lafīf, caught above);
    ///   3. only then the sound-looking types: ʿayn = lām is muḍāʿaf, and it wins
    ///      over a hamza (أَمَّ is muḍāʿaf, not mahmūz); any hamza is mahmūz.
    /// A root that is both weak and hamzated (يَئِسَ: yāʾ first, hamza second) is
    /// classified by its weakness, since that is the harder rule — the hamzas then
    /// arrive at the mithāl or nāqiṣ engine, which run the hamza-seating pass.
    ///
    /// Called by: `LexiconService.load`, to check every root's declared type; and
    /// tests. Nothing else reads it: a root's type is stored, and this is the
    /// check that the stored value is right.
    public static func classify(_ radicals: Radicals) -> VerbType {
        let weakCount = [radicals.fa, radicals.ayn, radicals.lam].filter(isWeak).count
        if weakCount >= 2 {
            // Mafrūq — "separated": the fāʾ and the lām are weak with a sound ʿayn
            // between them (وَقَى). Maqrūn — "joined": the two weak letters sit
            // next to each other (طَوَى). Anything else with two weak letters is
            // adjacent by elimination, so it falls to maqrūn.
            return isWeak(radicals.fa) && isWeak(radicals.lam) && !isWeak(radicals.ayn)
                ? .lafifMafruq : .lafifMaqrun
        }
        if isWeak(radicals.ayn) { return radicals.ayn == waw ? .ajwafWaw : .ajwafYa }
        if isWeak(radicals.lam) { return radicals.lam == waw ? .naqisWaw : .naqisYa }
        if isWeak(radicals.fa) { return radicals.fa == waw ? .mithalWaw : .mithalYa }
        if radicals.ayn == radicals.lam { return .mudaaf }
        if [radicals.fa, radicals.ayn, radicals.lam].contains(where: hamzas.contains) { return .mahmuz }
        return .salim
    }
}
