export interface SubjectDetail {
  ico: string;
  obchodniFirma: string | null;
  pravniForma: string | null;
  sidloText: string | null;
  sidloEnriched: string | null;
  datumVzniku: string | null;
  stavKod: string | null;
  stavNazev: string | null;
  isir: IsirStatus;
  isWatched: boolean;
}

export interface IsirStatus {
  clarity: 'CLEAR' | 'PAST_DEBTOR' | 'ACTIVE_DEBTOR' | 'ACTIVE_CO_DEBTOR';
  proceedings: IsirProceeding[];
}

export interface IsirProceeding {
  senZnacka: string | null;
  stavKonkursu: string | null;
  datumZahajeni: string | null;
  urlDetail: string | null;
  jeDalsiDluznik: boolean;
  isActive: boolean;
}

export interface SubjectSummary {
  ico: string;
  obchodniFirma: string | null;
  sidloText: string | null;
  stavNazev: string | null;
}

export interface SearchResult {
  total: number;
  items: SubjectSummary[];
}
