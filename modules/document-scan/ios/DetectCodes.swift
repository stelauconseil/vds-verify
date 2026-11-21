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

// Codes in an image or PDF file. PDF pages are rendered one by one, stopping at the first page
// that carries a code (2D-Docs are almost always on the first page).
func detectCodes(inFile url: URL) throws -> [String] {
  if let pdf = CGPDFDocument(url as CFURL) {
    guard !pdf.isEncrypted || pdf.unlockWithPassword("") else { throw FileError.locked }
    for index in 0..<pdf.numberOfPages {
      guard let page = pdf.page(at: index + 1), let image = render(page) else { continue }
      let codes = try detectCodes(in: image)
      if !codes.isEmpty { return codes }
    }
    return []
  }
  guard let image = CIImage(contentsOf: url, options: [.applyOrientationProperty: true]) else {
    throw FileError.unreadable
  }
  return try detectCodes(in: image)
}

enum FileError: Error { case locked, unreadable }

// ~3000 px on the long side: a 2 cm 2D-Doc on A4 gets ~200 px, plenty for Vision.
private func render(_ page: CGPDFPage) -> CIImage? {
  let box = page.getBoxRect(.cropBox)
  let rotated = page.rotationAngle % 180 != 0
  let size = rotated ? CGSize(width: box.height, height: box.width) : box.size
  guard size.width > 0, size.height > 0 else { return nil }
  let scale = 3000 / max(size.width, size.height)
  let width = Int(size.width * scale), height = Int(size.height * scale)
  guard let context = CGContext(
    data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
    space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
  else { return nil }
  context.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))  // PDFs have no background
  context.fill(CGRect(x: 0, y: 0, width: width, height: height))
  context.interpolationQuality = .high
  // getDrawingTransform never scales up: scale here, it only handles origin and /Rotate.
  context.scaleBy(x: scale, y: scale)
  let target = CGRect(origin: .zero, size: size)
  context.concatenate(page.getDrawingTransform(.cropBox, rect: target, rotate: 0, preserveAspectRatio: true))
  context.drawPDFPage(page)
  return context.makeImage().map { CIImage(cgImage: $0) }
}
