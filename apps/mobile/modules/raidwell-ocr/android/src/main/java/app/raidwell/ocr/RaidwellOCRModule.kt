package app.raidwell.ocr
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
class RaidwellOCRModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("RaidwellOCR")
    AsyncFunction("recognize") { uri: String, _: List<String>, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) { promise.reject("E_CONTEXT", "Application context is unavailable", null); return@AsyncFunction }
      val parsed = Uri.parse(uri)
      if (parsed.scheme != "file" && parsed.scheme != "content") { promise.reject("E_URI", "Choose an image from this device", null); return@AsyncFunction }
      try {
        val image = InputImage.fromFilePath(context, parsed)
        val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
        recognizer.process(image)
          .addOnSuccessListener { result -> promise.resolve(mapOf("text" to result.text, "engine" to "Google ML Kit · on device")) }
          .addOnFailureListener { error -> promise.reject("E_RECOGNITION", error.message, error) }
          .addOnCompleteListener { recognizer.close() }
      } catch (error: Exception) { promise.reject("E_IMAGE", "Could not read the selected image", error) }
    }
  }
}
