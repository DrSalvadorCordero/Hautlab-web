export type AcademicPublication = {
  id: string;
  kind: string;
  title: string;
  year: number;
  journal: string;
  volume: string;
  issue: string;
  volumeIssue: string;
  pages: string;
  citation: string;
  authors: string[];
  summaryEs: string;
  summaryEn: string;
  pmid: string;
  doi: string;
  pubmedUrl: string;
  researchGateUrl: string;
  journalUrl: string;
};

export const academicPublications: AcademicPublication[] = [
  {
    id: "dcs-fishermen-yucatan",
    kind: "Artículo original",
    title:
      "Decompression sickness among diving fishermen in Mexico: observational retrospective analysis of DCS in three sea cucumber fishing seasons",
    year: 2017,
    journal: "Undersea and Hyperbaric Medicine",
    volume: "44",
    issue: "2",
    volumeIssue: "44(2)",
    pages: "149–156",
    citation:
      "Huchim-Lara O, Chin W, Salas S, Rivera-Canul N, Cordero-Romero S, Tec J, Joo E, Mendez-Dominguez N. Undersea Hyperb Med. 2017;44(2):149–156.",
    authors: [
      "Oswaldo Huchim-Lara",
      "Walter Chin",
      "Silvia Salas",
      "Normando Rivera-Canul",
      "Salvador Cordero-Romero",
      "Juan Tec",
      "Ellie Joo",
      "Nina Mendez-Dominguez"
    ],
    summaryEs:
      "Análisis retrospectivo de 166 pescadores-buzos y 233 terapias de recompresión realizadas entre 2014 y 2016 en Tizimín, Yucatán.",
    summaryEn:
      "A retrospective analysis of 166 fisherman-divers and 233 recompression treatments delivered in Tizimín, Yucatán, between 2014 and 2016.",
    pmid: "28777905",
    doi: "10.22462/3.4.2017.8",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/28777905/",
    researchGateUrl:
      "https://www.researchgate.net/publication/314911244_Decompression_sickness_among_diving_fishermen_in_Mexico_observational_analysis_of_DCS_in_three_sea_cucumber_fishing_seasons",
    journalUrl:
      "https://www.uhms.org/uhm-search/uhm-journal-volume-44/number-2/decompression-sickness-among-diving-fishermen-in-mexico-observational-retrospective-analysis-of-dcs-in-three-sea-cucumber-fishing-seasons.html"
  },
  {
    id: "fatal-cardiopulmonary-dcs",
    kind: "Reporte de caso",
    title:
      "Fatal cardiopulmonary decompression sickness in an untrained fisherman diver in Yucatán, Mexico: a clinical case report",
    year: 2017,
    journal: "Undersea and Hyperbaric Medicine",
    volume: "44",
    issue: "3",
    volumeIssue: "44(3)",
    pages: "279–281",
    citation:
      "Mendez N, Huchim-Lara O, Rivera-Canul N, Chin W, Tec J, Cordero-Romero S. Undersea Hyperb Med. 2017;44(3):279–281.",
    authors: [
      "Nina Mendez",
      "Oswaldo Huchim-Lara",
      "Normando Rivera-Canul",
      "Walter Chin",
      "Juan Tec",
      "Salvador Cordero-Romero"
    ],
    summaryEs:
      "Reporte del curso clínico, valoración y tratamiento de un pescador-buzo no entrenado con enfermedad por descompresión cardiopulmonar fatal en Yucatán.",
    summaryEn:
      "A clinical report describing the assessment, course and treatment of fatal cardiopulmonary decompression sickness in an untrained fisherman-diver in Yucatán.",
    pmid: "28779584",
    doi: "10.22462/5.6.2017.8",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/28779584/",
    researchGateUrl:
      "https://www.researchgate.net/publication/316169736_Fatal_cardiopulmonary_decompression_sickness_in_an_untrained_fisherman_diver_in_Yucatan_Mexico_A_clinical_case_report",
    journalUrl:
      "https://uhms.org/uhm-search/uhm-journal-volume-44/number-3/fatal-cardiopulmonary-decompression-sickness-in-an-untrained-fisherman-diver-in-yucatan-mexico-a-clinical-case-report.html"
  }
];
