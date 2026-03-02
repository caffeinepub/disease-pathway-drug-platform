import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DrugRecommendation {
    id: string;
    pubchemId: string;
    drugbankId: string;
    name: string;
    mechanismOfAction: string;
    confidenceScore: bigint;
    approvalStatus: string;
    targetProteinId: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Pathway {
    id: string;
    source: string;
    keggId: string;
    name: string;
    description: string;
    confidenceScore: bigint;
}
export interface DiseaseResult {
    ncbiDiseaseId?: string;
    pathways: Array<Pathway>;
    totalConfidence: bigint;
    diseaseName: string;
    searchTimestamp: bigint;
    drugs: Array<DrugRecommendation>;
    proteins: Array<ProteinTarget>;
}
export interface DatabaseStatus {
    drugbank: boolean;
    kegg: boolean;
    ncbi: boolean;
    pubchem: boolean;
    uniprot: boolean;
}
export interface SearchHistoryEntry {
    drugsFound: bigint;
    diseaseName: string;
    timestamp: bigint;
    pathwaysFound: bigint;
}
export interface ProteinTarget {
    id: string;
    function: string;
    pathwayId: string;
    name: string;
    confidenceScore: bigint;
    uniprotId: string;
    geneName: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    getDatabaseStatus(): Promise<DatabaseStatus>;
    getSearchHistory(): Promise<Array<SearchHistoryEntry>>;
    getSuggestedDiseases(): Promise<Array<string>>;
    searchDisease(diseaseName: string): Promise<DiseaseResult>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
