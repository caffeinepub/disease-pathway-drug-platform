import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search } from "lucide-react";
import { useState } from "react";

interface DatabaseConfig {
  id: string;
  name: string;
  fullName: string;
  description: string;
  color: string;
  glowColor: string;
  homeUrl: string;
  searchUrl: (term: string) => string;
  placeholder: string;
  ocidKey: string;
}

const CORE_DATABASES: DatabaseConfig[] = [
  {
    id: "kegg",
    name: "KEGG",
    fullName: "Kyoto Encyclopedia of Genes and Genomes",
    description:
      "KEGG is a database resource for understanding high-level functions and utilities of the biological system, such as the cell, the organism, and the ecosystem, from molecular-level information. It provides comprehensive pathway maps, disease databases, and drug information.",
    color: "oklch(0.82 0.17 198)",
    glowColor: "oklch(0.82 0.17 198 / 0.3)",
    homeUrl: "https://www.kegg.jp",
    searchUrl: (term) =>
      `https://www.kegg.jp/kegg-bin/search?q=${encodeURIComponent(term)}&display=pathway`,
    placeholder: "Search pathways, genes, diseases...",
    ocidKey: "database.kegg.button",
  },
  {
    id: "uniprot",
    name: "UniProt",
    fullName: "Universal Protein Resource",
    description:
      "UniProt is a comprehensive, high-quality and freely accessible resource of protein sequence and functional information. It provides the most complete coverage of protein sequences and functional annotation for research.",
    color: "oklch(0.75 0.20 155)",
    glowColor: "oklch(0.75 0.20 155 / 0.3)",
    homeUrl: "https://www.uniprot.org",
    searchUrl: (term) =>
      `https://www.uniprot.org/uniprotkb?query=${encodeURIComponent(term)}`,
    placeholder: "Search proteins, genes, organisms...",
    ocidKey: "database.uniprot.button",
  },
  {
    id: "drugbank",
    name: "DrugBank",
    fullName: "Comprehensive Drug & Drug Target Database",
    description:
      "DrugBank Online is a comprehensive, freely accessible, online database containing information on drugs and drug targets. It combines detailed drug data with comprehensive drug target information including sequence, structure, and pathway details.",
    color: "oklch(0.55 0.22 295)",
    glowColor: "oklch(0.55 0.22 295 / 0.3)",
    homeUrl: "https://go.drugbank.com",
    searchUrl: (term) =>
      `https://go.drugbank.com/unearth/q?query=${encodeURIComponent(term)}`,
    placeholder: "Search drugs, compounds, targets...",
    ocidKey: "database.drugbank.button",
  },
  {
    id: "ncbi",
    name: "NCBI",
    fullName: "National Center for Biotechnology Information",
    description:
      "NCBI advances science and health by providing access to biomedical and genomic information. It hosts databases including PubMed, GenBank, Gene, Protein, and many others, making biological information freely available worldwide.",
    color: "oklch(0.88 0.18 85)",
    glowColor: "oklch(0.88 0.18 85 / 0.3)",
    homeUrl: "https://www.ncbi.nlm.nih.gov",
    searchUrl: (term) =>
      `https://www.ncbi.nlm.nih.gov/search/all/?term=${encodeURIComponent(term)}`,
    placeholder: "Search genes, proteins, literature...",
    ocidKey: "database.ncbi.button",
  },
  {
    id: "pubmed",
    name: "PubMed",
    fullName: "PubMed Biomedical Literature Database",
    description:
      "PubMed comprises more than 37 million citations for biomedical literature from MEDLINE, life science journals, and online books. It provides free access to abstracts, and full texts for many articles through PubMed Central.",
    color: "oklch(0.72 0.18 45)",
    glowColor: "oklch(0.72 0.18 45 / 0.3)",
    homeUrl: "https://pubmed.ncbi.nlm.nih.gov",
    searchUrl: (term) =>
      `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(term)}&sort=relevance`,
    placeholder: "Search articles, diseases, treatments...",
    ocidKey: "database.pubmed.button",
  },
  {
    id: "pubchem",
    name: "PubChem",
    fullName: "PubChem — Open Chemistry Database (NCBI)",
    description:
      "PubChem is the world's largest collection of freely accessible chemical information. Search by chemical name, molecular formula, structure, or identifiers. Covers bioactivities, drug targets, and chemical safety.",
    color: "oklch(0.60 0.22 330)",
    glowColor: "oklch(0.60 0.22 330 / 0.3)",
    homeUrl: "https://pubchem.ncbi.nlm.nih.gov",
    searchUrl: (term) =>
      `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(term)}`,
    placeholder: "Search compounds, structures, bioactivities...",
    ocidKey: "database.pubchem.button",
  },
];

