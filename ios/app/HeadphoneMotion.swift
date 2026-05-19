import AVFoundation
import CoreMotion
import Foundation
import React

@objc(HeadphoneMotion)
class HeadphoneMotion: RCTEventEmitter, CMHeadphoneMotionManagerDelegate {
  private let manager = CMHeadphoneMotionManager()
  private let queue = OperationQueue()
  private var hasListeners = false
  private var activeSessionCount = 0
  private let headphonePortTypes: Set<AVAudioSession.Port> = [
    .bluetoothA2DP,
    .bluetoothHFP,
    .bluetoothLE,
    .headphones,
  ]

  override init() {
    super.init()
    manager.delegate = self
    queue.name = "HeadphoneMotionQueue"
    queue.qualityOfService = .userInteractive
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleRouteChange),
      name: AVAudioSession.routeChangeNotification,
      object: AVAudioSession.sharedInstance()
    )
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }

  override static func requiresMainQueueSetup() -> Bool {
    false
  }

  override func supportedEvents() -> [String]! {
    ["HeadphoneMotionUpdate", "HeadphoneMotionAvailabilityChanged", "HeadphoneWearStateChanged"]
  }

  override func startObserving() {
    hasListeners = true
  }

  override func stopObserving() {
    hasListeners = false
  }

  @objc
  func isAvailable(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve(manager.isDeviceMotionAvailable)
  }

  @objc
  func isWorn(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve(isHeadphoneAudioRouteActive())
  }

  @objc
  func startUpdates() {
    activeSessionCount += 1

    guard manager.isDeviceMotionAvailable else {
      sendAvailability(false)
      return
    }

    if manager.isDeviceMotionActive {
      sendAvailability(true)
      return
    }

    sendAvailability(true)
    manager.startDeviceMotionUpdates(to: queue) { [weak self] motion, _ in
      guard let self, let motion, self.hasListeners else { return }

      self.sendToReact(name: "HeadphoneMotionUpdate", body: [
        "pitch": motion.attitude.pitch * 180 / .pi,
        "yaw": motion.attitude.yaw * 180 / .pi,
        "roll": motion.attitude.roll * 180 / .pi,
      ])
    }
  }

  @objc
  func stopUpdates() {
    activeSessionCount = max(activeSessionCount - 1, 0)
    guard activeSessionCount == 0 else { return }
    manager.stopDeviceMotionUpdates()
    sendAvailability(manager.isDeviceMotionAvailable)
  }

  func headphoneMotionManagerDidConnect(_ manager: CMHeadphoneMotionManager) {
    sendAvailability(manager.isDeviceMotionAvailable)
    sendWearState()
  }

  func headphoneMotionManagerDidDisconnect(_ manager: CMHeadphoneMotionManager) {
    sendAvailability(false)
    sendWearState()
  }

  private func sendAvailability(_ available: Bool) {
    guard hasListeners else { return }
    sendToReact(name: "HeadphoneMotionAvailabilityChanged", body: [
      "available": available,
    ])
  }

  @objc
  private func handleRouteChange() {
    sendWearState()
  }

  private func sendWearState() {
    guard hasListeners else { return }
    sendToReact(name: "HeadphoneWearStateChanged", body: [
      "worn": isHeadphoneAudioRouteActive(),
    ])
  }

  private func isHeadphoneAudioRouteActive() -> Bool {
    AVAudioSession.sharedInstance().currentRoute.outputs.contains { output in
      headphonePortTypes.contains(output.portType)
    }
  }

  private func sendToReact(name: String, body: [String: Any]) {
    DispatchQueue.main.async { [weak self] in
      guard let self, self.hasListeners else { return }
      self.sendEvent(withName: name, body: body)
    }
  }
}
