package expo.modules.documentscan

import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream

// PDF pages as images for expo-camera's scanFromURLAsync (ML Kit), which reads images only.
// Scanning the live camera and photos stays in JS (modules/document-scan/index.ts).
class DocumentScanModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DocumentScan")

    AsyncFunction("pdfPageCountAsync") { uri: String -> open(uri) { it.pageCount } }

    // ~3000 px on the long side: a 2 cm 2D-Doc on A4 gets ~200 px. Returns a cache file:// URI.
    AsyncFunction("renderPdfPageAsync") { uri: String, index: Int ->
      open(uri) { renderer ->
        renderer.openPage(index).use { page ->
          val scale = 3000f / maxOf(page.width, page.height)
          val bitmap = Bitmap.createBitmap(
            (page.width * scale).toInt(), (page.height * scale).toInt(), Bitmap.Config.ARGB_8888
          )
          try {
            bitmap.eraseColor(Color.WHITE) // PDFs have no background; transparent reads as black
            page.render(bitmap, null, Matrix().apply { setScale(scale, scale) }, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
            val cache = appContext.reactContext?.cacheDir ?: throw CodedException("error")
            val file = File.createTempFile("pdf-page", ".png", cache)
            FileOutputStream(file).use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
            Uri.fromFile(file).toString()
          } finally {
            bitmap.recycle()
          }
        }
      }
    }
  }

  private fun <T> open(uri: String, block: (PdfRenderer) -> T): T {
    val path = Uri.parse(uri).path ?: throw CodedException("error_file_unreadable")
    val fd = try {
      ParcelFileDescriptor.open(File(path), ParcelFileDescriptor.MODE_READ_ONLY)
    } catch (e: Exception) {
      throw CodedException("error_file_unreadable", e)
    }
    val renderer = try {
      PdfRenderer(fd)
    } catch (e: SecurityException) {
      fd.close()
      throw CodedException("error_file_locked", e)
    } catch (e: Exception) {
      fd.close()
      throw CodedException("error_file_unreadable", e)
    }
    return renderer.use(block) // also closes fd
  }
}
