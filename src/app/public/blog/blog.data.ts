export interface BlogArticle {
  slug: string;
  titleCs: string;
  titleEn: string;
  descriptionCs: string;
  descriptionEn: string;
  publishedAt: string;
  readMinutes: number;
  excerptCs: string;
  excerptEn: string;
  contentHtmlCs: string;
  contentHtmlEn: string;
}

const ARTICLE_CS = `
<p>Každý rok přijdou tisíce českých podnikatelů o peníze kvůli spolupráci s nevěrohodným partnerem. Zákazník zkrachuje, odběratel neuhradí faktury nebo se ukáže, že dodavatel byl na seznamu nespolehlivých plátců DPH — a vy ručíte za jejich odvod. Přitom základní prověření firmy zabere méně než minutu a je zcela zdarma.</p>
<p>V tomto průvodci vám ukážeme, jak prověřit firmu krok za krokem, jaká data jsou veřejně dostupná a na jaké červené vlajky si dát pozor.</p>

<h2>Co lze zjistit z veřejných rejstříků</h2>
<p>Česká republika má jednu z nejotevřenějších databází firemních dat v Evropě. Klíčové rejstříky jsou zcela bezplatné a přístupné online:</p>
<ul>
  <li><strong>ISIR (Insolvenční rejstřík)</strong> — aktivní i historické insolvence, spravuje Ministerstvo spravedlnosti</li>
  <li><strong>ARES</strong> — základní údaje o firmě: IČO, adresa, datum vzniku, právní forma</li>
  <li><strong>Registr nespolehlivých plátců DPH</strong> — seznam firem, které porušují povinnosti plátce DPH</li>
  <li><strong>Obchodní rejstřík (OR)</strong> — statutáři, základní kapitál, sbírka listin s účetními závěrkami</li>
</ul>
<p>Každý z těchto rejstříků má jiné rozhraní a různý způsob vyhledávání. Firmometr tyto zdroje agreguje na jednom místě a zobrazí je přehledně po zadání jediného IČO.</p>

<h2>Insolvenční rejstřík (ISIR) — nejdůležitější signál</h2>
<p>ISIR je bezesporu nejdůležitější zdroj při hodnocení rizika obchodního partnera. Insolvence znamená, že firma nebo osoba není schopna splácet své splatné závazky. Jako věřitel se v takovém případě dostanete do řady dalších věřitelů s nejistou šancí na uspokojení pohledávky.</p>
<p>Výsledek kontroly v ISIR může být:</p>
<ul>
  <li><strong>Čistý (CLEAR)</strong> — žádné záznamy, firma není ani nebyla v insolvenci. Zelené světlo.</li>
  <li><strong>Minulý dlužník (PAST_DEBTOR)</strong> — firma insolvenčním řízením prošla, ale skončilo. Záleží na detailech a době, kdy se to stalo.</li>
  <li><strong>Aktivní řízení (ACTIVE_DEBTOR)</strong> — firma je právě v insolvenčním řízení. Červená vlajka — nespolupracovat, nebo vyžadovat platbu předem.</li>
</ul>
<p>Kontrola se vždy provádí podle IČO, ne podle názvu firmy. Název se může měnit, IČO je jedinečný a trvalý identifikátor.</p>

<h2>Registr nespolehlivých plátců DPH</h2>
<p>Ministerstvo financí zveřejňuje seznam plátců DPH, kteří opakovaně porušují své daňové povinnosti. Nespolehlivý plátce DPH je závažný signál ze dvou důvodů:</p>
<ol>
  <li><strong>Finanční zdraví</strong> — neschopnost platit DPH bývá prvním příznakem platební krize</li>
  <li><strong>Ručení odběratele</strong> — jako odběratel ručíte za odvod DPH nespolehlivého plátce. Pokud dodavatel DPH neodvede, finanční úřad může vymáhat dlužnou daň od vás</li>
</ol>
<p>Pravidlo je jasné: prověřte DPH status vždy před přijetím první faktury od nového dodavatele, u kterého je DPH relevantní.</p>

<h2>Obchodní rejstřík a ARES — základ profilu firmy</h2>
<p>Obchodní rejstřík obsahuje informace o struktuře a historii firmy:</p>
<ul>
  <li>Aktuální a historičtí statutáři (jednatelé, prokuristé)</li>
  <li>Základní kapitál</li>
  <li>Datum vzniku a případného zrušení</li>
  <li>Sbírka listin — účetní závěrky a výroční zprávy</li>
</ul>
<p>ARES doplňuje ověřenou adresu sídla ze ČÚZK/RUIAN, IČO, DIČ a právní formu podnikání. Kombinace těchto zdrojů poskytne komplexní obraz o tom, kdo firmu řídí, jak dlouho existuje a kde skutečně sídlí.</p>

<h2>Jak prověřit firmu krok za krokem</h2>
<ol>
  <li><strong>Zjistěte IČO</strong> — Najdete ho na faktuře, webu partnera nebo v obchodním rejstříku. Pokud ho neznáte, vyhledejte firmu podle názvu.</li>
  <li><strong>Zadejte IČO do Firmometru</strong> — Na stránce vyhledávání stačí zadat IČO nebo název firmy. Výsledky se zobrazí okamžitě.</li>
  <li><strong>Zkontrolujte rizikový semafor</strong> — Zelená = vše ok, oranžová = doporučujeme detailní prověření, červená = aktivní insolvence nebo nespolehlivý plátce DPH.</li>
  <li><strong>Prostudujte detaily</strong> — Podívejte se na ISIR status, DPH registraci, aktuální statutáře a datum vzniku firmy.</li>
  <li><strong>Přidejte firmu ke sledování</strong> — Pro průběžnou spolupráci aktivujte watchlist. E-mailem vás upozorníme na každou změnu stavu.</li>
</ol>

<h2>Červené vlajky — na co si dát pozor</h2>
<p>Kromě přímé insolvence existují slabší signály, které stojí za povšimnutí:</p>
<ul>
  <li><strong>Nedávná změna jednatele</strong> — zvláště těsně před podpisem velké zakázky nebo smlouvy</li>
  <li><strong>Firma mladší než 1 rok</strong> — nové subjekty nemají historii, riziko je těžší odhadnout</li>
  <li><strong>Nespolehlivý plátce DPH</strong> — vždy červená vlajka bez výjimky</li>
  <li><strong>Chybějící účetní závěrky</strong> — firma nemá v sbírce listin závěrky za poslední 2 nebo více let</li>
  <li><strong>Historická insolvence</strong> — firma insolventní v minulosti má statisticky vyšší riziko opakování</li>
  <li><strong>Hromadná sídla</strong> — adresa sdílená stovkami jiných firem je typická pro schránkové společnosti</li>
</ul>

<h2>Průběžné sledování — ochrana v čase</h2>
<p>Jednorázové prověření vám dá okamžitý přehled, ale nezajistí průběžnou ochranu. Firma, která je dnes v pořádku, se může do insolvence dostat za 3 měsíce. Zákazník, který dnes spolehlivě platí DPH, může být zítra na blacklistu ministerstva financí.</p>
<p>Watchlist v Firmometru tuto mezeru řeší. Přidejte firmy do sledování a dostanete e-mail vždy, když se změní jejich insolvenční status nebo DPH registrace. Pro OSVČ a freelancery stačí bezplatný účet se sledováním 3 firem. Pro firmy s větším portfoliem partnerů je k dispozici plán BASIC se sledováním až 50 subjektů.</p>

<h2>Závěr</h2>
<p>Prověření obchodního partnera před spoluprací je základem bezpečného podnikání. Zabere méně než minutu, je zcela zdarma a může vám ušetřit tisíce nebo desetitisíce korun. Klíčové kontroly jsou tři: insolvenční rejstřík (ISIR), registr nespolehlivých plátců DPH a základní profil firmy z ARES a obchodního rejstříku.</p>
<p>Firmometr tyto tři kontroly propojuje do jednoho přehledného profilu — zadáte jedno IČO a za 10 sekund máte kompletní přehled. Prověřte svého příštího obchodního partnera ještě dnes.</p>
`;

