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

export const BUSINESS_CARD_SYSTEM_PROMPT = `You are a strict business-card information extraction engine.
Return ONLY valid JSON. No markdown. No explanations.
Never invent data. If uncertain, use null or empty arrays.`;

export function buildBusinessCardUserPrompt(rawText: string): string {
  return `Aşağıdaki OCR metni Türkiye kartvizitinden alınmıştır. Görevin: metindeki bilgilere dayanarak tek bir kişi için alanları çıkarmak ve aşağıdaki JSON şemasına birebir uyan tek bir JSON object döndürmektir.
ÇIKTI ŞEMASI (KESİN)
Aşağıdaki alanların dışında hiçbir alan döndürme. Tüm alanlar her zaman mevcut olmalı.
${SCHEMA_EXAMPLE_JSON}
KATI KURALLAR (No-hallucination)
OCR metninde olmayan hiçbir bilgi uydurma.
Emin değilsen:
name/title/company/website/address => null
phones/emails/notes => []
social.* => null
Sadece JSON döndür. Başka hiçbir şey yazma.
ÇOK ÖNEMLİ: KENDİNİ KONTROL ET (Self-check)
JSON'u döndürmeden önce şu kontrolleri yap ve yanlış bulduğun alanı düzelt veya null/[] yap:
1) Website doğrulama (en sık hata!)
website sadece şu koşullarda dolu olabilir:
Gerçek bir domain veya URL gibi görünmeli:
örn: winax.com, www.sinpas.com.tr, https://...
Şunlardan biri olmalı: . içermeli + TLD benzeri bitmeli (.com, .com.tr, .net, .org, .tr, vb.)
Şirket kısaltmaları, departman/ünvan parçaları website OLAMAZ:
Örn "AKS.SAN.DI", "SAN. ve TIC. LTD. ŞTI.", "YATIRIM ORTAKLIĞI A.Ş." gibi şeyleri website'e koyma.
Eğer website gibi görünen tek şey aslında şirket satırının kırpığıysa: website = null yap, o kırpığı notes içine "Şirket satırı parçası olabilir: ..." diye ekle.
2) Email doğrulama
emails içine sadece local@domain.tld formatına uyanları koy.
Nokta/virgül/boşluk yüzünden bozulmuş email'leri düzeltmeye çalışma; emin değilsen alma.
KEP gibi adresler email gibi görünebilir: yine emails içine koyabilirsin ama notes içine "KEP olabilir: ..." da ekle.
3) Telefon doğrulama + TR normalizasyonu
phones sadece E.164 TR formatında olmalı: +90 ile başlayıp toplam 12 haneli numara (ör: +9053XXXXXXXX).
OCR'de şu formatlar olabilir: 0 5xx ..., (0532) ..., +90 212 ..., 0 (212) ...
Normalizasyon:
Başta 0 varsa at, +90 ekle
Başta 90 varsa +90 yap
İçindeki boşluk, parantez, tireleri temizle
Dahili (ext, dahili, /1388, (2706) gibi) phones içine girmesin.
Dahiliyi notes içine "Dahili: 1388" olarak yaz.
Fax numarasını phones içine koyma. notes içine "Fax: ..." yaz.
Şüpheli kısa/uzun numarayı phones içine koyma; notes içine "Şüpheli telefon: ..." yazabilirsin.
4) Name & Title doğrulama
name kişi adı-soyadı olmalı (genelde 2+ kelime).
Tamamı şirket/unvan gibi görünüyorsa (A.Ş. / LTD / SAN. / TIC. vb içeriyorsa) name olamaz -> null yap.
title genelde "Manager, Müdür, Architect, Satın Alma, Export Manager" vb.
"SINPAŞ / WINAX / ORTA DOĞU / LARA SOLAR / ÇUKUROVA" gibi marka/şirket isimlerini title'a koyma.
5) Company doğrulama
company tüzel isim gibi olmalı. Şu ekler olabilir: A.Ş., Ltd. Şti., San. ve Tic.
Company alanına telefon/email/website koyma.
Eğer kartta birden fazla marka/logolar varsa:
En baskın/kurumsal satırdaki tüzel ismi company yap
Diğer markaları notes içine "Marka: ..." olarak ekle.
6) Address doğrulama
address tek string olsun.
Adres satırlarında genelde: Mah., Cad., Sok., No:, Kat:, Daire:, il/ilçe, posta kodu geçer.
Sadece şehir adı gibi tek kelimelik şeyleri "address" yapma; emin değilsen null.
"Fabrika:" / "Plaza:" gibi başlıklar adresin parçası olabilir.
7) Social link doğrulama
social.linkedin sadece linkedin URL/handle gibi görünüyorsa dolu olsun.
x alanına x.com/... veya twitter.com/... gibi link/handle.
Bulamazsan null.
8) Çoklu kişi / çoklu kart durumu
OCR metninde birden fazla kişi adı geçiyorsa:
En olası tek kişiyi seç (kartta en belirgin isim).
Diğer kişi/kişileri notes içine "Diğer kişi olabilir: ..." diye ekle.
Alanları birbirine karıştırma.
NOTLAR ALANI (çok kritik)
Şunları notes içine koy:
Dahili bilgisi (örn "Dahili: 1388")
Fax (örn "Fax: +90...")
Şüpheli/emin olunmayan telefon/email parçaları
Marka/logolar (örn "Marka: Lara Solar")
"Website sandım ama şirket satırı parçası gibi" tespitleri
OCR TEXT
<<<
${rawText}
>>>
Şimdi yalnızca ve yalnızca JSON döndür.
Ek (çok işe yarayan küçük "anti-hata" dokunuşları)
Bu promptu daha da güçlendirmek için Codex'e şu iki şeyi de uygulatabilirsin:
Heuristic gate: rawText içinde "www", "http", ".com", ".com.tr" yoksa website'i varsayılan olarak null bırak (LLM'nin uydurmasını engeller).
Website blacklist: website adayında şu pattern'ler varsa direkt null:
AŞ|A.Ş|LTD|ŞTİ|SAN|TİC|AKS|DIŞ|İÇ|YATIRIM|ORTAKLIĞI (büyük olasılıkla şirket satırı parçası)`;
}
