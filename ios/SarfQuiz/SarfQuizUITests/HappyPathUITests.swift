// The happy-path UI test from the technical plan (§B.6): start a drill,
// answer every question, land on results. Content-agnostic — it always taps
// the first option, only checking that the flow never stalls.

import XCTest

final class HappyPathUITests: XCTestCase {
    func testDrillFlowReachesResults() {
        let app = XCUIApplication()
        app.launch()

        // Form I tab → first available drill.
        let start = app.buttons["Start"].firstMatch
        XCTAssertTrue(start.waitForExistence(timeout: 5), "no Start button on the Form I tab")
        start.tap()

        // Answer until the results screen appears. A drill is 5 words × 3
        // questions = 15, but a doer question can occasionally be skipped,
        // so loop on what's on screen rather than a fixed count.
        let firstOption = app.buttons["option-0"]
        let advance = app.buttons["advance"]
        let resultsTitle = app.staticTexts["results-title"]

        for _ in 0..<40 {
            if resultsTitle.exists { break }
            XCTAssertTrue(firstOption.waitForExistence(timeout: 5), "expected a question on screen")
            firstOption.tap()
            XCTAssertTrue(advance.waitForExistence(timeout: 5), "answer produced no Next button")
            advance.tap()
        }

        XCTAssertTrue(resultsTitle.waitForExistence(timeout: 5), "never reached the results screen")

        // Results → new round puts a fresh question on screen. The button is
        // at the bottom of a long screen and XCUITest doesn't auto-scroll.
        let newRound = app.buttons["New round (same setup)"]
        XCTAssertTrue(newRound.waitForExistence(timeout: 5), "results screen has no new-round button")
        for _ in 0..<6 where !newRound.isHittable { app.swipeUp() }
        newRound.tap()
        XCTAssertTrue(firstOption.waitForExistence(timeout: 5), "new round did not start a quiz")
    }
}