const ARTICLE_EN = `
<p>Every year thousands of Czech entrepreneurs lose money by working with an unreliable partner. A customer goes bankrupt, a client fails to pay invoices, or you discover that your supplier was on the list of unreliable VAT payers — making you jointly liable for their unpaid tax. Yet a basic company check takes under a minute and is completely free.</p>
<p>This guide walks you through verifying a business partner step by step: what data is publicly available and what red flags to watch for.</p>

<h2>What you can find in public registries</h2>
<p>The Czech Republic has one of the most open company databases in Europe. The key registries are completely free and available online:</p>
<ul>
  <li><strong>ISIR (Insolvency Register)</strong> — active and historical insolvency proceedings, maintained by the Ministry of Justice</li>
  <li><strong>ARES</strong> — basic company data: company ID (IČO), address, date of incorporation, legal form</li>
  <li><strong>Unreliable VAT payers register</strong> — list of companies that repeatedly fail their VAT obligations</li>
  <li><strong>Commercial Register (OR)</strong> — directors, share capital, collection of documents including financial statements</li>
</ul>
<p>Each registry has a different interface and search method. Firmometr aggregates these sources in one place and presents a clear profile after you enter a single company ID.</p>

<h2>Insolvency Register (ISIR) — the most important signal</h2>
<p>ISIR is by far the most important source for assessing business risk. Insolvency means the company or person is unable to repay their due obligations. As a creditor you join a queue of other creditors with uncertain prospects of recovering your money.</p>
<p>An ISIR check can return one of three results:</p>
<ul>
  <li><strong>Clear (CLEAR)</strong> — no records; the company has never been in insolvency proceedings. Green light.</li>
  <li><strong>Past debtor (PAST_DEBTOR)</strong> — the company went through insolvency but proceedings are closed. Depends on details and how long ago it happened.</li>
  <li><strong>Active proceedings (ACTIVE_DEBTOR)</strong> — the company is currently in insolvency. Red flag — do not proceed, or require payment upfront.</li>
</ul>
<p>Always check by company ID (IČO), not by company name. Names can change; the IČO is a unique, permanent identifier.</p>

<h2>Unreliable VAT payers register</h2>
<p>The Ministry of Finance publishes a list of VAT payers who repeatedly violate their tax obligations. An unreliable VAT payer is a serious warning for two reasons:</p>
<ol>
  <li><strong>Financial health</strong> — inability to pay VAT is often the first sign of a payment crisis</li>
  <li><strong>Joint liability</strong> — as the buyer, you are jointly liable for the VAT of an unreliable payer. If your supplier fails to remit VAT, the tax authority can pursue you for the unpaid amount</li>
</ol>
<p>The rule is simple: always check VAT status before accepting the first invoice from a new supplier where VAT applies.</p>

<h2>Commercial Register and ARES — building the company profile</h2>
<p>The Commercial Register provides information about company structure and history:</p>
<ul>
  <li>Current and former directors (statutory executives, authorised signatories)</li>
  <li>Share capital</li>
  <li>Date of incorporation and dissolution (if applicable)</li>
  <li>Collection of documents — financial statements and annual reports</li>
</ul>
<p>ARES adds a verified registered address from the ČÚZK/RUIAN cadastre, company ID, VAT number, and legal form. Together these sources give you a complete picture of who runs the company, how long it has existed, and where it is actually based.</p>

<h2>How to check a company — step by step</h2>
<ol>
  <li><strong>Find the company ID (IČO)</strong> — It appears on invoices, the company's website, or in the Commercial Register. If you don't have it, search by company name.</li>
  <li><strong>Enter the IČO in Firmometr</strong> — On the search page, type in the company ID or name. Results appear immediately.</li>
  <li><strong>Check the risk semaphore</strong> — Green = all clear, amber = review recommended, red = active insolvency or unreliable VAT payer.</li>
  <li><strong>Review the details</strong> — Look at the ISIR status, VAT registration, current directors, and the company's date of incorporation.</li>
  <li><strong>Add the company to your watchlist</strong> — For ongoing partnerships, enable monitoring. You'll receive an email whenever the company's status changes.</li>
</ol>

<h2>Red flags — what to watch for</h2>
<p>Beyond direct insolvency, there are weaker signals worth noting:</p>
<ul>
  <li><strong>Recent director change</strong> — especially just before signing a large contract</li>
  <li><strong>Company less than 1 year old</strong> — new entities have no track record, making risk harder to assess</li>
  <li><strong>Unreliable VAT payer</strong> — always a red flag, no exceptions</li>
  <li><strong>Missing financial statements</strong> — no statements filed in the last 2+ years</li>
  <li><strong>Past insolvency</strong> — companies that have been insolvent before are statistically more likely to repeat</li>
  <li><strong>Registered address shared by hundreds of companies</strong> — typical of shell companies</li>
</ul>

<h2>Ongoing monitoring — protection over time</h2>
<p>A one-off check gives you an instant snapshot but does not provide ongoing protection. A company that looks fine today can enter insolvency in three months. A client reliably paying VAT today can be on the ministry's blacklist tomorrow.</p>
<p>Firmometr's watchlist fills this gap. Add companies to your monitoring list and receive an email whenever their insolvency status or VAT registration changes. A free account covers up to 3 companies — enough for most freelancers and sole traders. For larger portfolios, the BASIC plan supports up to 50 companies.</p>

<h2>Summary</h2>
<p>Checking a business partner before starting to work together is the foundation of safe business practice. It takes under a minute, is completely free, and can save you thousands of crowns. The three key checks are: the Insolvency Register (ISIR), the unreliable VAT payers register, and the company's basic profile from ARES and the Commercial Register.</p>
<p>Firmometr combines all three into a single clear profile — enter one company ID and have a complete overview in 10 seconds. Check your next business partner today.</p>
`;

