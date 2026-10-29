// swift-tools-version: 6.0
//
// SarfQuiz: the quiz logic and the text that goes with it. It builds on
// SarfCore and has no UI and no app settings. Nothing is built here yet.

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
