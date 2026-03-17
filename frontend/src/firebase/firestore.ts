import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, DocumentSnapshot } from "firebase/firestore";
import { DelaySummary, ByStopChunkDocument } from "../types/historicalDelay";

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
const BY_STOP_CHUNK_COUNT = 1024;

// Same hash function as used in gtfsAggregation
// to determine which chunk a stop belongs to.
function hashToChunk(stopKey: string): number {
    let hash = 0x811c9dc5;

    for (let index = 0; index < stopKey.length; index += 1) {
        hash ^= stopKey.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }

    return hash % BY_STOP_CHUNK_COUNT;
}

export function fetchStopDelays(
    stopPointGIDs: string[],
    date: string
): Promise<DelaySummary[] | null> {
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

    function processDocsACB(docs: DocumentSnapshot[]): DelaySummary[] {
        const results: DelaySummary[] = [];

        function processDocCB(docSnapshot: DocumentSnapshot) {
            if (!docSnapshot.exists()) {
                return;
            }

            const chunkData = docSnapshot.data() as ByStopChunkDocument;

            function processStopCB(stop: DelaySummary) {
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

export function fetchRouteDelays(date: string): Promise<DelaySummary[] | null> {
    const byRouteDocRef = doc(db, date, "byRoute");

    function processDocACB(docSnapshot: DocumentSnapshot): DelaySummary[] | null {
        if (!docSnapshot.exists()) {
            return null;
        }
        return docSnapshot.data().byRoute as DelaySummary[];
    }

    function catchErrorACB(error: unknown) {
        console.error(error);
        return null;
    }

    return getDoc(byRouteDocRef).then(processDocACB).catch(catchErrorACB);
}

// get dates for which aggregated data is available in firestore
export function fetchAggregatedDates(): Promise<string[]> {
    const dateIndexDocRef = doc(db, "index", "dates");

    function processDocACB(docSnapshot: DocumentSnapshot): string[] {
        if (!docSnapshot.exists()) {
            return [];
        }
        return docSnapshot.data().dates as string[];
    }

    function catchErrorACB(error: unknown) {
        console.error(error);
        return [];
    }

    return getDoc(dateIndexDocRef).then(processDocACB).catch(catchErrorACB);
}