const ARTICLE_ISIR_CS = `
<p>Insolvenční rejstřík (zkratka ISIR) je veřejně přístupná databáze všech insolvenčních řízení v České republice. Spravuje jej Ministerstvo spravedlnosti a je dostupný zdarma. Pokud prověřujete obchodního partnera, ISIR je první místo, kam se podívat — aktivní insolvenční řízení je nejsilnější varovný signál, jaký firemní data nabízejí.</p>

<h2>Co je insolvenční řízení</h2>
<p>Insolvenční řízení je soudní proces, který řeší situaci, kdy dlužník není schopen splácet své splatné závazky. V České republice existují tři základní formy:</p>
<ul>
  <li><strong>Konkurs</strong> — pro firmy i fyzické osoby. Majetek dlužníka je zpeněžen a výtěžek rozdělen věřitelům. Firma po konkursu zpravidla zaniká.</li>
  <li><strong>Oddlužení (osobní bankrot)</strong> — pro fyzické osoby a OSVČ. Dlužník splácí 3–5 let, zbytek dluhů je odpuštěn.</li>
  <li><strong>Reorganizace</strong> — pro větší firmy. Podnik pokračuje v provozu podle insolvenčním soudem schváleného reorganizačního plánu.</li>
</ul>

<h2>Jak vyhledávat v ISIR</h2>
<p>Vyhledávat lze podle:</p>
<ul>
  <li><strong>IČO</strong> — nejspolehlivější způsob pro firmy. Jedno IČO = jeden subjekt, výsledek je jednoznačný.</li>
  <li><strong>Jméno a příjmení</strong> — pro fyzické osoby (OSVČ, jednatelé). Může vrátit více shod.</li>
  <li><strong>Název firmy</strong> — méně spolehlivé, firma mohla změnit název.</li>
</ul>
<p>Firmometr kontroluje ISIR automaticky jako součást každého vyhledávání firmy podle IČO. Výsledek vidíte okamžitě bez přechodu na jiný web.</p>

<h2>Jak číst výsledky — spisová značka a stav řízení</h2>
<p>ISIR zobrazuje pro každé řízení klíčové informace:</p>
<ul>
  <li><strong>Spisová značka</strong> — číslo ve tvaru KSOS 31 INS 1234/2025. Část "KSOS" označuje příslušný krajský soud (zde KS Ostrava), "INS" identifikuje insolvenci, čísla jsou identifikátor případu a rok.</li>
  <li><strong>Stav řízení</strong> — nejdůležitější údaj. "Probíhající" znamená aktivní řízení, "Skončené" ho uzavírá.</li>
  <li><strong>Způsob řešení</strong> — konkurs, oddlužení nebo reorganizace.</li>
  <li><strong>Datum zahájení</strong> — kdy soud zahájil řízení.</li>
</ul>

<h2>Čtyři stavy v Firmometru</h2>
<p>Firmometr překládá surová data z ISIR do čtyř srozumitelných stavů:</p>
<ul>
  <li><strong>Bez záznamu (CLEAR)</strong> — firma ani osoby s ní spojené nejsou v ISIR. Zelená.</li>
  <li><strong>Aktivní dlužník (ACTIVE_DEBTOR)</strong> — probíhá insolvenční řízení. Červená — s firmou nespolupracujte nebo vyžadujte platbu předem.</li>
  <li><strong>Aktivní spoludlužník (ACTIVE_CO_DEBTOR)</strong> — firma figuruje jako spoludlužník v cizím řízení. Oranžová — prověřte detaily.</li>
  <li><strong>Minulý dlužník (PAST_DEBTOR)</strong> — řízení je uzavřeno. Zvažte, jak dávno a za jakých okolností k insolvenci došlo.</li>
</ul>

<h2>Na co si dát pozor při interpretaci</h2>
<ul>
  <li><strong>Záznamy na jméno jednatelů</strong> — čistá firma může mít jednatele s osobní insolvencí. U větších zakázek stojí za prověření.</li>
  <li><strong>Datum skončení</strong> — pokud skončila insolvence nedávno, firma nemusí být ještě plně stabilizovaná.</li>
  <li><strong>Typ řízení</strong> — reorganizace (firma funguje dál) je méně alarmující než konkurs (majetek se prodává).</li>
  <li><strong>Opakovaná insolvence</strong> — více řízení po sobě je silný negativní signál.</li>
</ul>

<h2>Proč nestačí jednorázová kontrola</h2>
<p>ISIR se mění v reálném čase. Firma, která je dnes čistá, může být zítra v insolvenci — insolvenční návrh bývá podán nečekaně a jeho zahájení je okamžitě veřejné. Pokud máte s partnerem aktivní obchodní vztah, průběžné sledování je nezbytné.</p>
<p>Firmometr nabízí watchlist: přidejte firmu ke sledování a dostanete e-mail okamžitě po změně insolvenčního stavu. Bezplatný účet umožňuje sledovat až 3 firmy.</p>

<h2>Závěr</h2>
<p>Insolvenční rejstřík je nejdůležitější a nejpřehlíženější kontrolou při hodnocení obchodního partnera. Je zdarma, dostupný online a aktualizovaný v reálném čase. Kontrola přes Firmometr zabere méně než 10 sekund — zadejte IČO a výsledek máte okamžitě.</p>
`;

