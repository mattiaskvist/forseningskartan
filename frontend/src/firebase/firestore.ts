import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, DocumentSnapshot } from "firebase/firestore";
import { DelaySummary } from "../types/historicalDelay";

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
const BY_ROUTE_CHUNK_COUNT = 16;

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

type CompactDelayStats = { c: number; a: number };

type CompactSummary = {
    k: string;
    r?: { sn: string; ln: string; t: NonNullable<DelaySummary["route"]>["type"] };
    s?: { n: string };
    h?: CompactSummary[];
    br?: CompactSummary[];
    stu: number;
    ac: number;
    dc: number;
    ut: number;
    ad: CompactDelayStats;
    dd: CompactDelayStats;
    aa: CompactDelayStats;
    da: CompactDelayStats;
};

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
        stopTimeUpdates: summary.stu,
        arrivalEventCount: summary.ac,
        departureEventCount: summary.dc,
        uniqueTrips: summary.ut,
        arrivalDelayStats: mapDelayStats(summary.ad),
        departureDelayStats: mapDelayStats(summary.dd),
        arrivalAheadStats: mapDelayStats(summary.aa),
        departureAheadStats: mapDelayStats(summary.da),
    };
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

            const chunkData = docSnapshot.data() as { s?: CompactSummary[] };
            if (!chunkData.s) {
                return;
            }

            function processStopCB(rawStop: CompactSummary) {
                const stop = mapSummary(rawStop);
                if (stopPointGIDs.includes(stop.key)) {
                    results.push(stop);
                }
            }

            chunkData.s.forEach(processStopCB);
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

    async function processDocACB(docSnapshot: DocumentSnapshot): Promise<DelaySummary[] | null> {
        if (!docSnapshot.exists()) {
            return null;
        }

        const data = docSnapshot.data() as { br?: CompactSummary[] };
        if (data.br) {
            return data.br.map(mapSummary);
        }

        const chunkPromises = Array.from({ length: BY_ROUTE_CHUNK_COUNT }, (_, chunkIdx) =>
            getDoc(doc(db, date, "byRoute", `chunk_${chunkIdx}`, "data"))
        );
        const chunkDocs = await Promise.all(chunkPromises);
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
