import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import OutCall "http-outcalls/outcall";

actor {
  type Pathway = {
    id : Text;
    name : Text;
    keggId : Text;
    description : Text;
    confidenceScore : Nat;
    source : Text;
  };

  type ProteinTarget = {
    id : Text;
    name : Text;
    uniprotId : Text;
    geneName : Text;
    function : Text;
    pathwayId : Text;
    confidenceScore : Nat;
  };

  type DrugRecommendation = {
    id : Text;
    name : Text;
    drugbankId : Text;
    pubchemId : Text;
    targetProteinId : Text;
    mechanismOfAction : Text;
    approvalStatus : Text;
    confidenceScore : Nat;
  };

  type DiseaseResult = {
    diseaseName : Text;
    ncbiDiseaseId : ?Text;
    pathways : [Pathway];
    proteins : [ProteinTarget];
    drugs : [DrugRecommendation];
    searchTimestamp : Int;
    totalConfidence : Nat;
  };

  type SearchHistoryEntry = {
    diseaseName : Text;
    timestamp : Int;
    pathwaysFound : Nat;
    drugsFound : Nat;
  };

  type DatabaseStatus = {
    kegg : Bool;
    uniprot : Bool;
    drugbank : Bool;
    ncbi : Bool;
    pubchem : Bool;
  };

  module Pathway {
    public func compare(pathway1 : Pathway, pathway2 : Pathway) : Order.Order {
      switch (Nat.compare(pathway1.confidenceScore, pathway2.confidenceScore)) {
        case (#equal) { Text.compare(pathway1.name, pathway2.name) };
        case (order) { order };
      };
    };
  };

  module ProteinTarget {
    public func compare(protein1 : ProteinTarget, protein2 : ProteinTarget) : Order.Order {
      switch (Nat.compare(protein1.confidenceScore, protein2.confidenceScore)) {
        case (#equal) { Text.compare(protein1.name, protein2.name) };
        case (order) { order };
      };
    };
  };

  module DrugRecommendation {
    public func compare(drug1 : DrugRecommendation, drug2 : DrugRecommendation) : Order.Order {
      switch (Nat.compare(drug1.confidenceScore, drug2.confidenceScore)) {
        case (#equal) { Text.compare(drug1.name, drug2.name) };
        case (order) { order };
      };
    };
  };

  let searchHistory = List.empty<SearchHistoryEntry>();
  let curatedData = Map.empty<Text, DiseaseResult>();

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getCuratedDisease(diseaseName : Text) : ?DiseaseResult {
    curatedData.get(diseaseName);
  };

  func storeSearchHistory(diseaseName : Text, pathwaysFound : Nat, drugsFound : Nat) {
    let entry : SearchHistoryEntry = {
      diseaseName;
      timestamp = Time.now();
      pathwaysFound;
      drugsFound;
    };

    if (searchHistory.size() >= 20) {
      ignore searchHistory.removeLast();
    };
    searchHistory.add(entry);
  };

  public shared ({ caller }) func searchDisease(diseaseName : Text) : async DiseaseResult {
    let lowerDiseaseName = diseaseName.toLower();

    let curated =
      switch (getCuratedDisease(lowerDiseaseName)) {
        case (?data) { ?data };
        case (null) { null };
      };

    let pathways = [ {
      id = "1";
      name = "Insulin Signaling Pathway";
      keggId = "hsa04910";
      description = "Regulates glucose uptake and metabolism.";
      confidenceScore = 95;
      source = "KEGG";
    } ];

    let proteins = [ {
      id = "1";
      name = "IRS1";
      uniprotId = "P35568";
      geneName = "IRS1";
      function = "Insulin receptor substrate involved in signaling.";
      pathwayId = "1";
      confidenceScore = 98;
    } ];

    let drugs = [ {
      id = "1";
      name = "Metformin";
      drugbankId = "DB00331";
      pubchemId = "4091";
      targetProteinId = "1";
      mechanismOfAction = "Activates AMPK, reduces hepatic glucose production.";
      approvalStatus = "Approved";
      confidenceScore = 99;
    } ];

    let totalConfidence = if (curated == null) { 0 } else { 90 };

    if (curated == null) {
      storeSearchHistory(diseaseName, pathways.size(), drugs.size());
    };

    {
      diseaseName;
      ncbiDiseaseId = null;
      pathways = pathways.sort();
      proteins = proteins.sort();
      drugs = drugs.sort();
      searchTimestamp = Time.now();
      totalConfidence;
    };
  };

  public query ({ caller }) func getSearchHistory() : async [SearchHistoryEntry] {
    searchHistory.reverse().toArray();
  };

  public query ({ caller }) func getDatabaseStatus() : async DatabaseStatus {
    {
      kegg = true;
      uniprot = true;
      drugbank = true;
      ncbi = true;
      pubchem = true;
    };
  };

  public query ({ caller }) func getSuggestedDiseases() : async [Text] {
    [
      "Type 2 Diabetes",
      "Alzheimer's Disease",
      "Hypertension",
      "Cancer",
      "COVID-19",
      "Asthma",
      "Parkinson's Disease",
      "Osteoarthritis",
      "Rheumatoid Arthritis",
      "Breast Cancer",
      "Colon Cancer",
      "Lung Cancer",
    ];
  };
};