const ARTICLE_ISIR_EN = `
<p>The Insolvency Register (ISIR) is a publicly accessible database of all insolvency proceedings in the Czech Republic. It is maintained by the Ministry of Justice and is available free of charge. When checking a business partner, ISIR is the first place to look — an active insolvency proceeding is the strongest warning signal company data can provide.</p>

<h2>What is an insolvency proceeding</h2>
<p>An insolvency proceeding is a court process that resolves a situation where a debtor is unable to repay their due obligations. In the Czech Republic there are three main forms:</p>
<ul>
  <li><strong>Bankruptcy (konkurs)</strong> — for companies and individuals. The debtor's assets are liquidated and proceeds distributed to creditors. The company typically ceases to exist afterwards.</li>
  <li><strong>Debt relief (oddlužení)</strong> — for individuals and sole traders. The debtor repays over 3–5 years; remaining debts are discharged.</li>
  <li><strong>Reorganisation</strong> — for larger companies. The business continues operating under a court-approved reorganisation plan.</li>
</ul>

<h2>How to search ISIR</h2>
<p>You can search by:</p>
<ul>
  <li><strong>Company ID (IČO)</strong> — most reliable for companies. One IČO = one entity, unambiguous result.</li>
  <li><strong>Name and surname</strong> — for individuals (sole traders, directors). May return multiple matches.</li>
  <li><strong>Company name</strong> — less reliable; a company may have changed its name.</li>
</ul>
<p>Firmometr checks ISIR automatically as part of every company lookup by IČO. You see the result immediately, without visiting another site.</p>

<h2>Reading results — case reference and status</h2>
<p>ISIR shows key information for each proceeding:</p>
<ul>
  <li><strong>Case reference (spisová značka)</strong> — in the format KSOS 31 INS 1234/2025. "KSOS" identifies the regional court (Regional Court Ostrava), "INS" marks insolvency, the numbers are the case identifier and year.</li>
  <li><strong>Proceeding status</strong> — the most important field. "Probíhající" means active; "Skončené" means closed.</li>
  <li><strong>Type of resolution</strong> — bankruptcy, debt relief, or reorganisation.</li>
  <li><strong>Date initiated</strong> — when the court opened the proceedings.</li>
</ul>

<h2>Four statuses in Firmometr</h2>
<p>Firmometr translates raw ISIR data into four clear statuses:</p>
<ul>
  <li><strong>Clear (CLEAR)</strong> — no records in ISIR. Green light.</li>
  <li><strong>Active debtor (ACTIVE_DEBTOR)</strong> — active insolvency proceedings. Red — do not proceed without payment upfront.</li>
  <li><strong>Active co-debtor (ACTIVE_CO_DEBTOR)</strong> — the company appears as co-debtor in another party's proceedings. Amber — review details.</li>
  <li><strong>Past debtor (PAST_DEBTOR)</strong> — proceedings are closed. Consider how long ago and under what circumstances.</li>
</ul>

<h2>What to watch for when interpreting results</h2>
<ul>
  <li><strong>Records against directors</strong> — a clean company may have a director with a personal insolvency. Worth checking for larger contracts.</li>
  <li><strong>Date of closure</strong> — if insolvency ended recently, the company may not yet be fully stable.</li>
  <li><strong>Type of proceeding</strong> — reorganisation (company keeps operating) is less alarming than bankruptcy (assets being sold).</li>
  <li><strong>Repeated insolvency</strong> — multiple proceedings in succession is a strong negative signal.</li>
</ul>

<h2>Why a one-off check is not enough</h2>
<p>ISIR changes in real time. A company that is clean today can enter insolvency tomorrow — petitions are filed unexpectedly and proceedings become public immediately. If you have an ongoing business relationship, continuous monitoring is essential.</p>
<p>Firmometr's watchlist fills this gap: add a company to monitoring and receive an email the moment its insolvency status changes. A free account covers up to 3 companies.</p>

<h2>Summary</h2>
<p>The Insolvency Register is the most important — and most overlooked — check when assessing a business partner. It is free, available online, and updated in real time. Checking via Firmometr takes under 10 seconds: enter the company ID and get the result immediately.</p>
`;

