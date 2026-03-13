import { useEffect } from "react";
import {
  playDealClosed, playRejection, playHomeRun, playLemon, playSolid, playEvent,
} from "../utils/sound";

export default function Popup({ popup, onClose }) {
  useEffect(() => {
    if (!popup) return;
    switch (popup.type) {
      case "homerun": playHomeRun(); break;
      case "lemon": playLemon(); break;
      case "solid": playSolid(); break;
      case "rejected": playRejection(); break;
      case "event-positive": playEvent(); break;
      case "event-negative": playEvent(); break;
      case "closure": playLemon(); break;
      case "downturn-start": playEvent(); break;
      case "downturn-end": playHomeRun(); break;
      default: break;
    }
  }, [popup]);

  if (!popup) return null;

  const typeClass = {
    homerun: "popup-homerun",
    lemon: "popup-lemon",
    solid: "popup-solid",
    rejected: "popup-rejected",
    "event-positive": "popup-event-pos",
    "event-negative": "popup-event-neg",
    info: "popup-info",
    error: "popup-error",
    closure: "popup-closure",
    "downturn-start": "popup-downturn",
    "downturn-end": "popup-recovery",
  }[popup.type] || "popup-info";

  const dismissText = {
    rejected: "MOVE ON",
    lemon: "ACCEPT YOUR FATE",
    homerun: "CELEBRATE",
    closure: "NOTED.",
    "downturn-start": "SURVIVE.",
    "downturn-end": "FINALLY.",
    error: "UGH.",
  }[popup.type] || "OK";

  return (
    <div className={`popup-overlay ${typeClass}`} onClick={onClose}>
      <div className={`popup-box ${typeClass} ${popup.type === "lemon" || popup.type === "closure" ? "popup-shake" : ""}`}>
        {popup.locationName && (
          <p className="popup-location">{popup.locationName}</p>
        )}
        <h2 className="popup-message">{popup.message}</h2>
        <p className="popup-subtext">{popup.subtext}</p>
        {popup.cashFlow !== undefined && popup.cashFlow !== null && popup.cashFlow !== 0 && (
          <p className={`popup-cashflow ${popup.cashFlow < 0 ? "popup-cashflow-neg" : ""}`}>
            {popup.cashFlow >= 0 ? "+" : ""}${popup.cashFlow.toLocaleString()}/mo
          </p>
        )}
        <button className="popup-dismiss" onClick={onClose}>
          {dismissText}
        </button>
      </div>
    </div>
  );
}
