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

const DATABASES: DatabaseConfig[] = [
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

export function DatabasesPage() {
  return (
    <div className="space-y-8">
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
          Access curated databases for genes, proteins, pathways, and drugs
          directly from this platform.
        </p>
      </div>

      {/* Database cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DATABASES.map((db) => (
          <DatabaseCard key={db.id} db={db} />
        ))}
      </div>

      {/* PubChem bonus card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "oklch(0.10 0.035 270 / 0.5)",
          border: "1px solid oklch(0.60 0.22 330 / 0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div
              className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-bold mb-2"
              style={{
                background: "oklch(0.60 0.22 330 / 0.1)",
                color: "oklch(0.75 0.15 330)",
                border: "1px solid oklch(0.60 0.22 330 / 0.3)",
              }}
            >
              PubChem
            </div>
            <h3
              className="font-display font-semibold text-sm"
              style={{ color: "oklch(0.85 0.04 240)" }}
            >
              PubChem — Open Chemistry Database
            </h3>
            <p className="text-xs" style={{ color: "oklch(0.6 0.06 260)" }}>
              World's largest collection of freely accessible chemical
              information. Search chemical structures, properties, and
              bioactivities.
            </p>
          </div>
          <a
            href="https://pubchem.ncbi.nlm.nih.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: "oklch(0.60 0.22 330 / 0.1)",
              color: "oklch(0.75 0.15 330)",
              border: "1px solid oklch(0.60 0.22 330 / 0.3)",
            }}
          >
            <ExternalLink className="w-4 h-4" />
            Open PubChem
          </a>
        </div>
      </div>
    </div>
  );
}
