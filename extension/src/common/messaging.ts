/**
 * HERO Wallet Extension — Message Passing Utilities
 * Handles communication between popup, background, and content scripts
 * Pattern: AmbireTech controller-messenger architecture
 */

import { ExtensionMessage, MessageType } from './types';

let messageCounter = 0;

/** Create a typed message with auto-generated ID and timestamp */
export function createMessage<T>(type: MessageType, payload: T): ExtensionMessage<T> {
  return {
    type,
    payload,
    id: `hero-msg-${Date.now()}-${++messageCounter}`,
    timestamp: Date.now(),
  };
}

/** Send a message to the background service worker */
export async function sendToBackground<T, R = unknown>(
  type: MessageType,
  payload: T
): Promise<R> {
  const message = createMessage(type, payload);
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response as R);
    });
  });
}

/** Send a message to a specific tab's content script */
export async function sendToTab<T>(
  tabId: number,
  type: MessageType,
  payload: T
): Promise<void> {
  const message = createMessage(type, payload);
  await chrome.tabs.sendMessage(tabId, message);
}

/** Listen for messages of a specific type */
export function onMessage<T>(
  type: MessageType,
  handler: (payload: T, sender: chrome.runtime.MessageSender) => Promise<unknown> | unknown
): void {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage<T>, sender, sendResponse) => {
    if (message.type !== type) return false;

    const result = handler(message.payload, sender);
    if (result instanceof Promise) {
      result.then(sendResponse).catch((err) => sendResponse({ error: err.message }));
      return true; // Keep channel open for async response
    }

    sendResponse(result);
    return false;
  });
}

/** Broadcast state update to all extension views */
export function broadcastStateUpdate<T>(payload: T): void {
  const message = createMessage(MessageType.STATE_UPDATE, payload);
  // Send to popup if open
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup not open, ignore
  });
}