const SPECIALIZED_DATABASES: DatabaseConfig[] = [
  {
    id: "disgenet",
    name: "DisGeNET",
    fullName: "Disease–Gene Association Database",
    description:
      "DisGeNET is a comprehensive discovery platform integrating information on human disease-associated genes and variants, curated from expert databases and the biomedical literature.",
    color: "oklch(0.72 0.20 25)",
    glowColor: "oklch(0.72 0.20 25 / 0.3)",
    homeUrl: "https://www.disgenet.org",
    searchUrl: (term) =>
      `https://www.disgenet.org/search/#genes/${encodeURIComponent(term)}/1`,
    placeholder: "Search diseases, genes, variants...",
    ocidKey: "database.disgenet.button",
  },
  {
    id: "omim",
    name: "OMIM",
    fullName: "Online Mendelian Inheritance in Man",
    description:
      "OMIM is a comprehensive, authoritative compendium of human genes and genetic phenotypes, updated daily, providing detailed disease-gene relationships and molecular basis.",
    color: "oklch(0.65 0.22 300)",
    glowColor: "oklch(0.65 0.22 300 / 0.3)",
    homeUrl: "https://www.omim.org",
    searchUrl: (term) =>
      `https://www.omim.org/search/?search=${encodeURIComponent(term)}`,
    placeholder: "Search genetic diseases, genes...",
    ocidKey: "database.omim.button",
  },
  {
    id: "string",
    name: "STRING",
    fullName: "Protein Interaction Network Database",
    description:
      "STRING provides known and predicted protein-protein interaction networks, integrating direct (physical) and indirect (functional) associations from experimental data, co-expression, and literature mining.",
    color: "oklch(0.82 0.17 198)",
    glowColor: "oklch(0.82 0.17 198 / 0.3)",
    homeUrl: "https://string-db.org",
    searchUrl: (term) =>
      `https://string-db.org/search/0/${encodeURIComponent(term)}`,
    placeholder: "Search proteins, genes...",
    ocidKey: "database.string.button",
  },
  {
    id: "biogrid",
    name: "BioGRID",
    fullName: "Biological General Repository for Interaction Datasets",
    description:
      "BioGRID is a curated biological database of protein, genetic, and chemical interactions for all major model organism species including humans, maintained by the Saccharina Informatics team.",
    color: "oklch(0.75 0.20 155)",
    glowColor: "oklch(0.75 0.20 155 / 0.3)",
    homeUrl: "https://thebiogrid.org",
    searchUrl: (term) =>
      `https://thebiogrid.org/search.php?search=${encodeURIComponent(term)}&organism=9606`,
    placeholder: "Search proteins, genes, interactions...",
    ocidKey: "database.biogrid.button",
  },
  {
    id: "chembl",
    name: "ChEMBL",
    fullName: "Bioactivity Database of Drug-like Molecules",
    description:
      "ChEMBL is a manually curated chemical database of bioactive molecules with drug-like properties, containing binding, functional, and ADMET information for millions of compounds.",
    color: "oklch(0.72 0.20 170)",
    glowColor: "oklch(0.72 0.20 170 / 0.3)",
    homeUrl: "https://www.ebi.ac.uk/chembl/",
    searchUrl: (term) =>
      `https://www.ebi.ac.uk/chembl/#search_results/all/query=${encodeURIComponent(term)}`,
    placeholder: "Search compounds, targets, drugs...",
    ocidKey: "database.chembl.button",
  },
  {
    id: "ttd",
    name: "TTD",
    fullName: "Therapeutic Target Database",
    description:
      "TTD provides information on known and explored therapeutic protein and nucleic acid targets, drugs, and pathways to facilitate target discovery and drug design.",
    color: "oklch(0.68 0.18 280)",
    glowColor: "oklch(0.68 0.18 280 / 0.3)",
    homeUrl: "https://db.idrblab.net/ttd/",
    searchUrl: (term) =>
      `https://db.idrblab.net/ttd/search/ttd/target?query=${encodeURIComponent(term)}`,
    placeholder: "Search targets, drugs, pathways...",
    ocidKey: "database.ttd.button",
  },
  {
    id: "reactome",
    name: "Reactome",
    fullName: "Curated Pathway Knowledgebase",
    description:
      "Reactome is a free, open-source, curated and peer-reviewed pathway database providing intuitive bioinformatics tools for the visualisation, interpretation and analysis of pathway knowledge.",
    color: "oklch(0.75 0.18 40)",
    glowColor: "oklch(0.75 0.18 40 / 0.3)",
    homeUrl: "https://reactome.org",
    searchUrl: (term) =>
      `https://reactome.org/content/query?q=${encodeURIComponent(term)}&types=Pathway`,
    placeholder: "Search pathways, reactions, proteins...",
    ocidKey: "database.reactome.button",
  },
  {
    id: "wikipathways",
    name: "WikiPathways",
    fullName: "Community Curated Pathway Database",
    description:
      "WikiPathways is a community curated pathway database for biological pathways analysis and visualization, with over 3,000 pathways for more than 30 species contributed by the research community.",
    color: "oklch(0.65 0.20 145)",
    glowColor: "oklch(0.65 0.20 145 / 0.3)",
    homeUrl: "https://www.wikipathways.org",
    searchUrl: (term) =>
      `https://www.wikipathways.org/search.html#q=${encodeURIComponent(term)}`,
    placeholder: "Search pathways, genes, diseases...",
    ocidKey: "database.wikipathways.button",
  },
];

