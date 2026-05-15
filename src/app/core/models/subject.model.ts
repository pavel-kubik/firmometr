export interface OrStatutar {
  jmeno: string | null;
  funkce: string | null;
  datumNarozeni: string | null;
  adresaText: string | null;
  datumVzniku: string | null;
  datumZaniku: string | null;
}

export interface OrListina {
  typListiny: string;
  datumVzniku: string | null;
  datumZalozeni: string | null;
}

export interface OrStatus {
  spisovatel: string | null;
  statutari: OrStatutar[];
  sbirkaListin: OrListina[];
  sbirkaListinCelkem: number;
  orUrl: string | null;
}

export interface DphStatus {
  isPlatce: boolean;
  nespolehlivy: boolean | null;
  datumNespolehlivosti: string | null;
  ucty: string[];
}

export interface SubjectDetail {
  ico: string;
  dic: string | null;
  obchodniFirma: string | null;
  pravniForma: string | null;
  sidloText: string | null;
  sidloEnriched: string | null;
  datumVzniku: string | null;
  stavKod: string | null;
  stavNazev: string | null;
  isir: IsirStatus;
  dph: DphStatus;
  or: OrStatus | null;
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
