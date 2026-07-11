#!/bin/bash
# Builds and runs the SarfCore engine test suite with swiftc directly.
#
# This exists because Command Line Tools (without full Xcode) can't run
# `swift build` — SwiftPM fails looking up the XCTest platform path. Once
# Xcode is installed, prefer the standard route:
#
#   swift run SarfSmokeTests
#
set -euo pipefail
cd "$(dirname "$0")"

BUILD_DIR=.build-clt
mkdir -p "$BUILD_DIR"

swiftc -O \
  Sources/SarfCore/*.swift \
  Sources/SarfSmokeTests/main.swift \
  -o "$BUILD_DIR/SarfSmokeTests"

"$BUILD_DIR/SarfSmokeTests" Sources/SarfCore/Resources
