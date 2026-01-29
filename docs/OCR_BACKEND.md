# Kartvizit OCR – Platform-Specific (Native Build)

Kartvizit bilgisi alma işlemi **mobil uygulama içinde**, platforma özel OCR ile yapılır. Tesseract kullanılmaz. **Expo Go desteklenmez;** geliştirme build (native build) gerekir.

## OCR Engine

- **iOS:** Apple Vision Framework (veya ML Kit – servis içinde seçim yapılır)
- **Android:** Google ML Kit Text Recognition
- Seçim: `Platform.OS` ile `runOCR(imageUri)` içinde `visionOCR` (iOS) veya `mlKitOCR` (Android) çağrılır

## OCR Servisi

**Tek public metod:** `runOCR(imageUri: string): Promise<string>`

- **Girdi:** Kamera/galeriden alınan görsel URI (örn. `file:///...`)
- **Çıktı:** OCR’dan dönen ham metin
- **İç yapı:**
  - iOS → `visionOCR(imageUri)`
  - Android → `mlKitOCR(imageUri)`

Konum: `src/features/customer/services/ocrService.ts`

## Business Card Parsing (Ortak Mantık)

OCR metni `parseBusinessCardText(rawText)` ile ayrıştırılır. Sadece şu alanlar çıkarılır:

- **customerName** – Ad/soyad veya şirket adı
- **phone1** – Telefon
- **email** – E-posta
- **address** – Adres (isteğe bağlı)
- **website** – Web sitesi (isteğe bağlı)

Vergi no, ID vb. ERP alanları **çıkarılmaz**.

Dönüş tipi: `BusinessCardOcrResult`  
Konum: `src/features/customer/utils/parseBusinessCardText.ts`, `src/features/customer/types/businessCard.ts`

## Form Entegrasyonu (Yeni Müşteri)

Kartvizit tarandıktan sonra sadece eşleşen alanlar doldurulur:

- `customerName` → **Müşteri adı** (name)
- `phone1` → **Telefon** (phone)
- `email` → **E-posta** (email)
- `address` → **Adres** (address)
- `website` → **Web sitesi** (website)

Diğer tüm alanlar boş bırakılır; kullanıcı isterse otomatik doldurulan değerleri düzenleyebilir.

## UX Akışı

1. Kullanıcı "Kartvizit tara" butonuna basar
2. Kamera açılır
3. Fotoğraf çekilir → `imageUri` alınır
4. `runOCR(imageUri)` çağrılır → OCR sırasında loading gösterilir
5. Ham metin `parseBusinessCardText` ile ayrıştırılır
6. Form alanları `BusinessCardOcrResult` ile doldurulur
7. Eksik veya kısmi veride hata fırlatılmaz; bulunan alanlar yazılır

## Mimari

- OCR mantığı UI bileşenlerinde değil, **ocrService** içindedir
- Parsing platformdan bağımsız ve tek yerde: **parseBusinessCardText**
- Form sadece hook üzerinden `scanBusinessCard(onResult)` ile sonucu alır ve `setValue` ile yazar
