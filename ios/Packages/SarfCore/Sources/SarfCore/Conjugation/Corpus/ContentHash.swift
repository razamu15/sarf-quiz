// The hash the corpus records for the roots.json it was exported from.

import CommonCrypto
import Foundation

/// "sha256:" and the SHA-256 of the bytes in hex, the way the exporter writes it.
///
/// CommonCrypto rather than CryptoKit: CryptoKit needs a macOS platform, and
/// this package declares only iOS.
///
/// Used by: ConjugationService.load.
func contentHash(of data: Data) -> String {
    var digest = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
    data.withUnsafeBytes { bytes in
        _ = CC_SHA256(bytes.baseAddress, CC_LONG(bytes.count), &digest)
    }
    return "sha256:" + digest.map { String(format: "%02x", $0) }.joined()
}