const ARTICLE_DPH_CS = `
<p>Nespolehlivý plátce DPH je označení, které uděluje Finanční správa ČR firmám a osobám, jež opakovaně nebo závažně porušují povinnosti v oblasti daně z přidané hodnoty. Zveřejněný seznam je bezplatně přístupný online. Pokud vám dodavatel vystavuje faktury s DPH, měli byste ho na tomto seznamu prověřit ještě před první platbou — hrozí vám totiž přímé finanční ručení.</p>

<h2>Kdo se dostane na seznam nespolehlivých plátců</h2>
<p>Finanční správa zařadí plátce DPH na seznam, pokud závažně nebo opakovaně poruší daňové povinnosti, zejména:</p>
<ul>
  <li>Neodvede DPH přes výzvy správce daně</li>
  <li>Opakovaně nepodá přiznání k DPH nebo souhrnné hlášení</li>
  <li>Zapojí se do podvodných transakcí (karuselové obchody, uměle vytvořené řetězce)</li>
</ul>
<p>Zařazení není trvalé — firma může seznam opustit, pokud prokáže řádné plnění povinností. V praxi ale firmy na seznamu zůstávají měsíce i roky.</p>

<h2>Ručení odběratele — největší riziko</h2>
<p>Toto je prakticky nejdůležitější důvod, proč registr sledovat. Zákon o DPH (§ 109) zakotvuje institut ručení: pokud přijmete fakturu od nespolehlivého plátce DPH a dodavatel DPH neodvede, finanční úřad může vymáhat dlužnou daň přímo od vás.</p>
<p>Jinými slovy: zaplatíte DPH dvakrát. Jednou dodavateli jako součást ceny, podruhé finančnímu úřadu jako ručitel. Maximální výše ručení není zákonem omezena — jde o celou DPH z faktury.</p>
<p>Ručení se vztahuje také na platby na <strong>nezveřejněný bankovní účet</strong>. Pokud platíte na jiný účet, než je zveřejněn v registru plátců, ručíte automaticky — bez ohledu na to, zda je dodavatel na blacklistu, nebo ne.</p>

<h2>Jak ověřit DPH status dodavatele</h2>
<ol>
  <li><strong>Firmometr</strong> — zadejte IČO, DPH status včetně zveřejněných účtů uvidíte ihned v profilu firmy</li>
  <li><strong>Registr DPH Finanční správy</strong> — aplikace na webu mfcr.cz, vyhledávání po IČO nebo DIČ</li>
</ol>
<p>Kontrolu provádějte vždy při zahájení spolupráce s novým dodavatelem. U klíčových partnerů sledujte průběžně.</p>

<h2>Ověření bankovního účtu na faktuře</h2>
<p>Plátci DPH mají zákonnou povinnost zveřejňovat bankovní účty, které používají pro podnikání, v registru Finanční správy. Před každou platbou faktury s DPH ověřte:</p>
<ul>
  <li>Číslo účtu na faktuře odpovídá zveřejněnému účtu v registru</li>
  <li>Platíte na správný účet — ne na jiný "provozní" nebo "technický" účet, který dodavatel zveřejněný nemá</li>
</ul>
<p>Firmometr zobrazuje zveřejněné bankovní účty plátce přímo v sekci DPH na profilu firmy.</p>

<h2>Co dělat, pokud je dodavatel na blacklistu</h2>
<ul>
  <li><strong>Využijte institut zvláštního způsobu zajištění daně</strong> — část platby (odpovídající DPH) pošlete přímo na depozitní účet finančního úřadu příslušného pro dodavatele. Tím se zbavíte ručení.</li>
  <li><strong>Domluvte se na přenesené daňové povinnosti (reverse charge)</strong> — pokud to obchodní případ umožňuje.</li>
  <li><strong>Zvažte změnu dodavatele</strong> — nespolehlivý plátce DPH je zpravidla firma v platebních potížích.</li>
</ul>

<h2>Průběžné sledování</h2>
<p>Firma může být na seznam zařazena kdykoli — dnes spolehlivý dodavatel může být za 3 měsíce na blacklistu. Firmometr vás na každou změnu DPH statusu upozorní e-mailem, pokud přidáte firmu do watchlistu.</p>

<h2>Závěr</h2>
<p>Ručení za DPH nespolehlivého plátce je reálné finanční riziko, které lze snadno eliminovat jednoduchou kontrolou. Prověření DPH statusu před přijetím první faktury od nového dodavatele je základní povinností každého účetního a procurement manažera. Zabere 10 sekund a může ušetřit statisíce korun.</p>
`;

