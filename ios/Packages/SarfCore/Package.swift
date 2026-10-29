// swift-tools-version: 6.0
//
// SarfCore: everything about Arabic verbs. The vocabulary, the lexicon of roots,
// and the engines that build words. It has no UI, no display text and no app
// settings, so none of those can creep in.

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
            // Generated files, bundled exactly as written (so .copy, not .process).
            resources: [
                .copy("Resources/roots.json"),
                .copy("Resources/golden-corpus.json"),
            ],
            swiftSettings: [.swiftLanguageMode(.v6)]
        ),
        .testTarget(
            name: "SarfCoreTests",
            dependencies: ["SarfCore"],
            swiftSettings: [.swiftLanguageMode(.v6)]
        ),
    ]
)
