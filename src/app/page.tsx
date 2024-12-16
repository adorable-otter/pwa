"use client";

import { useState, useEffect } from "react";
import { subscribeUser, sendNotification } from "./actions";

export default function Home() {
  const [lottoNumbers, setLottoNumbers] = useState<number[][]>([]);
  const [message, setMessage] = useState("");
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        console.log("Service Worker registered:", registration);

        registration.pushManager.getSubscription().then((sub) => {
          if (sub) {
            console.log("Existing subscription:", sub);
            setSubscription(sub);
          }
        });
      });
    }
  }, []);

  const generateLottoNumbers = () => {
    const newLottoNumbers = Array.from({ length: 5 }, () => {
      const numbers = new Set<number>();
      while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
      }
      return Array.from(numbers).sort((a, b) => a - b);
    });
    setLottoNumbers(newLottoNumbers);
  };

  const subscribeToPush = async () => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      console.log("New subscription:", sub);
      await subscribeUser(sub);
      setSubscription(sub);
    }
  };

  const sendTestNotification = async () => {
    if (subscription) {
      await sendNotification(subscription, message);
      setMessage("");
    } else {
      alert("구독 정보가 없습니다. 알림 구독을 먼저 해주세요.");
    }
  };

  // Base64 변환 함수
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const getNumberColor = (num: number) => {
    if (num <= 10) return "bg-yellow-400 text-white";
    if (num <= 20) return "bg-red-400 text-white";
    if (num <= 30) return "bg-gray-400 text-white";
    if (num <= 40) return "bg-green-400 text-white";
    return "bg-blue-400 text-white";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          로또번호 생성 결과
        </h1>
        <button
          onClick={generateLottoNumbers}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition mb-6"
        >
          번호 생성하기
        </button>
        <div className="space-y-4">
          {lottoNumbers.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex justify-center items-center space-x-2"
            >
              {row.map((num, numIndex) => (
                <div
                  key={numIndex}
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold shadow ${getNumberColor(
                    num,
                  )}`}
                >
                  {num}
                </div>
              ))}
            </div>
          ))}
        </div>

        <hr className="my-6" />
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
          웹 푸시 알림 테스트
        </h2>
        {!subscription ? (
          <button
            onClick={subscribeToPush}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
          >
            알림 구독하기
          </button>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="알림 메시지 입력"
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none text-[#212121]"
            />
            <button
              onClick={sendTestNotification}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              알림 보내기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
