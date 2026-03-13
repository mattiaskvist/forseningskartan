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

export function fetchStopDelays(
    stopPointGIDs: string[],
    date: string
): Promise<StopDelaySummary[] | null> {
    const chunkIds = new Set<string>();

    // Get unique chunks that we need to download
    for (const stopId of stopPointGIDs) {
        const chunkId = `chunk_${hashToChunk(stopId)}`;
        chunkIds.add(chunkId);
    }

    // Create promise for each chunk download
    function createChunkPromiseCB(chunkId: string): Promise<DocumentSnapshot> {
        const byStopDocRef = doc(db, date, "byStop", chunkId, "data");
        console.log(`Fetching stop delay chunk: ${chunkId}`);
        return getDoc(byStopDocRef);
    }
    const chunkPromises = Array.from(chunkIds).map(createChunkPromiseCB);

    console.log(stopPointGIDs);

    function processDocsACB(docs: DocumentSnapshot[]): StopDelaySummary[] {
        const results: StopDelaySummary[] = [];

        function processDocCB(docSnapshot: DocumentSnapshot) {
            if (!docSnapshot.exists()) {
                return;
            }

            const chunkData = docSnapshot.data() as ByStopChunkDocument;

            function processStopCB(stop: StopDelaySummary) {
                if (stopPointGIDs.includes(stop.key)) {
                    results.push(stop);
                }
            }

            chunkData.stops.forEach(processStopCB);
        }

        docs.forEach(processDocCB);

        return results;
    }

    function catchErrorACB(error: unknown) {
        console.error(error);
        return null;
    }

    return Promise.all(chunkPromises).then(processDocsACB).catch(catchErrorACB);
}
