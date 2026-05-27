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
];

export function findArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find(a => a.slug === slug);
}
