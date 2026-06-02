import { describe, it, expect } from 'vitest';
import { parseSbirkaListinHtml, listinaYear } from './_or';

// Direct-download layout (e.g. ČEZ): link in the file-ref cell, label + date in later cells.
const DOWNLOAD_LAYOUT = `
<table><tbody>
  <tr>
    <td><a href="./content/download?id=a576d687eac4" title="Stáhnout"><span class="icon"></span></a></td>
    <td>Účetní závěrka [2021] - Rozvaha, Výkaz zisku a ztrát, Příloha</td>
    <td>15.5.2022</td>
  </tr>
  <tr>
    <td><a href="./content/download?id=bb12ff90aa01" title="Stáhnout"><span></span></a></td>
    <td>zakladatelská listina</td>
    <td>1.1.2010</td>
  </tr>
</tbody></table>
`;

// Detail-page layout (e.g. Alza): link wraps the file ref, with a digitized-doc icon span.
const DETAIL_LAYOUT = `
<table><tbody>
  <tr>
    <td><a href="./vypis-sl-detail?dokument=89522237&amp;subjektId=701502&amp;spis=80343"><span>B 8573/SL91</span></a><span class="symbol-doc">&nbsp;</span></td>
    <td><span><span class="symbol">účetní závěrka [2024]</span></span> <span> - předána správcem daně</span></td>
    <td>11.5.2026</td>
  </tr>
  <tr>
    <td>07102127 <a href="./rejstrik-$firma?ico=07102127">(viz obchodní rejstřík)</a></td>
    <td>not a document row</td>
  </tr>
</tbody></table>
`;

describe('parseSbirkaListinHtml — direct download layout', () => {
  const { listiny } = parseSbirkaListinHtml(DOWNLOAD_LAYOUT);

  it('extracts label, filing date and resolves the download URL', () => {
    expect(listiny).toHaveLength(2);
    expect(listiny[0].typListiny).toContain('Účetní závěrka');
    expect(listiny[0].datumVzniku).toBe('15.5.2022');
    expect(listiny[0].url).toBe('https://or.justice.cz/ias/ui/content/download?id=a576d687eac4');
  });
});

describe('parseSbirkaListinHtml — detail-page layout', () => {
  const { listiny } = parseSbirkaListinHtml(DETAIL_LAYOUT);

  it('captures the detail link even with an icon span, and ignores non-document rows', () => {
    expect(listiny).toHaveLength(1); // the "viz obchodní rejstřík" row is not a document
    expect(listiny[0].datumVzniku).toBe('11.5.2026');
    expect(listiny[0].url).toBe(
      'https://or.justice.cz/ias/ui/vypis-sl-detail?dokument=89522237&subjektId=701502&spis=80343',
    );
    expect(listiny[0].url).not.toContain('&amp;');
  });

  it('takes the longest cell as the type label and strips inner markup', () => {
    expect(listiny[0].typListiny).toBe('účetní závěrka [2024] - předána správcem daně');
  });
});

describe('listinaYear', () => {
  it('reads the bracketed year', () => {
    expect(listinaYear('účetní závěrka [2024] - …')).toBe(2024);
  });
  it('falls back to a bare year', () => {
    expect(listinaYear('výroční zpráva 2019')).toBe(2019);
  });
  it('returns null when no plausible year', () => {
    expect(listinaYear('notářský zápis [NZ 1341/2018] bez roku')).toBe(2018); // NZ id year still matches
    expect(listinaYear('zakladatelská listina')).toBeNull();
  });
});

describe('parseSbirkaListinHtml — empty / unrelated', () => {
  it('returns nothing when no document links are present', () => {
    const { listiny, celkem } = parseSbirkaListinHtml('<table><tr><td>nic</td></tr></table>');
    expect(listiny).toHaveLength(0);
    expect(celkem).toBe(0);
  });
});