const ARTICLE_DPH_EN = `
<p>An "unreliable VAT payer" (nespolehlivý plátce DPH) is a designation assigned by the Czech Financial Administration to companies and individuals who repeatedly or seriously violate their VAT obligations. The published list is freely available online. If your supplier issues invoices with VAT, you should check this list before the first payment — you could face direct financial liability.</p>

<h2>Who ends up on the list</h2>
<p>The Financial Administration adds a VAT payer to the list when they seriously or repeatedly breach tax obligations, including:</p>
<ul>
  <li>Failing to remit VAT despite demands from the tax authority</li>
  <li>Repeatedly failing to file VAT returns or recapitulative statements</li>
  <li>Participating in fraudulent transactions (carousel fraud, artificial supply chains)</li>
</ul>
<p>The designation is not permanent — a company can leave the list by demonstrating proper compliance. In practice, companies tend to remain on the list for months or years.</p>

<h2>Joint liability — the biggest risk</h2>
<p>This is the most practically important reason to monitor the register. The VAT Act (§ 109) establishes the principle of joint liability: if you accept an invoice from an unreliable VAT payer and the supplier fails to remit the VAT, the tax authority can pursue the unpaid tax directly from you.</p>
<p>In other words: you pay VAT twice. Once to the supplier as part of the price, and once to the tax authority as the guarantor. There is no statutory cap on liability — it covers the full VAT amount on the invoice.</p>
<p>Joint liability also applies to payments made to a <strong>bank account not published in the register</strong>. If you pay to a different account than the one listed, you are automatically liable — regardless of whether the supplier is on the blacklist or not.</p>

<h2>How to verify a supplier's VAT status</h2>
<ol>
  <li><strong>Firmometr</strong> — enter the company ID (IČO); VAT status including published bank accounts appears immediately in the company profile</li>
  <li><strong>Czech Financial Administration VAT register</strong> — application on mfcr.cz, searchable by IČO or VAT number (DIČ)</li>
</ol>
<p>Check every time you start working with a new supplier. Monitor key partners on an ongoing basis.</p>

<h2>Verifying the bank account on the invoice</h2>
<p>VAT payers are legally required to publish the bank accounts they use for business in the Financial Administration register. Before every payment of a VAT invoice, verify:</p>
<ul>
  <li>The account number on the invoice matches the published account in the register</li>
  <li>You are paying to the correct account — not some other "operational" or "technical" account the supplier has not published</li>
</ul>
<p>Firmometr displays the supplier's published bank accounts directly in the VAT section of the company profile.</p>

<h2>What to do if your supplier is on the blacklist</h2>
<ul>
  <li><strong>Use the special tax security mechanism</strong> — send the portion of the payment corresponding to VAT directly to the deposit account of the tax office responsible for the supplier. This removes your liability.</li>
  <li><strong>Arrange reverse charge</strong> — if the transaction type permits it.</li>
  <li><strong>Consider switching suppliers</strong> — an unreliable VAT payer is typically a company in financial distress.</li>
</ul>

<h2>Ongoing monitoring</h2>
<p>A company can be added to the list at any time — a reliable supplier today can be on the blacklist in 3 months. Firmometr will notify you by email of any change in VAT status if you add the company to your watchlist.</p>

<h2>Summary</h2>
<p>Joint liability for an unreliable VAT payer's unpaid tax is a real financial risk that can be easily eliminated by a simple check. Verifying VAT status before accepting the first invoice from a new supplier is a basic duty for every accountant and procurement manager. It takes 10 seconds and can save hundreds of thousands of crowns.</p>
`;