function DatabaseCard({ db }: { db: DatabaseConfig }) {
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.open(
        db.searchUrl(searchTerm.trim()),
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  return (
    <div
      className="rounded-2xl p-6 space-y-4 flex flex-col h-full"
      style={{
        background: "oklch(0.10 0.035 270 / 0.7)",
        border: `1px solid ${db.color.replace(")", " / 0.2)")}`,
        backdropFilter: "blur(12px)",
        boxShadow: `0 4px 24px ${db.glowColor.replace("0.3)", "0.08)")}, 0 0 0 1px ${db.color.replace(")", " / 0.08)")}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-bold mb-2"
            style={{
              background: `${db.color.replace(")", " / 0.1)")}`,
              color: db.color,
              border: `1px solid ${db.color.replace(")", " / 0.3)")}`,
            }}
          >
            {db.name}
          </div>
          <h3
            className="font-display font-semibold text-sm leading-snug"
            style={{ color: "oklch(0.85 0.04 240)" }}
          >
            {db.fullName}
          </h3>
        </div>
        <a
          href={db.homeUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-ocid={db.ocidKey}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            background: `${db.color.replace(")", " / 0.1)")}`,
            color: db.color,
            border: `1px solid ${db.color.replace(")", " / 0.3)")}`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background =
              db.color.replace(")", " / 0.2)");
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              `0 0 12px ${db.glowColor}`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background =
              db.color.replace(")", " / 0.1)");
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
          }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open
        </a>
      </div>

      {/* Description */}
      <p
        className="text-xs leading-relaxed flex-1"
        style={{ color: "oklch(0.6 0.06 260)" }}
      >
        {db.description}
      </p>

      {/* Search */}
      <form onSubmit={handleSearch} className="space-y-2">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "oklch(0.5 0.06 260)" }}
          />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={db.placeholder}
            className="pl-9 rounded-xl text-sm"
            style={{
              background: "oklch(0.08 0.02 270 / 0.8)",
              border: `1px solid ${db.color.replace(")", " / 0.2)")}`,
              color: "oklch(0.88 0.04 240)",
            }}
          />
        </div>
        <Button
          type="submit"
          className="w-full rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${db.color.replace(")", " / 0.8)")}, ${db.color.replace(")", " / 0.6)")})`,
            color: "oklch(0.08 0.02 270)",
            boxShadow: `0 0 15px ${db.glowColor}`,
          }}
          disabled={!searchTerm.trim()}
        >
          <Search className="w-4 h-4 mr-2" />
          Search {db.name}
        </Button>
      </form>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <h3
        className="font-display text-xl font-bold"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.82 0.17 198), oklch(0.55 0.22 295))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </h3>
      <p className="text-xs" style={{ color: "oklch(0.5 0.06 260)" }}>
        {subtitle}
      </p>
    </div>
  );
}

export function DatabasesPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2
          className="font-display text-3xl font-bold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.82 0.17 198), oklch(0.55 0.22 295))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Biological Databases
        </h2>
        <p
          className="text-sm max-w-xl mx-auto"
          style={{ color: "oklch(0.6 0.06 260)" }}
        >
          Access 14 curated databases for diseases, genes, proteins, pathways,
          interactions, and drugs directly from this platform.
        </p>
      </div>

      {/* Core Databases */}
      <div className="space-y-4">
        <SectionHeader
          title="Core Databases"
          subtitle="Primary databases for pathways, proteins, drugs, and literature"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORE_DATABASES.map((db) => (
            <DatabaseCard key={db.id} db={db} />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(to right, transparent, oklch(0.82 0.17 198 / 0.3), transparent)",
        }}
      />

      {/* Specialized Databases */}
      <div className="space-y-4">
        <SectionHeader
          title="Specialized Databases"
          subtitle="Disease–gene associations, protein interactions, drug targets, and curated pathways"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SPECIALIZED_DATABASES.map((db) => (
            <DatabaseCard key={db.id} db={db} />
          ))}
        </div>
      </div>

      {/* Info note */}
      <p
        className="text-center text-xs"
        style={{ color: "oklch(0.45 0.05 260)" }}
      >
        Search results open directly in each database. PubMed literature is also
        fetched live in disease analysis results. All links open in a new tab.
      </p>
    </div>
  );
}
