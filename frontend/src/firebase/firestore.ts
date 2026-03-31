import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, DocumentSnapshot } from "firebase/firestore";
import { DelaySummary, CompactDelayStats, CompactSummary } from "../types/historicalDelay";

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
const BY_ROUTE_CHUNK_COUNT = 16;

function mapDelayStats(stats: CompactDelayStats): DelaySummary["arrivalDelayStats"] {
    return { count: stats.c, avgSeconds: stats.a };
}

function mapSummary(summary: CompactSummary): DelaySummary {
    return {
        key: summary.k,
        route: summary.r
            ? { shortName: summary.r.sn, longName: summary.r.ln, type: summary.r.t }
            : undefined,
        stop: summary.s ? { name: summary.s.n } : undefined,
        byHour: summary.h?.map(mapSummary),
        byRoute: summary.br?.map(mapSummary),
        arrivalEventCount: summary.ac,
        departureEventCount: summary.dc,
        uniqueTrips: summary.ut,
        arrivalDelayStats: mapDelayStats(summary.ad),
        departureDelayStats: mapDelayStats(summary.dd),
        arrivalAheadStats: mapDelayStats(summary.aa),
        departureAheadStats: mapDelayStats(summary.da),
    };
}

export function fetchRouteDelays(date: string): Promise<DelaySummary[] | null> {
    function processChunkDocsCB(chunkDocs: DocumentSnapshot[]): DelaySummary[] {
        const result: DelaySummary[] = [];

        function processChunkCB(chunkDoc: DocumentSnapshot) {
            if (!chunkDoc.exists()) {
                return;
            }

            const chunkData = chunkDoc.data() as { r?: CompactSummary[] };
            if (!chunkData.r) {
                return;
            }

            result.push(...chunkData.r.map(mapSummary));
        }

        chunkDocs.forEach(processChunkCB);
        result.sort((a, b) => a.key.localeCompare(b.key));
        return result;
    }

    function catchErrorACB(error: unknown) {
        console.error(error);
        return null;
    }

    const chunkPromises = Array.from({ length: BY_ROUTE_CHUNK_COUNT }, (_, chunkIdx) =>
        getDoc(doc(db, date, "byRoute", `chunk_${chunkIdx}`, "data"))
    );
    return Promise.all(chunkPromises).then(processChunkDocsCB).catch(catchErrorACB);
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