const ARTICLE_ARES_CS = `
<p>ARES (Administrativní registr ekonomických subjektů) je centrální databáze Ministerstva financí ČR. Agreguje údaje o podnikajících subjektech z různých státních registrů a je bezplatně přístupný pro každého. Pokud potřebujete ověřit základní údaje o firmě — adresu, IČO, právní formu nebo datum vzniku — ARES je správné místo.</p>

<h2>Co ARES obsahuje</h2>
<p>ARES není vlastní registr, ale agregátor dat z několika zdrojů:</p>
<ul>
  <li><strong>Obchodní rejstřík (OR)</strong> — s.r.o., a.s. a větší podnikatelské subjekty</li>
  <li><strong>Živnostenský rejstřík</strong> — OSVČ a firmy s živnostenským oprávněním</li>
  <li><strong>Registr ekonomických subjektů (RES)</strong> — statistická data a CZ-NACE kódy oborů</li>
  <li><strong>RUIAN</strong> — ověřená adresa sídla z katastru nemovitostí</li>
</ul>
<p>Pro každý subjekt tak ARES poskytuje: IČO, DIČ (pokud je plátce DPH), obchodní firmu, adresu sídla, datum vzniku, právní formu a základní stav (aktivní / zrušený / v likvidaci).</p>

<h2>Jak vyhledat firmu v ARES</h2>
<p>ARES umožňuje vyhledávání třemi způsoby:</p>
<ol>
  <li><strong>Podle IČO</strong> — nejpřesnější. IČO je unikátní identifikátor; vyhledávání vrátí přesně jeden výsledek.</li>
  <li><strong>Podle názvu firmy</strong> — vrací seznam shod. Pozor: stejný nebo podobný název může mít více firem — ověřte, že pracujete se správným IČO.</li>
  <li><strong>Podle adresy</strong> — umožňuje vyhledat všechny subjekty registrované na dané adrese.</li>
</ol>
<p>Firmometr využívá ARES jako primární datový zdroj. Stačí zadat IČO nebo název — Firmometr prohledá ARES a zobrazí výsledky přímo, obohacené o ISIR, DPH registr a Obchodní rejstřík.</p>

<h2>Jak ověřit IČO</h2>
<p>IČO je osmimístné číslo s kontrolní číslicí. Matematická validace funguje takto:</p>
<ul>
  <li>Vynásobte první číslici číslem 8, druhou 7, třetí 6, čtvrtou 5, pátou 4, šestou 3, sedmou 2</li>
  <li>Sečtěte výsledky a vydělte 11; zbytek po dělení odečtěte od 11</li>
  <li>Výsledek musí odpovídat osmé (poslední) číslici IČO</li>
</ul>
<p>Pokud IČO na faktuře neprošlo tímto testem, je buď chybně zapsáno, nebo fiktivní. Firmometr formát IČO validuje automaticky a na neplatný formát upozorní okamžitě.</p>

<h2>ARES vs. ostatní registry — co kde najdete</h2>
<p>ARES pokrývá základní identifikaci firmy. Pro hodnocení rizika nestačí:</p>
<ul>
  <li><strong>Insolvence</strong> — pouze v ISIR (Insolvenční rejstřík)</li>
  <li><strong>DPH spolehlivost</strong> — pouze v registru Finanční správy</li>
  <li><strong>Statutáři, vlastnická struktura, účetní závěrky</strong> — pouze v Obchodním rejstříku</li>
</ul>
<p>Firmometr kombinuje všechny tyto zdroje do jednoho profilu — ARES, ISIR, DPH registr a OR najednou, za 10 sekund.</p>

<h2>Praktické tipy pro práci s ARES</h2>
<ul>
  <li><strong>Ověřte IČO z faktury</strong> — pokud IČO neodpovídá výsledku v ARES (jiný název nebo adresa), je to závažný signál chyby nebo podvodu.</li>
  <li><strong>Zkontrolujte adresu sídla</strong> — hromadná sídla sdílená stovkami firem jsou typická pro schránkové společnosti a obchodní zprostředkovatele bez reálného provozu.</li>
  <li><strong>Datum vzniku</strong> — firma mladší než 1 rok nemá historii; riziko je těžší odhadnout.</li>
  <li><strong>Stav subjektu</strong> — "Aktivní" vs. "Zrušen" nebo "V likvidaci" je zásadní rozdíl. Firma v likvidaci uzavírá provoz, novými smlouvami ji obvykle nezavazujte.</li>
</ul>

<h2>Závěr</h2>
<p>ARES je základ každé firemní prověrky — ověřuje identitu subjektu a základní formální údaje. Pro posouzení rizikovosti obchodního partnera ale samotný ARES nestačí. Firmometr propojuje ARES s ISIR, DPH registrem a Obchodním rejstříkem do jednoho přehledného profilu. Zadejte IČO a za 10 sekund máte kompletní přehled.</p>
`;

