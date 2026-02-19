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

export const BUSINESS_CARD_SYSTEM_PROMPT = `You are a strict Turkish business-card extraction + normalization engine.
Return ONLY valid JSON (one object). No markdown. No explanations.
Never invent data. If uncertain, output null or empty arrays.`;

export function buildBusinessCardUserPrompt(rawText: string): string {
  return `Türkiye kartviziti OCR metninden alanları çıkar. Çıktı SADECE aşağıdaki şemaya uyan TEK bir JSON object olacak. JSON dışında hiçbir şey yazma.

ŞEMA (KESİN):
${SCHEMA_EXAMPLE_JSON}

GENEL KURALLAR:
- OCR metninde olmayan bilgi uydurma.
- name/title/company/website/address yoksa null.
- phones/emails/notes yoksa [].
- social objesi her zaman var; alanlar yoksa null.

ÇOK KRİTİK DOĞRULAMA ve TEMİZLEME (JSON’u döndürmeden önce uygula):

1) phones (mutlak kural):
- phones sadece şu regex’e uyan değerlerden oluşabilir: ^\\+90\\d{10}$
- Aday telefonlardan tüm karakterleri temizle: sadece rakamlar ve en başta opsiyonel + kalsın.
- 0XXXXXXXXXX -> +90XXXXXXXXXX
- 90XXXXXXXXXX -> +90XXXXXXXXXX
- 10 hane kaldıysa -> +90 ekle
- Uymayanı phones’a koyma.
- Fax/Faks numaralarını phones’a koyma; notes’a "Fax: ..." yaz.
- Dahili/ext (/1388, (2706), dahili) phones’a koyma; notes’a "Dahili: ..." yaz.

2) emails:
- emails içine sadece gerçek email formatını koy: içinde '@' ve en az bir '.' olmalı.
- "e-mail:" gibi prefixleri kaldır.
- Bozuk email’i tahmin etme; emin değilsen alma.

3) website (çok sık hata):
- website sadece gerçek domain/URL ise dolu olabilir:
  - www. veya http ile başlar YA DA en az bir nokta içerir ve TLD ile biter (.com, .com.tr, .net, .org, .tr, vb.)
- Aşağıdaki kelimeler geçiyorsa website OLAMAZ (şirket satırı/kısaltma olabilir): A.Ş, AŞ, LTD, ŞTİ, SAN, TİC, DIŞ, ORTAKLIĞI, AKS
- Uygun website yoksa null.

4) address (mutlak kural: sadece fiziksel adres):
- address fiziksel adres satırlarından oluşmalı. İçinde şu token’lar geçen satırları address’e ASLA koyma:
  @, www, http, e-mail, email, tel, telefon, gsm, mobile, fax, faks
- Address’i oluştururken SADECE şu adres ipucu kelimelerini içeren satırlardan topla (en az biri geçmeli):
  Mah, Mah., Mahallesi, Cad, Cad., Caddesi, Sk, Sk., Sok, Sok., Bul, Blv, Blv., No, No:, Kat, Daire, Apt, Plaza, San., Sit., OSB, Posta, PK, ilçe, İstanbul, Ankara, İzmir, Adana, Bursa, Kocaeli, Esenyurt, Beşiktaş, Misis
- Eğer bu şartları sağlayan satır yoksa address = null.
- Address çok uzunsa, sadece en “adres gibi” kısmı bırak (iletişim parçalarını kesin dışarıda tut).
- Address’e girmeyen web/email/tel satırlarını notes’a ekle: "Adres dışı iletişim satırı: ..."

5) name/title/company:
- name kişi adı-soyadı olmalı. Şirket ekleri (A.Ş/LTD/ŞTİ/SAN/TİC) içeriyorsa name olamaz -> null.
- title ünvan olmalı (Manager/Müdür/Architect/Satın Alma/Export vb).
- company şirket adı olmalı; email/telefon/website koyma.

6) multi kişi / multi kart:
- OCR metninde birden fazla kişi/kart varsa: en olası TEK kişiyi seç.
- Diğer kişi/marka satırlarını notes’a ekle.

SON KONTROL (döndürmeden önce):
- phones elemanlarının hepsi ^\\+90\\d{10}$ olmalı; değilse sil.
- address içinde '@' veya 'www' veya 'http' geçiyorsa address’i düzelt veya null yap.
- JSON dışında hiçbir şey yazma.

OCR TEXT:
<<<
${rawText}
>>>`;
}
