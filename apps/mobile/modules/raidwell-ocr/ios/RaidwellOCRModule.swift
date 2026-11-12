import ExpoModulesCore
import Vision
import UIKit
import ImageIO
public class RaidwellOCRModule: Module {
  public func definition() -> ModuleDefinition {
    Name("RaidwellOCR")
    AsyncFunction("recognize") { (uri: String, words: [String], promise: Promise) in
      DispatchQueue.global(qos: .userInitiated).async {
        guard let url = URL(string: uri), url.isFileURL,
              let image = UIImage(contentsOfFile: url.path), let cgImage = image.cgImage else {
          promise.reject("E_IMAGE", "Could not read the selected image"); return
        }
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["en-US"]
        request.usesLanguageCorrection = false
        request.customWords = words
        let orientation: CGImagePropertyOrientation
        switch image.imageOrientation {
        case .up: orientation = .up
        case .down: orientation = .down
        case .left: orientation = .left
        case .right: orientation = .right
        case .upMirrored: orientation = .upMirrored
        case .downMirrored: orientation = .downMirrored
        case .leftMirrored: orientation = .leftMirrored
        case .rightMirrored: orientation = .rightMirrored
        @unknown default: orientation = .up
        }
        do {
          try VNImageRequestHandler(cgImage: cgImage, orientation: orientation).perform([request])
          let text = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
          promise.resolve(["text": text, "engine": "Apple Vision · on device"])
        } catch { promise.reject("E_RECOGNITION", "Text recognition failed", error) }
      }
    }
  }
}