const ARTICLE_ARES_EN = `
<p>ARES (Administrative Register of Economic Entities) is a central database run by the Czech Ministry of Finance. It aggregates data about business entities from various state registries and is freely available to the public. If you need to verify basic details about a company — address, company ID, legal form, or date of incorporation — ARES is the right starting point.</p>

<h2>What ARES contains</h2>
<p>ARES is not a registry in its own right but an aggregator pulling from several sources:</p>
<ul>
  <li><strong>Commercial Register (OR)</strong> — limited liability companies (s.r.o.), joint-stock companies (a.s.), and larger businesses</li>
  <li><strong>Trade Licence Register</strong> — sole traders and companies with a trade licence</li>
  <li><strong>Register of Economic Entities (RES)</strong> — statistical data and CZ-NACE industry codes</li>
  <li><strong>RUIAN</strong> — verified registered address from the land and property cadastre</li>
</ul>
<p>For each entity ARES provides: company ID (IČO), VAT number (DIČ, if registered), company name, registered address, date of incorporation, legal form, and basic status (active / dissolved / in liquidation).</p>

<h2>How to search for a company in ARES</h2>
<p>ARES supports three search methods:</p>
<ol>
  <li><strong>By company ID (IČO)</strong> — most precise. The IČO is a unique identifier; the search returns exactly one result.</li>
  <li><strong>By company name</strong> — returns a list of matches. Note: multiple companies can share a similar name — always confirm you are working with the correct IČO.</li>
  <li><strong>By address</strong> — returns all entities registered at a given address.</li>
</ol>
<p>Firmometr uses ARES as its primary data source. Enter a company ID or name — Firmometr queries ARES and presents the results directly, enriched with data from ISIR, the VAT register, and the Commercial Register.</p>

<h2>How to validate a company ID (IČO)</h2>
<p>The IČO is an eight-digit number with a check digit. Mathematical validation works as follows:</p>
<ul>
  <li>Multiply the first digit by 8, the second by 7, the third by 6, the fourth by 5, the fifth by 4, the sixth by 3, and the seventh by 2</li>
  <li>Sum the products and divide by 11; subtract the remainder from 11</li>
  <li>The result must equal the eighth (last) digit of the IČO</li>
</ul>
<p>If the IČO on an invoice fails this test, it is either incorrectly written or fictitious. Firmometr validates the IČO format automatically and flags an invalid format immediately.</p>

<h2>ARES vs. other registries — what to find where</h2>
<p>ARES covers basic company identification. For risk assessment it is not sufficient on its own:</p>
<ul>
  <li><strong>Insolvency</strong> — only in ISIR (Insolvency Register)</li>
  <li><strong>VAT reliability</strong> — only in the Financial Administration register</li>
  <li><strong>Directors, ownership structure, financial statements</strong> — only in the Commercial Register</li>
</ul>
<p>Firmometr combines all these sources into a single profile — ARES, ISIR, VAT register, and Commercial Register together, in 10 seconds.</p>

<h2>Practical tips for using ARES</h2>
<ul>
  <li><strong>Verify the IČO from an invoice</strong> — if the IČO does not match the ARES result (different name or address), that is a serious signal of an error or fraud.</li>
  <li><strong>Check the registered address</strong> — addresses shared by hundreds of companies are typical of shell companies and intermediaries with no real operations.</li>
  <li><strong>Date of incorporation</strong> — a company less than one year old has no track record; risk is harder to assess.</li>
  <li><strong>Entity status</strong> — "Active" vs. "Dissolved" or "In liquidation" is a critical distinction. A company in liquidation is winding down; avoid entering new contracts with it.</li>
</ul>

<h2>Summary</h2>
<p>ARES is the foundation of any company check — it verifies a subject's identity and basic formal details. For assessing the risk of a business partner, ARES alone is not enough. Firmometr combines ARES with ISIR, the VAT register, and the Commercial Register into a single clear profile. Enter a company ID and have a complete overview in 10 seconds.</p>
`;

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'jak-proverit-firmu-pred-spolupraci',
    titleCs: 'Jak prověřit firmu před spoluprací (průvodce 2026)',
    titleEn: 'How to Check a Company Before Working Together (2026 Guide)',
    descriptionCs: 'Kompletní průvodce prověřením obchodního partnera. Zjistěte, jak zkontrolovat insolvenci, DPH registr a obchodní rejstřík — zdarma a za 10 sekund.',
    descriptionEn: 'Complete guide to verifying a business partner. Learn how to check insolvency, the VAT registry, and the Commercial Register — free and in 10 seconds.',
    publishedAt: '2026-05-27',
    readMinutes: 6,
    excerptCs: 'Než podepíšete smlouvu nebo pošlete fakturu, prověřte svého obchodního partnera. Ukážeme vám, jak na to — krok za krokem, zdarma a během pár sekund.',
    excerptEn: 'Before you sign a contract or send an invoice, check your business partner. We show you how — step by step, free and in a few seconds.',
    contentHtmlCs: ARTICLE_CS,
    contentHtmlEn: ARTICLE_EN,
  },
  {
    slug: 'jak-cist-insolvencni-rejstrik',
    titleCs: 'Jak číst insolvenční rejstřík (průvodce ISIR 2026)',
    titleEn: 'How to Read the Czech Insolvency Register (ISIR Guide 2026)',
    descriptionCs: 'Průvodce insolvenčním rejstříkem ISIR: jak vyhledávat, co znamenají jednotlivé stavy, jak číst spisovou značku a proč nestačí jednorázová kontrola.',
    descriptionEn: 'Guide to the Czech Insolvency Register (ISIR): how to search, what each status means, how to read a case reference, and why a one-off check is not enough.',
    publishedAt: '2026-05-29',
    readMinutes: 5,
    excerptCs: 'Insolvenční rejstřík ISIR je nejdůležitější zdroj při hodnocení obchodního partnera. Ukážeme vám, jak ho číst, co hledat a jak rozlišit aktivní řízení od historického záznamu.',
    excerptEn: 'The ISIR insolvency register is the most important source when assessing a business partner. We show you how to read it, what to look for, and how to tell active proceedings from a historical record.',
    contentHtmlCs: ARTICLE_ISIR_CS,
    contentHtmlEn: ARTICLE_ISIR_EN,
  },
  {
    slug: 'nespolehlivy-platce-dph',
    titleCs: 'Nespolehlivý plátce DPH — co to znamená a jak se chránit',
    titleEn: 'Unreliable VAT Payer — What It Means and How to Protect Yourself',
    descriptionCs: 'Co je nespolehlivý plátce DPH, proč vám hrozí ručení za DPH dodavatele a jak zkontrolovat bankovní účet na faktuře. Průvodce pro účetní a nákupčí.',
    descriptionEn: 'What an unreliable VAT payer is, why you face joint liability for their unpaid VAT, and how to verify the bank account on an invoice. A guide for accountants and procurement teams.',
    publishedAt: '2026-06-01',
    readMinutes: 5,
    excerptCs: 'Nespolehlivý plátce DPH není jen varování pro dodavatele — jako odběratel ručíte za jeho nezaplacenou daň. Zjistěte, jak riziko zkontrolovat a jak se mu vyhnout.',
    excerptEn: 'An unreliable VAT payer is not just a warning about a supplier — as their customer you are jointly liable for their unpaid tax. Find out how to check the risk and avoid it.',
    contentHtmlCs: ARTICLE_DPH_CS,
    contentHtmlEn: ARTICLE_DPH_EN,
  },
  {
    slug: 'ares-jak-vyhledat-firmu',
    titleCs: 'ARES — jak vyhledat firmu a co vám registr řekne',
    titleEn: 'ARES — How to Search for a Company and What the Register Tells You',
    descriptionCs: 'Průvodce registrem ARES: jak vyhledávat firmy, co data znamenají, jak ověřit IČO a proč ARES sám nestačí na posouzení rizika obchodního partnera.',
    descriptionEn: 'Guide to the ARES register: how to search for companies, what the data means, how to validate a company ID, and why ARES alone is not enough to assess business partner risk.',
    publishedAt: '2026-06-04',
    readMinutes: 4,
    excerptCs: 'ARES je základní databáze firemních údajů v ČR. Ukážeme vám, jak v ní vyhledávat, jak číst výsledky a co v ARES nenajdete — ale potřebujete vědět.',
    excerptEn: 'ARES is the foundational database of company information in the Czech Republic. We show you how to search it, how to read the results, and what ARES does not tell you — but you need to know.',
    contentHtmlCs: ARTICLE_ARES_CS,
    contentHtmlEn: ARTICLE_ARES_EN,
  },
];

export function findArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find(a => a.slug === slug);
}
