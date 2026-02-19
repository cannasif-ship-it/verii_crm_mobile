const SCHEMA_EXAMPLE_JSON = `{
  "name": "string | null",
  "title": "string | null",
  "company": "string | null",
  "phones": ["string"],
  "emails": ["string"],
  "website": "string | null",
  "address": "string | null",
  "social": {
    "linkedin": "string | null",
    "instagram": "string | null",
    "x": "string | null",
    "facebook": "string | null"
  },
  "notes": ["string"]
}`;

const FEW_SHOT_EXAMPLES = `
--- ÖRNEK 1 (Standart Kart: Tel/Faks/Gsm etiketleri, marka adı) ---
OCR METNİ:
winax
TARIK HOSKAN
EXPORT AREA MANAGER
EREN PVC KAPI VE PENCERE AKS.SAN.DIŞ TİC.LTD.ŞTİ.
Orhan Gazi Mah.Isıso San.Sit.
14.Yol Sok. U-1 Blok No:10-12
Esenyurt-İSTANBUL
Tel : +90 212 623 04 50
Faks : +90 212 623 04 77
Gsm : +90 530 955 04 31
web: www.winax.com e-mail: tarik@winax.com

DOĞRU JSON:
{
  "name": "Tarık Hoskan",
  "title": "Export Area Manager",
  "company": "Eren PVC Kapı ve Pencere Aks.San.Dış Tic.Ltd.Şti.",
  "phones": ["+905309550431", "+902126230450"],
  "emails": ["tarik@winax.com"],
  "website": "www.winax.com",
  "address": "Orhan Gazi Mah. Isıso San. Sit. 14. Yol Sok. U-1 Blok No:10-12, Esenyurt/İstanbul",
  "social": {"linkedin": null, "instagram": null, "x": null, "facebook": null},
  "notes": ["Fax: +902126230477", "Marka: winax"]
}
NEDEN:
- Gsm=mobil(5xx) → phones'a İLK sıraya. Tel=sabit hat → phones'a sonra.
- Faks → phones'a GİRMEZ, notes'a "Fax: +90..." yazılır.
- "winax" marka adı, resmi şirket adı değil → notes'a "Marka: winax".
- address sadece fiziksel adres satırları (Tel/Faks/web/email satırları yok).
- OCR büyük harf yazsa bile name/title/company düzgün yazılır (Title Case).

--- ÖRNEK 2 (Dahili Numara / Extension) ---
OCR METNİ:
SİNPAŞ REAL ESTATE
INVESTMENT COMPANY
Dikilitaş Mah. Yenidoğan Sok.
No:36 34349
Beşiktaş / İSTANBUL / TURKEY
Tel: +90 (212) 310 27 00 / 1388
Fax: +90 (212) 259 87 14
serdar.bilgin@sinpas.com.tr
www.sinpas.com.tr
Serdar BİLGİN
Architect
Purchasing and Logistics Chief

DOĞRU JSON:
{
  "name": "Serdar Bilgin",
  "title": "Architect, Purchasing and Logistics Chief",
  "company": "Sinpaş Real Estate Investment Company",
  "phones": ["+902123102700"],
  "emails": ["serdar.bilgin@sinpas.com.tr"],
  "website": "www.sinpas.com.tr",
  "address": "Dikilitaş Mah. Yenidoğan Sok. No:36, 34349, Beşiktaş/İstanbul",
  "social": {"linkedin": null, "instagram": null, "x": null, "facebook": null},
  "notes": ["Dahili: 1388", "Fax: +902122598714"]
}
NEDEN:
- Tel satırındaki "/1388" dahili numaradır → BAZ NUMARA (+902123102700) phones'a GİRER, dahili notes'a.
- Fax numarası phones'a GİRMEZ → notes'a "Fax: +90..." yazılır.
- 34349 posta kodudur, adresin parçası.
- "TURKEY" ülke bilgisi adrese eklenmez.

--- ÖRNEK 3 (T/M etiketleri, kısaltma + tam ad) ---
OCR METNİ:
Serkan DURMUŞ
Meclis Üyesi
BURSA
BÜYÜRSE
TÜRKİYE
BÜYÜR
Organize Sanayi Bölgesi
Mavi Cadde 2.Sokak No:2
16140 Nilüfer/BURSA
T I +90 (224) 275 16 30
M I +90 (532) 665 75 10
serkandurmus061@hotmail.com
www.btso.org.tr
BTSO
BURSA TİCARET VE SANAYİ ODASI

DOĞRU JSON:
{
  "name": "Serkan Durmuş",
  "title": "Meclis Üyesi",
  "company": "BTSO - Bursa Ticaret ve Sanayi Odası",
  "phones": ["+905326657510", "+902242751630"],
  "emails": ["serkandurmus061@hotmail.com"],
  "website": "www.btso.org.tr",
  "address": "Organize Sanayi Bölgesi, Mavi Cad. 2. Sok. No:2, 16140 Nilüfer/Bursa",
  "social": {"linkedin": null, "instagram": null, "x": null, "facebook": null},
  "notes": []
}
NEDEN:
- "T I" veya "T |" veya "T:" = Tel (sabit hat). "M I" veya "M |" = Mobil.
- Mobil(5xx) → İLK sıra. Sabit hat → sonra.
- "BURSA BÜYÜRSE TÜRKİYE BÜYÜR" slogan → hiçbir alana girmez, atlanır.
- "BTSO" kısaltma + "BURSA TİCARET VE SANAYİ ODASI" tam adı birleştirilir.
- "Organize Sanayi Bölgesi" adresin parçasıdır.
- 16140 posta kodudur.`;

