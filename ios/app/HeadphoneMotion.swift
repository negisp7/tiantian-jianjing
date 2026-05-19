import CoreMotion
import Foundation
import React

@objc(HeadphoneMotion)
class HeadphoneMotion: RCTEventEmitter, CMHeadphoneMotionManagerDelegate {
  private let manager = CMHeadphoneMotionManager()
  private let queue = OperationQueue()
  private var hasListeners = false
  private var activeSessionCount = 0

  override init() {
    super.init()
    manager.delegate = self
    queue.name = "HeadphoneMotionQueue"
    queue.qualityOfService = .userInteractive
  }

  override static func requiresMainQueueSetup() -> Bool {
    false
  }

  override func supportedEvents() -> [String]! {
    ["HeadphoneMotionUpdate", "HeadphoneMotionAvailabilityChanged"]
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
  }

  func headphoneMotionManagerDidDisconnect(_ manager: CMHeadphoneMotionManager) {
    sendAvailability(false)
  }

  private func sendAvailability(_ available: Bool) {
    guard hasListeners else { return }
    sendToReact(name: "HeadphoneMotionAvailabilityChanged", body: [
      "available": available,
    ])
  }

  private func sendToReact(name: String, body: [String: Any]) {
    DispatchQueue.main.async { [weak self] in
      guard let self, self.hasListeners else { return }
      self.sendEvent(withName: name, body: body)
    }
  }
}
