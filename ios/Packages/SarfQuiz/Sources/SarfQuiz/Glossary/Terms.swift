// The names of the grammar ideas the screens label things with.

import SarfCore

extension Tense {
    /// ```
    /// madi   māḍī     مَاضٍ
    /// ```
    ///
    /// Used by: the Tables tense row and chart line.
    public var term: Term {
        switch self {
        case .madi:   return Term("māḍī", "مَاضٍ")
        case .mudari: return Term("muḍāriʿ", "مُضَارِع")
        case .amr:    return Term("amr", "أَمْر")
        }
    }
}

extension Voice {
    /// Used by: the Tables voice row and chart line.
    public var term: Term {
        switch self {
        case .malum:  return Term("maʿrūf", "مَعْرُوف")
        case .majhul: return Term("majhūl", "مَجْهُول")
        }
    }
}

extension Mood {
    /// Used by: the Tables iʿrāb row and chart line.
    public var term: Term {
        switch self {
        case .raf:  return Term("marfūʿ", "مَرْفُوع")
        case .nasb: return Term("manṣūb", "مَنْصُوب")
        case .jazm: return Term("majzūm", "مَجْزُوم")
        }
    }
}

extension VerbTypeGroup {
    /// The name a student knows the type by.
    ///
    ///     ajwaf   Hollow   أَجْوَف
    ///
    /// Used by: the Tables search rows.
    public var term: Term {
        switch self {
        case .salim:  return Term("Sound", "سَالِم")
        case .mahmuz: return Term("Hamzated", "مَهْمُوز")
        case .mudaaf: return Term("Doubled", "مُضَاعَف")
        case .mithal: return Term("Assimilated", "مِثَال")
        case .ajwaf:  return Term("Hollow", "أَجْوَف")
        case .naqis:  return Term("Defective", "نَاقِص")
        case .lafif:  return Term("Lafīf", "لَفِيف")
        }
    }
}
