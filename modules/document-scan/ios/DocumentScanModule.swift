import AVFoundation
import ExpoModulesCore
import VisionKit

// Presents VisionKit's scanner itself rather than through expo-camera's scanDocumentAsync:
// - pages are read in memory, and expo-camera's image scan is QR-only on iOS (no 2D-Doc / DataMatrix);
// - it waits for the live camera to be released first: expo-camera stops its session
//   asynchronously, and a session still running when VisionKit starts takes the camera from it
//   (black scanner, no controls).
// iOS 27.2 on iPhone Duo froze the camera system-wide after a few VisionKit scans (Apple Notes
// too); 27.3 beta seems to fix it.
public class DocumentScanModule: Module {
  private var delegate: ScanDelegate?
  private var runningSessions = Set<ObjectIdentifier>()
  private var cameraFreeWaiters: [() -> Void] = []
  private var observers: [NSObjectProtocol] = []

  public func definition() -> ModuleDefinition {
    Name("DocumentScan")

    OnCreate {
      let center = NotificationCenter.default
      self.observers = [
        center.addObserver(forName: .AVCaptureSessionDidStartRunning, object: nil, queue: .main) {
          [weak self] note in
          guard let session = note.object as AnyObject? else { return }
          self?.runningSessions.insert(ObjectIdentifier(session))
        },
        center.addObserver(forName: .AVCaptureSessionDidStopRunning, object: nil, queue: .main) {
          [weak self] note in
          guard let self, let session = note.object as AnyObject? else { return }
          self.runningSessions.remove(ObjectIdentifier(session))
          if self.runningSessions.isEmpty { self.flushCameraFreeWaiters() }
        },
      ]
    }

    OnDestroy {
      self.observers.forEach(NotificationCenter.default.removeObserver)
    }

    AsyncFunction("scanDocumentAsync") { (promise: Promise) in
      guard VNDocumentCameraViewController.isSupported else {
        return promise.reject("ERR_UNAVAILABLE", "error_document_scanner_unavailable")
      }
      guard self.delegate == nil else {
        return promise.reject("ERR_BUSY", "error")
      }
      let scanner = VNDocumentCameraViewController()
      let controller = BelowStatusBarContainer(scanner)
      let delegate = ScanDelegate { [weak self] result in
        self?.delegate = nil
        controller.dismiss(animated: true) {
          switch result {
          case .failure(let error):
            promise.reject("ERR_SCAN", error.localizedDescription)
          case .success(nil):
            promise.resolve(nil)  // cancelled
          case .success(let images?):
            DispatchQueue.global(qos: .userInitiated).async {
              promise.resolve(images.flatMap { image -> [String] in
                guard let ci = CIImage(image: image) else { return [] }
                return (try? detectCodes(in: ci)) ?? []
              })
            }
          }
        }
      }
      self.delegate = delegate  // also marks a scan as in progress while waiting
      scanner.delegate = delegate
      self.whenCameraFree { [weak self] in
        guard let presenter = self?.appContext?.utilities?.currentViewController() else {
          self?.delegate = nil
          return promise.reject("ERR_SCAN", "error")
        }
        presenter.present(controller, animated: true)
      }
    }.runOnQueue(.main)

    // Imported file (image or PDF), runs on the module's background queue.
    AsyncFunction("detectCodesInFileAsync") { (url: URL) throws -> [String] in
      do {
        return try detectCodes(inFile: url)
      } catch FileError.locked {
        throw Exception(name: "ERR_LOCKED", description: "error_file_locked")
      } catch {
        // The label key first (JS extracts it), the cause after for diagnosis.
        throw Exception(name: "ERR_FILE", description: "error_file_unreadable: \(error)")
      }
    }
  }

  private func whenCameraFree(_ action: @escaping () -> Void) {
    if runningSessions.isEmpty { return action() }
    cameraFreeWaiters.append(action)
    // ponytail: don't hang if a session never reports stopping; 2 s covers a normal stop.
    DispatchQueue.main.asyncAfter(deadline: .now() + 2) { [weak self] in
      self?.flushCameraFreeWaiters()
    }
  }

  private func flushCameraFreeWaiters() {
    let waiters = cameraFreeWaiters
    cameraFreeWaiters = []
    waiters.forEach { $0() }
  }
}

private final class ScanDelegate: NSObject, VNDocumentCameraViewControllerDelegate {
  private let done: (Result<[UIImage]?, Error>) -> Void

  init(done: @escaping (Result<[UIImage]?, Error>) -> Void) {
    self.done = done
  }

  func documentCameraViewController(
    _ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan
  ) {
    done(.success((0..<scan.pageCount).map(scan.imageOfPage)))
  }

  func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
    done(.success(nil))
  }

  func documentCameraViewController(
    _ controller: VNDocumentCameraViewController, didFailWithError error: Error
  ) {
    done(.failure(error))
  }
}

// VisionKit lays its Save button out under the inner camera on iPhone Duo, whatever the
// presentation style: keep the scanner clear of it (right strip on Duo, status bar elsewhere).
private final class BelowStatusBarContainer: UIViewController {
  private let child: UIViewController

  init(_ child: UIViewController) {
    self.child = child
    super.init(nibName: nil, bundle: nil)
    modalPresentationStyle = .fullScreen
  }

  required init?(coder: NSCoder) { fatalError() }

  override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .black
    addChild(child)
    view.addSubview(child.view)
    child.didMove(toParent: self)
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    view.setNeedsLayout()  // the inner camera's occlusion appears once the scanner camera runs
  }

  override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    // iPhone Duo: the inner camera sits on the right edge, where the tab bar is. Give that strip
    // to the black band and keep the full height for the scanner.
    var right: CGFloat = 0
    if #available(iOS 27.1, *) {
      // ponytail: re-queried on layout only; add a UIHingeInteraction if folding mid-scan misplaces it.
      for region in view.reservedRegions(kind: .occlusion) where region.frame.maxX >= view.bounds.maxX - 1 {
        right = max(right, view.bounds.maxX - region.frame.minX)
      }
    }
    let insets = right > 0
      ? UIEdgeInsets(top: 0, left: 0, bottom: 0, right: right)
      : UIEdgeInsets(top: view.safeAreaInsets.top, left: 0, bottom: 0, right: 0)
    child.view.frame = view.bounds.inset(by: insets)
  }
}
