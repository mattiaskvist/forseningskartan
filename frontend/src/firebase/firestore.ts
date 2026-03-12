import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, DocumentSnapshot } from "firebase/firestore";
import { StopDelaySummary, ByStopChunkDocument } from "../types/historicalDelay";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Same hash function as used in gtfsAggregation
// to determine which chunk a stop belongs to.
function hashToChunk(stopKey: string): number {
    let hash = 0x811c9dc5;

    for (let index = 0; index < stopKey.length; index += 1) {
        hash ^= stopKey.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }

    return hash % 256;
}

export function getStopDelays(stopId: string, date: string): Promise<StopDelaySummary | null> {
    const chunkId = `chunk_${hashToChunk(stopId)}`;
    const byStopDocRef = doc(db, date, "byStop", chunkId, "data");

    function isCorrectStopCB(stop: StopDelaySummary) {
        return stop.key === stopId;
    }

    function handleDocACB(byStopDoc: DocumentSnapshot) {
        if (!byStopDoc.exists()) {
            return null;
        }

        const chunkData = byStopDoc.data() as ByStopChunkDocument;
        return chunkData.stops.find(isCorrectStopCB) ?? null;
    }

    function catchErrorACB(error: unknown) {
        console.error(error);
        return null;
    }

    return getDoc(byStopDocRef).then(handleDocACB).catch(catchErrorACB);
}
