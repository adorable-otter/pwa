"use server";
import webpush from "web-push";

interface PushSubscriptionWithKeys extends PushSubscription {
  keys: {
    p256dh: string;
    auth: string;
  };
}

webpush.setVapidDetails(
  "mailto:여러분의 이메일 작성",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

const subscriptions: PushSubscriptionWithKeys[] = [];

export async function subscribeUser(sub: PushSubscription) {
  const subWithKeys = sub as PushSubscriptionWithKeys;

  const isExisting = subscriptions.some(
    (s) => s.endpoint === subWithKeys.endpoint,
  );

  if (!isExisting) {
    subscriptions.push(subWithKeys);
    console.log("New subscription added:", subWithKeys);
  } else {
    console.log("Subscription already exists:", subWithKeys);
  }

  console.log("Current subscriptions:", subscriptions);
  return { success: true };
}

export async function sendNotification(
  subscription: PushSubscription,
  message: string,
) {
  try {
    const subscriptionWithKeys =
      subscription as unknown as PushSubscriptionWithKeys;

    await webpush.sendNotification(
      {
        endpoint: subscriptionWithKeys.endpoint,
        keys: {
          p256dh: subscriptionWithKeys.keys.p256dh,
          auth: subscriptionWithKeys.keys.auth,
        },
      },
      JSON.stringify({
        title: "테스트 알림",
        body: message || "웹 푸시 알림 본문입니다.",
        icon: "/icons/icon-192x192.png",
        badge: "/badge.png",
      }),
    );

    console.log("알림 전송 성공");
    return { success: true };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
