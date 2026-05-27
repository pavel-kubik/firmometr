export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readMinutes: number;
  excerpt: string;
  contentHtml: string;
}

const ARTICLE_JAK_PROVERIT = `
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

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'jak-proverit-firmu-pred-spolupraci',
    title: 'Jak prověřit firmu před spoluprací (průvodce 2026)',
    description: 'Kompletní průvodce prověřením obchodního partnera. Zjistěte, jak zkontrolovat insolvenci, DPH registr a obchodní rejstřík — zdarma a za 10 sekund.',
    publishedAt: '2026-05-27',
    readMinutes: 6,
    excerpt: 'Než podepíšete smlouvu nebo pošlete fakturu, prověřte svého obchodního partnera. Ukážeme vám, jak na to — krok za krokem, zdarma a během pár sekund.',
    contentHtml: ARTICLE_JAK_PROVERIT,
  },
];

export function findArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find(a => a.slug === slug);
}
