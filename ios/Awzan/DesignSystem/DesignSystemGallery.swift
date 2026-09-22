// Every token and every component on one scrollable page.
//
// This is Track D's own proof, and it is meant to be looked at rather than read:
// the type scale renders here at its real sizes with its real line heights, so a
// clipped ḥaraka or a font that failed to register is visible rather than
// theoretical. Drive it at the largest Dynamic Type and in Night.
//
// It is NOT the app. E1 replaces the root view with the real Tables screen;
// this stays reachable as a developer page.

import SwiftUI

struct DesignSystemGallery: View {
    private enum Section: String, CaseIterable { case type, colour, components }

    /// Show only one section.
    ///
    /// The page's job is to be CAPTURED — at both themes and at the largest
    /// Dynamic Type — and a simulator cannot be scrolled from the command line:
    ///
    /// ```
    /// SIMCTL_CHILD_AWZAN_GALLERY=components xcrun simctl launch \
    ///   --terminate-running-process "iPhone 17 Pro" com.awzan.Awzan
    /// ```
    ///
    /// The `SIMCTL_CHILD_` prefix is the whole trick: anything after the bundle
    /// id on that command line is a launch ARGUMENT, so `AWZAN_GALLERY=...`
    /// written there is passed as an argv entry, read by nobody, and the
    /// capture quietly shows the wrong section.
    ///
    /// Filtering rather than scrolling to it, because both of SwiftUI's scroll
    /// APIs fail *silently* here — `ScrollViewReader.scrollTo` from `onAppear`
    /// runs before layout, and `scrollPosition(id:)` needs the value to CHANGE,
    /// so an initial one does nothing. Either way the capture shows the top of
    /// the page and looks like a successful run.
    ///
    /// Unset shows everything, which is what tapping the icon gets.
    private let only: Section? = {
        guard let raw = ProcessInfo.processInfo.environment["AWZAN_GALLERY"] else { return nil }
        let section = Section(rawValue: raw)
        assert(section != nil, "AWZAN_GALLERY=\(raw) is not one of \(Section.allCases.map(\.rawValue))")
        return section
    }()

    private func shows(_ section: Section) -> Bool { only == nil || only == section }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Midad.space8) {
                    if shows(.type) { typeSpecimen }
                    if shows(.colour) { palette }
                    if shows(.components) { components }
                }
                // 16pt screen gutter, everywhere.
                .padding(.horizontal, Midad.space4)
                .padding(.vertical, Midad.space6)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .background(Midad.ground)
            .navigationTitle("Midād")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: - Type

    private var typeSpecimen: some View {
        section("Type") {
            // Arabic at every size, vowelled, with the two hardest cases in it:
            // يُعَلِّمُ stacks a shadda over a ḍamma, and اِسْتَخْرَجَ is the word
            // that stacks into a ligature in the wrong font.
            specimen("arabic-hero 60/104", .arabicHero, "تَنْصُرُ")
            specimen("arabic-display 40/70", .arabicDisplay, "اِسْتَخْرَجَ يَسْتَخْرِجُ")
            specimen("arabic-title 28/50", .arabicTitle, "يُعَلِّمُ · لَمْ تَسْلَمَا")
            specimen("arabic-cell 24/42", .arabicCell, "نَصَرْتُمَا")
            specimen("arabic-body 21/36", .arabicBody, "فِعْل مُضَارِع مَعْلُوم")
            specimen("arabic-label 19/30", .arabicLabel, "مَعْلُوم")
            Divider().overlay(Midad.line)
            specimen("screen-title 30/36 · 500", .screenTitle, "Practice")
            specimen("meaning-display 28/36", .meaningDisplay, "“they two (f) were not safe”")
            specimen("reading 19/26", .reading, "“she drank”")
            specimen("gloss 17/24", .gloss, "“to help”")
            Divider().overlay(Midad.line)
            specimen("headline 17/24 · 600", .headline, "What is the tense?")
            specimen("verdict 20/26 · 700", .verdict, "Not quite")
            specimen("body 15/22", .body, "The ḍamma on the prefix is the passive marker.")
            specimen("label 13/18 · 600", .label, "VERB TYPES")
            specimen("caption 12/16 · 500", .caption, "14 ṣiyagh")
            specimen("numeral 32/38 · 600 tabular", .numeral, "1,408")
        }
    }

    private func specimen(_ name: String, _ style: TypeStyle, _ sample: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(name)
                .typeStyle(.caption)
                .foregroundStyle(Midad.inkFaint)
            Text(sample.bidiIsolated)
                .typeStyle(style)
                .foregroundStyle(Midad.ink)
                // The tint behind each line is the ROW HEIGHT made visible: if a
                // ḥaraka pokes above its band, the design's leading is losing to
                // the font's metrics and D-59 is not being honoured.
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Midad.fill)
        }
    }

    // MARK: - Colour

    private var palette: some View {
        section("Colour") {
            ForEach(Self.swatches, id: \.name) { row in
                HStack(spacing: Midad.space3) {
                    RoundedRectangle(cornerRadius: Midad.radiusXs, style: .continuous)
                        .fill(row.color)
                        .frame(width: 44, height: 44)
                        .overlay(
                            RoundedRectangle(cornerRadius: Midad.radiusXs, style: .continuous)
                                .strokeBorder(Midad.line, lineWidth: 1)
                        )
                    Text(row.name).typeStyle(.label).foregroundStyle(Midad.ink)
                    Spacer()
                }
            }
        }
    }

    private struct Swatch { let name: String; let color: Color }

    /// Written out rather than derived: there is no runtime list of asset names,
    /// and a reflective walk would silently skip a token that failed to generate
    /// — which is exactly what this page exists to catch.
    private static let swatches: [Swatch] = [
        .init(name: "ground", color: Midad.ground),
        .init(name: "raised", color: Midad.raised),
        .init(name: "fill", color: Midad.fill),
        .init(name: "line", color: Midad.line),
        .init(name: "lineStrong", color: Midad.lineStrong),
        .init(name: "ink", color: Midad.ink),
        .init(name: "inkMuted", color: Midad.inkMuted),
        .init(name: "inkFaint", color: Midad.inkFaint),
        .init(name: "sign", color: Midad.sign),
        .init(name: "signSoft", color: Midad.signSoft),
        .init(name: "select", color: Midad.select),
        .init(name: "selectSoft", color: Midad.selectSoft),
        .init(name: "onSelect", color: Midad.onSelect),
        .init(name: "action", color: Midad.action),
        .init(name: "onAction", color: Midad.onAction),
        .init(name: "correct", color: Midad.correct),
        .init(name: "correctSoft", color: Midad.correctSoft),
        .init(name: "wrong", color: Midad.wrong),
        .init(name: "wrongSoft", color: Midad.wrongSoft),
        .init(name: "focus", color: Midad.focus),
    ]

    // MARK: - Components

    private var components: some View {
        section("Components · what Tables needs") {
            ComponentBench()
        }
    }

    private func section<Content: View>(
        _ title: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: Midad.space4) {
            Text(title)
                .typeStyle(.screenTitle)
                .foregroundStyle(Midad.ink)
            content()
        }
    }
}

