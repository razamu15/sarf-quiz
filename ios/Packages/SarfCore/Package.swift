// swift-tools-version: 6.0
//
// SarfCore — the engine. Vocabulary, grammar, the lexicon, the five
// conjugators behind one service, and meanings.
//
// It heads for a hard freeze at B3 (TECHNICAL_PLAN Part C), which is why it is
// its own target rather than a folder: the quiz layer above it is the least
// settled part of the app, and one package would move the frozen thing's
// version every time the unfrozen one changed.
//
// TWO RULES THE TARGET EXISTS TO ENFORCE, as compile errors rather than review
// reminders (IOS_PORT_PLAN Decision 2):
//   · no display strings, and no SwiftUI — Glossary is the only string owner
//     and it lives above this line
//   · no Settings — the app's feature gates cannot be read from here. Anything
//     that needs one takes it as a parameter (see LexiconService.availableTypes).
//
// Nothing is built here yet: E1 fills it (IOS_PORT_PLAN).

import PackageDescription

let package = Package(
    name: "SarfCore",
    platforms: [.iOS(.v18)],
    products: [
        .library(name: "SarfCore", targets: ["SarfCore"]),
    ],
    targets: [
        .target(
            name: "SarfCore",
            swiftSettings: [.swiftLanguageMode(.v6)]
        ),
        .testTarget(
            name: "SarfCoreTests",
            dependencies: ["SarfCore"],
            swiftSettings: [.swiftLanguageMode(.v6)]
        ),
    ]
)
