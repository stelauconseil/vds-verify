import CoreImage
import Vision

// Plain Vision/Core Image so it also builds on macOS for testing against sample pages.
func detectCodes(in image: CIImage) throws -> [String] {
  let codes = try detect(image)
  // A full-resolution photo gains nothing from upscaling, only memory.
  if !codes.isEmpty || max(image.extent.width, image.extent.height) > 2000 { return codes }
  // A small dense 2D-Doc (~2 cm on A4) on a ~1200 px page has too few pixels per module for
  // Vision; a 2x upscale + light unsharp recovers it. It does not recover blur or B&W-filtered scans.
  let upscaled = image
    .applyingFilter("CILanczosScaleTransform", parameters: ["inputScale": 2.0])
    .applyingFilter("CIUnsharpMask", parameters: ["inputRadius": 1.0, "inputIntensity": 0.5])
  return try detect(upscaled)
}

private func detect(_ image: CIImage) throws -> [String] {
  let request = VNDetectBarcodesRequest()
  request.symbologies = [.dataMatrix, .qr]
  try VNImageRequestHandler(ciImage: image, options: [:]).perform([request])
  return (request.results ?? []).compactMap { $0.payloadStringValue }
}
