// swift-tools-version: 5.8
import PackageDescription

let package = Package(
    name: "SarfCore",
    platforms: [
        .iOS(.v16),
        .macOS(.v13),
    ],
    products: [
        .library(name: "SarfCore", targets: ["SarfCore"]),
    ],
    targets: [
        .target(
            name: "SarfCore",
            resources: [.process("Resources")]
        ),
        // The engine test suite (ported 1:1 from web-prototype/test/smoke.mjs).
        // It is an executable rather than an XCTest target because this machine
        // has Command Line Tools only (XCTest ships with full Xcode). Run with:
        //   swift run SarfSmokeTests
        // When the Xcode app project is created in Phase 2, these assertions
        // move into an XCTest target unchanged.
        .executableTarget(
            name: "SarfSmokeTests",
            dependencies: ["SarfCore"]
        ),
    ]
)