/// The five components D2 built, wired to each other the way Tables wires them —
/// so the page exercises real state rather than a row of static screenshots.
private struct ComponentBench: View {
    @State private var bar = WordBarState.chosen(citation: "نَصَرَ يَنْصُرُ", gloss: "to help")
    @State private var form = "I"
    @State private var tense = "madi"
    @State private var voice = "malum"

    /// كَتَبَ's real form set — I, II, III, IV, VI, VIII, X. No V, VII or IX,
    /// because the verb does not carry them.
    private let forms: [(String, String)] = [
        ("I", "فَعَلَ"), ("II", "فَعَّلَ"), ("III", "فَاعَلَ"), ("IV", "أَفْعَلَ"),
        ("VI", "تَفَاعَلَ"), ("VIII", "اِفْتَعَلَ"), ("X", "اِسْتَفْعَلَ"),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: Midad.space6) {
            WordBar(state: $bar)

            RootTiles(["ن", "ص", "ر"], size: .medium, showsSlots: true)

            FlowLayout {
                ForEach(forms, id: \.0) { id, wazn in
                    Chip(ChipLabel(numeral: id, arabic: wazn), isSelected: form == id) { form = id }
                }
                Chip(ChipLabel(numeral: "IX", arabic: "اِفْعَلَّ"), isSelected: false, isEnabled: false) {}
            }

            SegmentedRow([
                Segment("madi", english: "Past", arabic: "مَاضٍ"),
                Segment("mudari", english: "Present", arabic: "مُضَارِع"),
                Segment("amr", english: "Command", arabic: "أَمْر"),
            ], selection: $tense)

            VStack(alignment: .leading, spacing: Midad.space1) {
                SegmentedRow([
                    Segment("malum", english: "Active", arabic: "مَعْرُوف"),
                    Segment("majhul", english: "Passive", arabic: "مَجْهُول",
                            disabledReason: Self.intransitiveReason),
                ], selection: $voice)
                SegmentHint(Self.intransitiveReason)
            }

            // The chart line: the one place mixed Arabic and English is most
            // likely to reorder, so it is on the bench on purpose.
            Text(["Form \(form)", "مَاضٍ", "مَعْرُوف"].bidiJoined() + " · 14 ṣiyagh")
                .typeStyle(.caption)
                .foregroundStyle(Midad.inkMuted)

            Button("View the table") {}.buttonStyle(.midadPrimary)

            ParadigmList(Self.sample)
        }
    }

    /// Built the way the real Tables screen will build it: the citation is
    /// isolated at the point it is interpolated, not by whoever prints the line.
    private static let intransitiveReason =
        "\("خَرَجَ".bidiIsolated) is intransitive — it has no majhūl."

    /// Real engine output for نصر, Form I, māḍī, maʿlūm — six of the fourteen.
    /// Six rather than fourteen so the page stays scannable; the amr's six is
    /// also what a real short chart looks like.
    private static let sample: [ParadigmRow] = [
        .init(id: "3ms", english: "he", arabic: "هُوَ", word: "نَصَرَ"),
        .init(id: "3md", english: "they two (m)", arabic: "هُمَا", word: "نَصَرَا"),
        .init(id: "3mp", english: "they (m, 3+)", arabic: "هُمْ", word: "نَصَرُوا"),
        .init(id: "3fs", english: "she", arabic: "هِيَ", word: "نَصَرَتْ"),
        .init(id: "2mp", english: "you (m, 3+)", arabic: "أَنْتُمْ", word: "نَصَرْتُم"),
        .init(id: "1p", english: "we", arabic: "نَحْنُ", word: "نَصَرْنَا"),
    ]
}

#Preview("Paper") { DesignSystemGallery() }
#Preview("Night") { DesignSystemGallery().preferredColorScheme(.dark) }
