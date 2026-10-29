// Works out a root's verb type from its letters.

extension LexiconService {
    private static let waw: Unicode.Scalar = "و"
    private static let yaa: Unicode.Scalar = "ي"
    private static let hamzas: Set<Unicode.Scalar> = ["ء", "أ", "إ", "ؤ", "ئ"]

    private static func isWeak(_ letter: Unicode.Scalar) -> Bool {
        letter == waw || letter == yaa
    }

    /// The verb type a root's letters imply.
    ///
    ///     كتب → salim        قول → ajwafWaw      رمي → naqisYa
    ///     وعد → mithalWaw    مدد → mudaaf        أخذ → mahmuz
    ///
    /// The checks run in order and the first match wins.
    ///
    /// Used by: LexiconService.load, to check each root's declared type.
    public static func classify(_ radicals: Radicals) -> VerbType {
        let weakCount = [radicals.fa, radicals.ayn, radicals.lam].filter(isWeak).count
        if weakCount >= 2 {
            // وَقَى: weak first and last letters, with a strong letter between.
            // Anything else with two weak letters has them side by side (طَوَى).
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
