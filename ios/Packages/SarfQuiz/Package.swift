// swift-tools-version: 6.0
//
// SarfQuiz — the quiz rules and the copy that belongs to them: plan, pool,
// relevance, the builders, grading, and the run.
//
// Separate from SarfCore because the two settle at different rates — SarfCore
// freezes at B3, this churns — and separate from the app because "no UI in quiz
// rules" should be a compile error. It cannot import SwiftUI and it cannot
// import the app's Settings; anything gated arrives as a value (a list of
// playable verb types, not a flag).
//
// It is also the concurrency boundary (PORT_INVENTORY §3.3f): nothing here is
// actor-isolated, so WordPool's per-chip-tap recount can run off the main actor
// via Task.detached without blocking a keystroke.
//
// Nothing is built here yet: Q1–Q3 fill it (IOS_PORT_PLAN).

import PackageDescription

let package = Package(
    name: "SarfQuiz",
    platforms: [.iOS(.v18)],
    products: [
        .library(name: "SarfQuiz", targets: ["SarfQuiz"]),
    ],
    dependencies: [
        .package(path: "../SarfCore"),
    ],
    targets: [
        .target(
            name: "SarfQuiz",
            dependencies: ["SarfCore"],
            swiftSettings: [.swiftLanguageMode(.v6)]
        ),
        .testTarget(
            name: "SarfQuizTests",
            dependencies: ["SarfQuiz"],
            swiftSettings: [.swiftLanguageMode(.v6)]
        ),
    ]
)