export const BUSINESS_CARD_SYSTEM_PROMPT = `You are a strict JSON-only extraction engine for Turkish business cards.
CRITICAL:
1. Return ONLY a single valid JSON object. No markdown code fences. No explanations. No extra text before or after JSON.
2. NEVER invent or guess information not clearly present in the OCR text. If uncertain → null or [].
3. Parse Turkish characters carefully: ş, ç, ğ, ı, ö, ü, İ, Ş, Ç, Ğ, Ö, Ü.
4. OCR text may have minor errors — fix OBVIOUS typos only (e.g. "l" for "I", "0" for "O" in names). Do NOT guess.`;

export function buildBusinessCardUserPrompt(rawText: string): string {
  return `Türkiye kartviziti OCR metninden alanları çıkar. Çıktı SADECE aşağıdaki şemaya uyan TEK bir JSON object olacak. JSON dışında hiçbir şey yazma.

ŞEMA:
${SCHEMA_EXAMPLE_JSON}

══════════════════════════════════════════════
KURALLAR (HARFİYEN UYGULA):
══════════════════════════════════════════════

1) PHONES — Telefon Numaraları:
- Çıktı formatı KESİN: "+90XXXXXXXXXX" (+ işareti, 90, ardından 10 rakam = toplam 13 karakter).
- Tüm boşluk, parantez, tire, nokta ayırıcıları sil.
- Dönüştürme:
  0XXXXXXXXXX → +90XXXXXXXXXX
  90XXXXXXXXXX → +90XXXXXXXXXX
  (0XXX) XXX XX XX → +90XXXXXXXXXX
  +90 (XXX) XXX XX XX → +90XXXXXXXXXX
  10 rakam varsa → başına +90 ekle
- ETİKET TANIMA:
  "Tel", "Tel:", "Telefon", "T", "T |", "T:", "T I" → sabit hat telefon
  "Gsm", "Gsm:", "Cep", "Mobile", "M", "M |", "M:", "M I" → mobil telefon
  "Fax", "Faks", "F", "F:" → FAX numarası → phones'a KOYMA → notes'a "Fax: +90XXXXXXXXXX"
- DAHİLİ / EXTENSION:
  "/1388", "/ 1388" → dahili. BAZ numarayı phones'a KOY + notes'a "Dahili: 1388"
  "(2706)" (sonunda parantez) → dahili. BAZ numarayı phones'a KOY + notes'a "Dahili: 2706"
  "dahili 1234", "ext 1234" → dahili. BAZ numarayı phones'a KOY + notes'a "Dahili: 1234"
  ÖNEMLİ: Dahili VARSA bile baz numara phones'a GİRMELİ!
- SIRALAMA: Mobil numaralar (5XX ile başlayan) phones dizisinde İLK sırada.
- Tekrar yok: Aynı numara iki kez eklenmez.
- Regex'e uymayan şüpheli numara phones'a KONMAZ.

2) EMAILS:
- Gerçek email formatı: "@" ve en az bir "." içermeli.
- "e-mail:", "email:", "mail:" prefixlerini sil.
- Bozuk/şüpheli email'i UYDURMA. Emin değilsen ekleme.

3) WEBSITE:
- Gerçek domain/URL: www. veya http ile başlar VEYA en az bir nokta + TLD (.com, .com.tr, .net, .org, .tr, .org.tr vb.)
- ŞİRKET ADI/KISALTMA OLAN STRING website OLAMAZ: A.Ş, AŞ, LTD, ŞTİ, SAN, TİC, DIŞ, AKS, ORTAKLIĞI, GAYRİMENKUL
- "@" içeriyorsa website OLAMAZ (email'dir).
- Yoksa null.

4) ADDRESS — Fiziksel Adres:
- SADECE fiziksel adres satırlarından oluşur.
- Adres ipucu kelimeleri: Mah, Mahalle, Mahallesi, Cad, Cadde, Caddesi, Sok, Sokak, Sk, Bulvar, Blv, Blok, No:, Kat, Daire, Apt, Plaza, Han, İş Merkezi, San., Sit., OSB, Bölge, Bölgesi, Organize, posta kodu (5 haneli: 16140, 34349)
- Şehir/ilçe adları da ipucu: İstanbul, Ankara, İzmir, Bursa, Esenyurt, Beşiktaş, Nilüfer, Dikilitaş, Kadıköy, Beylikdüzü, Ataşehir, Kocaeli, Antalya, Konya, Gaziantep, Mersin vb.
- ŞU TOKEN'LAR GEÇEN SATIRI ASLA ADDRESS'E KOYMA: @, www, http, e-mail, email, tel, gsm, mobile, fax, faks, telefon
- Yoksa veya emin değilsen null.

5) NAME / TITLE / COMPANY:
- name: Kişi adı-soyadı. Şirket ekleri (A.Ş, LTD, ŞTİ, SAN, TİC) içeriyorsa → null. Tek kelime ise → null.
- title: Unvan/pozisyon (Manager, Müdür, Architect, Satın Alma Yönetmeni, Meclis Üyesi vb.)
- company: Resmi şirket/kuruluş adı. Kısaltma + tam ad varsa birleştir (ör: "BTSO - Bursa Ticaret ve Sanayi Odası"). Marka adı (logo yazısı gibi) farklıysa → notes'a "Marka: xxx".
- Email/telefon/website hiçbir zaman name/company OLAMAZ.

6) MULTI-KİŞİ / MULTI-KART:
- OCR'da birden fazla kişi adı/email/cep numarası → çoklu kart taranmış demektir.
- SADECE İLK/EN BELİRGİN kişiyi seç.
- Diğer kişi bilgilerini notes'a ekle: "Diğer kişi: Ad Soyad, email, telefon"
- Emin olamadığın bilgiyi UYDURMA.

7) SLOGAN / MOTTO / REKLAM:
- Kartvizitlerdeki sloganlar (ör: "Bursa Büyürse Türkiye Büyür") ne name, ne company, ne address.
- Yoksay veya kısaca notes'a ekle.

══════════════════════════════════════════════
GERÇEK KARTVİZİT ÖRNEKLERİ (öğren ve uygula):
══════════════════════════════════════════════
${FEW_SHOT_EXAMPLES}

══════════════════════════════════════════════
SON KONTROL (JSON döndürmeden önce):
══════════════════════════════════════════════
✓ phones: Her eleman "^\\+90\\d{10}$" kalıbına uymalı. Uymayan → sil.
✓ phones: Fax numarası phones'ta OLMAMALI → notes'a taşı.
✓ phones: Dahili/extension phones'ta OLMAMALI → baz numara phones'ta, dahili notes'ta.
✓ phones: Mobil (5XX) numaralar dizide İLK sırada.
✓ address: "@", "www", "http", "tel", "fax" geçiyorsa → düzelt veya null.
✓ website: "@" içeriyorsa → null.
✓ name: Şirket adına benziyorsa → null.
✓ company: Email/web/telefon içeriyorsa → temizle.
✓ OCR metninde OLMAYAN bilgiyi UYDURMA. Emin değilsen null/[] bırak.
✓ JSON dışında HİÇBİR ŞEY yazma.

OCR TEXT:
<<<
${rawText}
>>>`;
}
