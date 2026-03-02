# Disease–Pathway–Drug Recommendation Platform

## Current State
New project. No existing files or codebase.

## Requested Changes (Diff)

### Add
- Full-stack application: Disease–Pathway–Drug Recommendation Platform
- Disease search input where user types a disease name
- Backend logic that queries/maps disease → affected pathways → enzymes/protein targets → suggested drugs
- HTTP outcalls to public biological databases: KEGG REST API, UniProt REST API, NCBI E-utilities, DrugBank (public data)
- AI prediction layer: ranks intervention points with confidence scores, summarizes mechanism of action
- Interactive results visualization: tabular view and network/graph view showing disease → pathway → enzyme → drug chains
- Confidence scores/rankings for each intervention point
- Direct links to external database pages (KEGG, UniProt, DrugBank, NCBI) for each entity
- Database browser section allowing users to navigate and search directly within KEGG, UniProt, DrugBank, and NCBI from the app

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan

### Backend (Motoko)
1. Data types: Disease, Pathway, Enzyme/Protein, Drug, InterventionPoint with confidence scores
2. Query handler: accepts disease name, returns structured recommendation result
3. HTTP outcalls to KEGG REST API (pathway search by disease keyword)
4. HTTP outcalls to UniProt REST API (protein/enzyme search by pathway or gene name)
5. HTTP outcalls to NCBI E-utilities (PubMed/Gene search for disease context)
6. Curated fallback data for well-known diseases (Type 2 Diabetes, Cancer, Alzheimer's, COVID-19, Hypertension) to ensure results even if live API calls are slow
7. Confidence scoring algorithm based on number of supporting database hits, pathway relevance, and drug approval status
8. Drug mechanism of action summarization (curated + pattern-based)
9. Store recent searches/results for session caching

### Frontend (React + TypeScript)
1. Futuristic galaxy-themed UI: deep space background, nebula gradients, glowing star particles
2. Hero section with platform name, tagline, animated star field background
3. Disease search bar with autocomplete suggestions and animated submit
4. Results panel with 3 tabs: Pathways, Protein Targets, Drug Recommendations
5. Interactive network graph visualization (using D3 or similar) showing disease → pathway → enzyme → drug connections
6. Data table view with sortable columns, confidence score bars, external database links
7. Database access section: embedded search/link panels for KEGG, UniProt, DrugBank, NCBI with direct deep-link URLs
8. Confidence score indicators (color-coded bars, numerical scores)
9. Drug cards with mechanism of action, approval status, target enzyme, external links
10. Loading states with animated galaxy spinner
11. Responsive layout
