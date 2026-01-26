# 📱 Quotations Create Sayfası - React Native Expo Geliştirme Promptu

## 🎯 Sayfa Amacı ve İşlevi

`/quotations/create` sayfası, yeni bir teklif (quotation) oluşturmak için kullanılan kompleks bir form sayfasıdır. Bu sayfa, teklif başlık bilgileri, satırlar (lines), döviz kurları ve tüm hesaplamaları içerir.

### Temel İşlevler:
1. **Teklif Başlık Bilgileri**: Müşteri, temsilci, ödeme tipi, teslimat tarihi vb.
2. **Satır Ekleme/Düzenleme**: Ürün seçimi, fiyatlandırma, indirimler
3. **Döviz Kuru Yönetimi**: Çoklu para birimi desteği
4. **Fiyat Kuralları**: Müşteri ve temsilciye özel fiyat kuralları
5. **İndirim Limitleri**: Kullanıcı bazlı indirim limit kontrolleri
6. **Hesaplamalar**: Otomatik toplam, KDV, indirim hesaplamaları
7. **Validasyon**: Form validasyonu ve iş kuralları kontrolleri
8. **Teklif Kaydetme**: Tüm verileri backend'e gönderme

---

## 🏗️ Mimari Yapı

### Component Hiyerarşisi:
```
QuotationCreateForm (Ana Component)
├── QuotationHeaderForm (Başlık Formu)
│   ├── Müşteri Seçimi (CRM/ERP)
│   ├── Temsilci Seçimi
│   ├── Ödeme Tipi
│   ├── Teslimat Tarihi
│   ├── Para Birimi
│   ├── Döviz Kurları Dialog
│   └── Diğer alanlar
├── QuotationLineTable (Satır Tablosu)
│   ├── Satır Listesi
│   ├── Satır Ekleme Dialog
│   ├── Satır Düzenleme Dialog
│   ├── Satır Silme Dialog
│   └── QuotationLineForm (Satır Formu)
│       ├── Ürün Seçimi
│       ├── Miktar, Birim Fiyat
│       ├── İndirim Oranları (1, 2, 3)
│       ├── KDV Oranı
│       └── Hesaplamalar
└── QuotationSummaryCard (Özet Kartı)
    ├── Ara Toplam
    ├── KDV Toplamı
    └── Genel Toplam
```

### Kullanılan Hook'lar:
- `useCreateQuotationBulk()` - Teklif oluşturma mutation
- `useCustomerOptions()` - Müşteri listesi
- `usePriceRuleOfQuotation()` - Fiyat kuralları
- `useUserDiscountLimitsBySalesperson()` - İndirim limitleri
- `useExchangeRate()` - Döviz kurları
- `useQuotationCalculations()` - Hesaplama fonksiyonları
- `useProductSelection()` - Ürün seçimi ve fiyatlandırma
- `useShippingAddresses()` - Teslimat adresleri
- `useUsers()` - Temsilci listesi
- `usePaymentTypes()` - Ödeme tipleri
- `useErpCustomers()` - ERP müşterileri
- `useCurrencyOptions()` - Para birimi seçenekleri

---

## 🌐 API İstekleri ve Endpoint'ler

### 1. Müşteri Listesi (Customer Options)

**Endpoint:** `GET /api/customer/options` (veya benzeri)

**Request:**
- Method: `GET`
- Headers: Standart auth headers
- Query: Yok

**Response:**
```typescript
Array<{
  id: number;
  name: string;
  customerCode?: string | null;
  erpCode?: string | null;
  customerTypeId?: number;
}>
```

**Kullanım:**
- Müşteri dropdown'ında gösterilir
- `potentialCustomerId` seçildiğinde, `customerCode` alınır

---

### 2. ERP Müşterileri

**Endpoint:** `GET /api/erp/customers` (veya benzeri)

**Request:**
- Method: `GET`
- Headers: Standart auth headers

**Response:**
```typescript
Array<{
  cariKod: string;
  cariIsim: string;
  // diğer ERP alanları
}>
```

**Kullanım:**
- ERP müşteri kodu ile arama yapıldığında kullanılır
- `erpCustomerCode` ile eşleştirme yapılır

---

### 3. Temsilci Listesi (Users)

**Endpoint:** `GET /api/user/list` (veya benzeri)

**Request:**
- Method: `GET`
- Headers: Standart auth headers

**Response:**
```typescript
Array<{
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
}>
```

**Kullanım:**
- Temsilci dropdown'ında gösterilir
- Default: Giriş yapan kullanıcı (`user.id`)

---

### 4. Ödeme Tipleri (Payment Types)

**Endpoint:** `GET /api/payment-type/list` (veya benzeri)

**Request:**
- Method: `GET`
- Headers: Standart auth headers

**Response:**
```typescript
Array<{
  id: number;
  name: string;
}>
```

**Kullanım:**
- Ödeme tipi dropdown'ında gösterilir
- **ZORUNLU ALAN**: Form submit'te kontrol edilir

---

### 5. Teslimat Adresleri (Shipping Addresses)

**Endpoint:** `GET /api/shipping-address/customer/{customerId}` (veya benzeri)

**Request:**
- Method: `GET`
- Headers: Standart auth headers
- Path Parameter: `customerId` (number)

**Response:**
```typescript
Array<{
  id: number;
  addressText: string;
  customerId: number;
}>
```

**Kullanım:**
- Müşteri seçildiğinde, o müşteriye ait adresler yüklenir
- Teslimat adresi dropdown'ında gösterilir

---

### 6. Döviz Kurları (Exchange Rates)

**Endpoint:** `GET /api/erp/exchange-rate` (veya benzeri)

**Request:**
- Method: `GET`
- Headers: Standart auth headers
- Query Parameters:
  - `tarih?`: Date (ISO string, opsiyonel)
  - `fiyatTipi?`: number (default: 1)

**Response:**
```typescript
Array<{
  dovizTipi: number;
  dovizIsmi: string;
  kur: number;
  tarih: string;
  // diğer alanlar
}>
```

**Kullanım:**
- Para birimi değişimlerinde kullanılır
- Fiyat dönüşümlerinde kullanılır
- `staleTime`: 5 dakika

---

### 7. Para Birimi Seçenekleri (Currency Options)

**Endpoint:** `GET /api/currency/options` (veya benzeri)

**Request:**
- Method: `GET`
- Headers: Standart auth headers

**Response:**
```typescript
Array<{
  code: string;        // 'TRY', 'USD', 'EUR'
  dovizTipi: number;   // 1, 2, 3...
  dovizIsmi: string;   // 'Türk Lirası', 'Amerikan Doları'
}>
```

**Kullanım:**
- Para birimi dropdown'ında gösterilir
- Döviz kuru eşleştirmelerinde kullanılır

---

### 8. Fiyat Kuralları (Price Rules)

**Endpoint:** `GET /api/quotation/price-rule-of-quotation`

**Request:**
- Method: `GET`
- Headers: Standart auth headers
- Query Parameters:
  - `customerCode`: string (ZORUNLU)
  - `salesmenId`: number (ZORUNLU)
  - `quotationDate`: string (ISO date, ZORUNLU)

**Response:**
```typescript
{
  success: boolean;
  data: PricingRuleLineGetDto[];
}

interface PricingRuleLineGetDto {
  id: number;
  pricingRuleHeaderId: number;
  stokCode: string;              // Ürün kodu
  minQuantity: number;           // Minimum miktar
  maxQuantity?: number | null;  // Maximum miktar
  fixedUnitPrice?: number | null; // Sabit birim fiyat
  currencyCode: string;          // Para birimi
  discountRate1: number;         // İndirim oranı 1
  discountAmount1: number;        // İndirim tutarı 1
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}
```

**Kullanım:**
- Müşteri kodu, temsilci ID ve teklif tarihi seçildiğinde otomatik yüklenir
- Ürün seçildiğinde, miktar ve ürün koduna göre uygun fiyat kuralı bulunur
- `enabled`: `!!customerCode && !!salesmenId && !!quotationDate`
- `staleTime`: 2 dakika

**Kontrol:**
- Ürün kodu (`stokCode`) eşleşmeli
- Miktar `minQuantity` ve `maxQuantity` arasında olmalı
- Eşleşen kural varsa, fiyat ve indirimler otomatik uygulanır

---

### 9. Kullanıcı İndirim Limitleri (User Discount Limits)

**Endpoint:** `GET /api/UserDiscountLimit/salesperson/{salespersonId}`

**Request:**
- Method: `GET`
- Headers: Standart auth headers
- Path Parameter: `salespersonId` (number)

**Response:**
```typescript
{
  success: boolean;
  data: UserDiscountLimitDto[];
}

interface UserDiscountLimitDto {
  erpProductGroupCode: string;    // Ürün grup kodu
  salespersonId: number;          // Temsilci ID
  salespersonName: string;        // Temsilci adı
  maxDiscount1: number;           // Maksimum indirim 1 (%)
  maxDiscount2?: number | null;   // Maksimum indirim 2 (%)
  maxDiscount3?: number | null;   // Maksimum indirim 3 (%)
  id?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  deletedBy?: number | null;
}
```

**Kullanım:**
- Temsilci seçildiğinde otomatik yüklenir
- Ürün grup koduna göre indirim limitleri kontrol edilir
- `enabled`: `!!salespersonId && salespersonId > 0`
- `staleTime`: 5 dakika

**Kontrol:**
- Ürün grup kodu (`groupCode`) ile eşleşen limit bulunur
- `discountRate1 > maxDiscount1` → Onay gerekir (`approvalStatus = 1`)
- `discountRate2 > maxDiscount2` → Onay gerekir
- `discountRate3 > maxDiscount3` → Onay gerekir
- Limit aşılırsa, satır `approvalStatus = 1` olarak işaretlenir

---

### 10. Ürün Fiyatı (Price of Product)

**Endpoint:** `GET /api/quotation/price-of-product`

**Request:**
- Method: `GET`
- Headers: Standart auth headers
- Query Parameters:
  - `request[0].productCode`: string
  - `request[0].groupCode`: string
  - `request[1].productCode`: string (birden fazla ürün için)
  - `request[1].groupCode`: string
  - ... (array formatında)

**Query String Örneği:**
```
GET /api/quotation/price-of-product?request[0].productCode=PROD001&request[0].groupCode=GRP01&request[1].productCode=PROD002&request[1].groupCode=GRP01
```

**Response:**
```typescript
{
  success: boolean;
  data: PriceOfProductDto[];
}

interface PriceOfProductDto {
  productCode: string;        // Ürün kodu
  groupCode: string;          // Grup kodu
  currency: string;           // Para birimi kodu veya dovizTipi (string)
  listPrice: number;          // Liste fiyatı
  costPrice: number;          // Maliyet fiyatı
  discount1?: number | null;  // İndirim 1 (%)
  discount2?: number | null;  // İndirim 2 (%)
  discount3?: number | null;  // İndirim 3 (%)
}
```

**Kullanım:**
- Ürün seçildiğinde çağrılır
- İlgili ürünler (related products) için de çağrılır
- Fiyat ve indirim bilgileri alınır
- Para birimi dönüşümü yapılır (gerekirse)

**Kontrol:**
- Response boş veya hatalı ise, default değerler kullanılır
- Para birimi farklıysa, döviz kuru ile dönüşüm yapılır

---

### 11. Belge Seri Tipleri (Document Serial Types)

**Endpoint:** `GET /api/document-serial-type/available` (veya benzeri)

**Request:**
- Method: `GET`
- Headers: Standart auth headers
- Query Parameters:
  - `customerTypeId?`: number
  - `representativeId?`: number
  - `documentType`: number (PricingRuleType.Quotation)

**Response:**
```typescript
Array<{
  id: number;
  name: string;
  // diğer alanlar
}>
```

**Kullanım:**
- Belge seri tipi dropdown'ında gösterilir
- Müşteri tipi ve temsilciye göre filtrelenir

---

### 12. Teklif Oluşturma (Bulk Create)

**Endpoint:** `POST /api/quotation/bulk-quotation`

**Request:**
- Method: `POST`
- Headers:
  - `Authorization: Bearer {token}`
  - `X-Language: {dil}`
  - `X-Branch-Code: {şube_kodu}`
  - `Content-Type: application/json`
- Body:
```typescript
{
  quotation: CreateQuotationDto;
  lines: CreateQuotationLineDto[];
  exchangeRates?: QuotationExchangeRateCreateDto[];
}

interface CreateQuotationDto {
  potentialCustomerId?: number | null;
  erpCustomerCode?: string | null;
  deliveryDate?: string | null;          // ISO date string
  shippingAddressId?: number | null;
  representativeId?: number | null;
  status?: number | null;
  description?: string | null;           // Max 500 karakter
  paymentTypeId?: number | null;        // ZORUNLU (frontend'de kontrol)
  documentSerialTypeId?: number | null;
  offerType: string;                     // 'Domestic' | 'Export'
  offerDate?: string | null;            // ISO date string
  offerNo?: string | null;              // Max 50 karakter
  revisionNo?: string | null;            // Max 50 karakter
  revisionId?: number | null;
  currency: string;                      // ZORUNLU
}

interface CreateQuotationLineDto {
  quotationId: number;                  // 0 (yeni oluşturuluyor)
  productId?: number | null;             // 0 veya null
  productCode: string;                    // ZORUNLU
  productName: string;                    // ZORUNLU
  groupCode?: string | null;
  quantity: number;                       // ZORUNLU, > 0
  unitPrice: number;                      // ZORUNLU, >= 0
  discountRate1: number;                 // 0-100 arası
  discountAmount1: number;                // Hesaplanmış
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  vatRate: number;                       // 0-100 arası
  vatAmount: number;                     // Hesaplanmış
  lineTotal: number;                      // Hesaplanmış (indirimler sonrası)
  lineGrandTotal: number;                 // Hesaplanmış (KDV dahil)
  description?: string | null;
  pricingRuleHeaderId?: number | null;
  relatedStockId?: number | null;
  relatedProductKey?: string | null;
  isMainRelatedProduct?: boolean;
  approvalStatus?: ApprovalStatus;        // 0: Gerekmez, 1: Gerekir
}

interface QuotationExchangeRateCreateDto {
  quotationId: number;                   // 0
  currency: string;                      // Para birimi kodu
  exchangeRate: number;                  // Kur değeri
  exchangeRateDate: string;              // ISO date string
  isOfficial?: boolean;                  // Default: true
}
```

**Response:**
```typescript
{
  success: boolean;
  data: QuotationGetDto;                 // Oluşturulan teklif
  message?: string;
  statusCode?: number;
}
```

**Mutation Davranışı:**
- Başarılı olursa:
  - `quotations` query'sini invalidate eder
  - Başarı toast mesajı gösterir: "Teklif Başarıyla Oluşturuldu"
  - Detay sayfasına yönlendirir: `/quotations/{quotationId}`
- Hata olursa:
  - Hata toast mesajı gösterir (10 saniye süreyle)
  - Hata detayları gösterilir

**Validasyonlar (Frontend):**
1. **Satır Kontrolü:**
   - `lines.length === 0` → Hata: "En az 1 satır eklenmelidir"

2. **Para Birimi Kontrolü:**
   - `currency` boş veya '0' → Hata: "Geçerli bir para birimi seçilmelidir"

3. **Ödeme Tipi Kontrolü:**
   - `paymentTypeId` yok → Hata: "Ödeme tipi seçilmelidir"

4. **Teslimat Tarihi Kontrolü:**
   - `deliveryDate` yok → Hata: "Teslimat tarihi girilmelidir"

5. **Form Validasyonu (Zod Schema):**
   - `offerType`: Zorunlu
   - `currency`: Zorunlu, min 1 karakter
   - `erpCustomerCode`: Max 50 karakter
   - `description`: Max 500 karakter
   - `offerNo`: Max 50 karakter
   - `revisionNo`: Max 50 karakter

6. **Satır Validasyonları:**
   - `productCode`: Zorunlu, boş olamaz
   - `productName`: Zorunlu, boş olamaz
   - `quantity`: > 0 olmalı
   - `unitPrice`: >= 0 olmalı
   - `discountRate1/2/3`: 0-100 arası
   - `vatRate`: 0-100 arası

---

## 📊 State Yönetimi

### Local State (useState):
```typescript
const [lines, setLines] = useState<QuotationLineFormState[]>([]);
const [exchangeRates, setExchangeRates] = useState<QuotationExchangeRateFormState[]>([]);
const [pricingRules, setPricingRules] = useState<PricingRuleLineGetDto[]>([]);
const [temporarySallerData, setTemporarySallerData] = useState<UserDiscountLimitDto[]>([]);
```

### Form State (React Hook Form):
```typescript
const form = useForm<CreateQuotationSchema>({
  resolver: zodResolver(createQuotationSchema),
  defaultValues: {
    quotation: {
      offerType: 'Domestic',
      currency: '',
      offerDate: new Date().toISOString().split('T')[0],
      representativeId: user?.id || null,
    },
  },
});
```

### Watched Values:
```typescript
const watchedCurrency = Number(form.watch('quotation.currency') ?? '2');
const watchedCustomerId = form.watch('quotation.potentialCustomerId');
const watchedErpCustomerCode = form.watch('quotation.erpCustomerCode');
const watchedRepresentativeId = form.watch('quotation.representativeId');
const watchedOfferDate = form.watch('quotation.offerDate');
```

### Server State (TanStack Query):
- `useCustomerOptions()` → Müşteri listesi
- `usePriceRuleOfQuotation()` → Fiyat kuralları (conditional)
- `useUserDiscountLimitsBySalesperson()` → İndirim limitleri (conditional)
- `useExchangeRate()` → Döviz kurları
- `useShippingAddresses()` → Teslimat adresleri (conditional)
- `useUsers()` → Temsilci listesi
- `usePaymentTypes()` → Ödeme tipleri
- `useErpCustomers()` → ERP müşterileri
- `useCurrencyOptions()` → Para birimi seçenekleri
- `useCreateQuotationBulk()` → Mutation

### Global State (Zustand):
- `useUIStore()` → `{ setPageTitle }`
- `useAuthStore()` → `{ user }`

---

## 🔄 Hesaplama Mantığı

### Satır Hesaplamaları (calculateLineTotals):

```typescript
function calculateLineTotals(line: QuotationLineFormState): QuotationLineFormState {
  // 1. Temel tutar
  const baseAmount = line.quantity * line.unitPrice;
  
  // 2. İndirim 1 uygulanır
  let currentAmount = baseAmount;
  const discount1Amount = currentAmount * (line.discountRate1 / 100);
  currentAmount = currentAmount - discount1Amount;
  
  // 3. İndirim 2 uygulanır (indirim 1 sonrası tutar üzerinden)
  const discount2Amount = currentAmount * (line.discountRate2 / 100);
  currentAmount = currentAmount - discount2Amount;
  
  // 4. İndirim 3 uygulanır (indirim 2 sonrası tutar üzerinden)
  const discount3Amount = currentAmount * (line.discountRate3 / 100);
  currentAmount = currentAmount - discount3Amount;
  
  // 5. Ara toplam (negatif olamaz)
  const subtotal = Math.max(0, currentAmount);
  
  // 6. KDV hesaplanır
  const vatAmount = subtotal * (line.vatRate / 100);
  
  // 7. Genel toplam
  const grandTotal = subtotal + vatAmount;
  
  return {
    ...line,
    discountAmount1: Math.max(0, discount1Amount),
    discountAmount2: Math.max(0, discount2Amount),
    discountAmount3: Math.max(0, discount3Amount),
    lineTotal: subtotal,
    vatAmount: Math.max(0, vatAmount),
    lineGrandTotal: Math.max(0, grandTotal),
  };
}
```

**Önemli Notlar:**
- İndirimler sırayla uygulanır (1 → 2 → 3)
- Her indirim, önceki indirim sonrası tutar üzerinden hesaplanır
- Negatif değerler `Math.max(0, ...)` ile engellenir

### Toplam Hesaplamaları (calculateTotals):

```typescript
function calculateTotals(lines: QuotationLineFormState[]): CalculationTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const totalVat = lines.reduce((sum, line) => sum + line.vatAmount, 0);
  const grandTotal = lines.reduce((sum, line) => sum + line.lineGrandTotal, 0);
  
  return { subtotal, totalVat, grandTotal };
}
```

---

## 🎯 Validasyonlar ve Kontroller

### 1. Form Validasyonu (Zod Schema):

```typescript
const createQuotationSchema = z.object({
  quotation: z.object({
    potentialCustomerId: z.number().nullable().optional(),
    erpCustomerCode: z.string().max(50).nullable().optional(),
    deliveryDate: z.string().nullable().optional(),
    shippingAddressId: z.number().nullable().optional(),
    representativeId: z.number().nullable().optional(),
    status: z.number().nullable().optional(),
    description: z.string().max(500).nullable().optional(),
    paymentTypeId: z.number().nullable().optional(),
    documentSerialTypeId: z.number().nullable().optional(),
    offerType: z.string({ message: 'Teklif tipi seçilmelidir' }),
    offerDate: z.string().nullable().optional(),
    offerNo: z.string().max(50).nullable().optional(),
    revisionNo: z.string().max(50).nullable().optional(),
    revisionId: z.number().nullable().optional(),
    currency: z.string().min(1, 'Para birimi seçilmelidir'),
  }),
});
```

### 2. Submit Öncesi Kontroller:

**handleFormSubmit içinde:**
1. **Ödeme Tipi Kontrolü:**
   ```typescript
   if (!formData.quotation.paymentTypeId) {
     toast.error('Ödeme tipi seçilmelidir');
     return;
   }
   ```

2. **Teslimat Tarihi Kontrolü:**
   ```typescript
   if (!formData.quotation.deliveryDate) {
     toast.error('Teslimat tarihi girilmelidir');
     return;
   }
   ```

3. **Zod Schema Validasyonu:**
   ```typescript
   const isValid = await form.trigger();
   if (!isValid) {
     toast.error('Lütfen form alanlarını kontrol ediniz.');
     return;
   }
   ```

4. **Satır Kontrolü (onSubmit içinde):**
   ```typescript
   if (lines.length === 0) {
     toast.error('En az 1 satır eklenmelidir');
     return;
   }
   ```

5. **Para Birimi Kontrolü:**
   ```typescript
   if (!currencyValue || currencyValue === '0') {
     throw new Error('Geçerli bir para birimi seçilmelidir');
   }
   ```

### 3. Satır Ekleme Kontrolleri:

**handleAddLine içinde:**
```typescript
if ((!customerId && !erpCustomerCode) || !representativeId || !currency) {
  toast.error('Lütfen müşteri, temsilci ve para birimi seçimlerini yapınız.');
  return;
}
```

### 4. İndirim Limit Kontrolleri:

**useDiscountLimitValidation hook'u:**
```typescript
// Ürün grup koduna göre limit bulunur
const matchingLimit = userDiscountLimits.find(
  (limit) => limit.erpProductGroupCode === groupCode
);

if (matchingLimit) {
  const exceedsLimit1 = discountRate1 > matchingLimit.maxDiscount1;
  const exceedsLimit2 = discountRate2 > (matchingLimit.maxDiscount2 ?? Infinity);
  const exceedsLimit3 = discountRate3 > (matchingLimit.maxDiscount3 ?? Infinity);
  
  const exceedsLimit = exceedsLimit1 || exceedsLimit2 || exceedsLimit3;
  
  // Limit aşılırsa onay gerekir
  approvalStatus = exceedsLimit ? 1 : 0;
}
```

**Kontrol Noktaları:**
- `discountRate1 > maxDiscount1` → Onay gerekir
- `discountRate2 > maxDiscount2` → Onay gerekir (null ise kontrol edilmez)
- `discountRate3 > maxDiscount3` → Onay gerekir (null ise kontrol edilmez)
- Herhangi biri aşılırsa → `approvalStatus = 1`

### 5. Fiyat Kuralı Kontrolleri:

**Ürün seçildiğinde:**
1. Ürün kodu (`stokCode`) eşleşmeli
2. Miktar `minQuantity` ve `maxQuantity` arasında olmalı
3. Eşleşen kural varsa:
   - `fixedUnitPrice` varsa → Birim fiyat olarak kullanılır
   - İndirim oranları uygulanır
   - `pricingRuleHeaderId` kaydedilir

### 6. Para Birimi Değişim Kontrolleri:

**handleCurrencyChange içinde:**
```typescript
// Eğer satırlar varsa, para birimi değişimi onaylanmalı
if (lines && lines.length > 0 && onLinesChange) {
  setPendingCurrency(newCurrency);
  setCurrencyChangeDialogOpen(true);
} else {
  form.setValue('quotation.currency', newCurrency);
}
```

**Para Birimi Değişiminde Fiyat Dönüşümü:**
```typescript
const oldRate = findExchangeRateByDovizTipi(oldCurrency, exchangeRates, erpRates);
const newRate = findExchangeRateByDovizTipi(newCurrencyNum, exchangeRates, erpRates);

if (oldRate && oldRate > 0 && newRate && newRate > 0) {
  const conversionRatio = oldRate / newRate;
  const newUnitPrice = line.unitPrice * conversionRatio;
  // Yeni fiyat ile hesaplamalar güncellenir
}
```

---

## 🔄 Kullanıcı Etkileşimleri ve Akışlar

### Senaryo 1: Sayfa Yüklendiğinde

1. Component mount olur
2. Default değerler ayarlanır:
   - `offerType = 'Domestic'`
   - `offerDate = bugünün tarihi`
   - `representativeId = user.id` (giriş yapan kullanıcı)
3. İlk veriler yüklenir:
   - `useCustomerOptions()` → Müşteri listesi
   - `useUsers()` → Temsilci listesi
   - `usePaymentTypes()` → Ödeme tipleri
   - `useExchangeRate()` → Döviz kurları
   - `useCurrencyOptions()` → Para birimi seçenekleri
   - `useErpCustomers()` → ERP müşterileri
4. Sayfa başlığı ayarlanır: "Yeni Teklif Oluştur"

---

### Senaryo 2: Müşteri Seçimi

1. Kullanıcı müşteri seçer (CRM veya ERP)
2. **CRM Müşteri:**
   - `potentialCustomerId` set edilir
   - `useShippingAddresses(customerId)` → Teslimat adresleri yüklenir
   - `useCustomer(customerId)` → Müşteri detayları yüklenir
   - `customerCode` alınır (fiyat kuralları için)

3. **ERP Müşteri:**
   - `erpCustomerCode` set edilir
   - `customerCode = erpCustomerCode` (fiyat kuralları için)

4. **Fiyat Kuralları Yükleme:**
   - `customerCode`, `representativeId`, `offerDate` varsa
   - `usePriceRuleOfQuotation()` otomatik çalışır
   - Fiyat kuralları `pricingRules` state'ine kaydedilir

---

### Senaryo 3: Temsilci Seçimi

1. Kullanıcı temsilci seçer
2. `representativeId` set edilir
3. **İndirim Limitleri Yükleme:**
   - `useUserDiscountLimitsBySalesperson(representativeId)` çalışır
   - İndirim limitleri `temporarySallerData` state'ine kaydedilir

4. **Fiyat Kuralları Yeniden Yükleme:**
   - `representativeId` değiştiği için fiyat kuralları yeniden yüklenir

---

### Senaryo 4: Para Birimi Seçimi

1. Kullanıcı para birimi seçer
2. `currency` set edilir
3. **Satırlar Varsa:**
   - Para birimi değişim onay dialog'u açılır
   - Onaylanırsa: Tüm satırların fiyatları dönüştürülür
   - İptal edilirse: Para birimi değişmez

4. **Satırlar Yoksa:**
   - Para birimi direkt değişir

---

### Senaryo 5: Satır Ekleme

1. Kullanıcı "Satır Ekle" butonuna tıklar
2. **Kontrol:**
   - Müşteri seçili mi? (`customerId` veya `erpCustomerCode`)
   - Temsilci seçili mi? (`representativeId`)
   - Para birimi seçili mi? (`currency`)
   - Değilse → Hata toast'u gösterilir

3. Boş satır oluşturulur:
   ```typescript
   {
     id: `temp-${Date.now()}`,
     productCode: '',
     productName: '',
     quantity: 1,
     unitPrice: 0,
     discountRate1: 0,
     discountRate2: 0,
     discountRate3: 0,
     vatRate: 18,
     isEditing: true,
   }
   ```

4. Satır form dialog'u açılır

---

### Senaryo 6: Ürün Seçimi

1. Kullanıcı ürün seçer (ProductSelectDialog)
2. **Ürün Seçildiğinde:**
   - `handleProductSelect(product)` çağrılır
   - **İlgili Stoklar Varsa:**
     - `handleProductSelectWithRelatedStocks()` çağrılır
     - Birden fazla satır oluşturulur (ana + ilgili stoklar)
   - **İlgili Stoklar Yoksa:**
     - `quotationApi.getPriceOfProduct()` çağrılır
     - Ürün fiyatı alınır

3. **Fiyat ve İndirim Uygulama:**
   - API'den gelen fiyat kullanılır
   - Para birimi farklıysa dönüşüm yapılır
   - Fiyat kuralları kontrol edilir:
     - Ürün kodu eşleşiyor mu?
     - Miktar aralığında mı?
     - Eşleşen kural varsa → Fiyat ve indirimler uygulanır
   - İndirim limitleri kontrol edilir
   - Hesaplamalar yapılır (`calculateLineTotals`)

4. Satır form'a doldurulur

---

### Senaryo 7: Satır Düzenleme

1. Kullanıcı satırda "Düzenle" butonuna tıklar
2. Satır `isEditing: true` yapılır
3. Satır form dialog'u açılır (mevcut değerlerle)
4. Kullanıcı değişiklik yapar
5. **Alan Değişimlerinde:**
   - `handleFieldChange()` çağrılır
   - Hesaplamalar otomatik güncellenir
   - İndirim limitleri kontrol edilir
   - Fiyat kuralları kontrol edilir

6. "Kaydet" butonuna tıklanır
7. Satır güncellenir, `isEditing: false` yapılır

---

### Senaryo 8: Satır Silme

1. Kullanıcı satırda "Sil" butonuna tıklar
2. Silme onay dialog'u açılır
3. Onaylanırsa:
   - Satır `lines` array'inden çıkarılır
   - İlgili satırlar da silinir (varsa)

---

### Senaryo 9: İndirim Oranı Değişimi

1. Kullanıcı indirim oranını değiştirir (1, 2 veya 3)
2. **Hesaplama:**
   - Yeni indirim tutarı hesaplanır
   - Ara toplam güncellenir
   - KDV yeniden hesaplanır
   - Genel toplam güncellenir

3. **İndirim Limit Kontrolü:**
   - Ürün grup kodu ile eşleşen limit bulunur
   - `discountRate1 > maxDiscount1` → Onay gerekir
   - `discountRate2 > maxDiscount2` → Onay gerekir
   - `discountRate3 > maxDiscount3` → Onay gerekir
   - Limit aşılırsa → `approvalStatus = 1`

4. Satır otomatik güncellenir

---

### Senaryo 10: Teklif Kaydetme

1. Kullanıcı "Teklifi Kaydet" butonuna tıklar
2. **handleFormSubmit çağrılır:**
   - Form submit event prevent edilir
   - Form değerleri alınır

3. **Kontroller:**
   - Ödeme tipi var mı? → Yoksa hata
   - Teslimat tarihi var mı? → Yoksa hata
   - Zod schema validasyonu → Geçersizse hata
   - Satır sayısı > 0 mı? → Değilse hata
   - Para birimi geçerli mi? → Değilse hata

4. **Veri Hazırlama:**
   - Satırlar temizlenir (`id`, `isEditing`, `relatedLines` çıkarılır)
   - Döviz kurları temizlenir (`id`, `dovizTipi` çıkarılır)
   - Null/0 değerler temizlenir
   - `quotationId: 0` set edilir (yeni oluşturuluyor)

5. **API İsteği:**
   - `POST /api/quotation/bulk-quotation`
   - Payload gönderilir

6. **Başarılı Olursa:**
   - Toast: "Teklif Başarıyla Oluşturuldu"
   - `quotations` query invalidate edilir
   - `/quotations/{quotationId}` sayfasına yönlendirilir

7. **Hata Olursa:**
   - Toast: Hata mesajı (10 saniye)
   - Form açık kalır

---

## 📱 React Native Expo İçin Özel Notlar

### 1. Navigation:
- React Router yerine: `@react-navigation/native`
- `useNavigate()` yerine: `navigation.navigate()`
- Route: `/quotations/create` → Screen: `QuotationsCreate`

### 2. Form Management:
- React Hook Form: Aynı kullanılabilir
- Zod: Aynı kullanılabilir
- FormProvider: Aynı kullanılabilir

### 3. Dialog/Modal:
- Shadcn Dialog yerine: React Native `Modal`
- Multiple dialog'lar için state management gerekir

### 4. Table/List:
- Table yerine: `FlatList` veya `SectionList`
- Satırlar list olarak gösterilir
- Her satır bir Card/View component'i

### 5. Input Components:
- Shadcn Input → React Native `TextInput`
- Shadcn Select → Custom picker veya `@react-native-picker/picker`
- Shadcn Textarea → React Native `TextInput` (multiline)

### 6. Date Picker:
- `react-native-date-picker` veya `@react-native-community/datetimepicker`

### 7. Currency Formatting:
- `Intl.NumberFormat` çalışır ama test et
- Alternatif: `react-native-currency-input`

### 8. Calculations:
- Aynı mantık kullanılabilir
- JavaScript Math fonksiyonları aynı çalışır

### 9. State Management:
- TanStack Query: Aynı
- Zustand: Aynı
- React Hook Form: Aynı

### 10. Performance:
- `FlatList` kullan (virtualization)
- Memoization: `React.memo`, `useMemo`, `useCallback`
- Debounce: Input değişimlerinde (özellikle arama)

### 11. Keyboard Handling:
- `KeyboardAvoidingView` kullan
- `ScrollView` içinde form
- Input focus yönetimi

### 12. Validation Display:
- Form hataları input altında gösterilir
- Toast yerine: `react-native-toast-message`

---

## 🎯 Önemli Kontrol Noktaları

### 1. Müşteri Seçimi:
- ✅ CRM müşteri veya ERP müşteri kodu seçilmeli
- ✅ Müşteri seçilmeden satır eklenemez
- ✅ Müşteri seçildiğinde teslimat adresleri yüklenir

### 2. Temsilci Seçimi:
- ✅ Temsilci seçilmeden satır eklenemez
- ✅ Temsilci seçildiğinde indirim limitleri yüklenir
- ✅ Default: Giriş yapan kullanıcı

### 3. Para Birimi:
- ✅ Para birimi seçilmeden satır eklenemez
- ✅ Para birimi değişiminde fiyatlar dönüştürülür
- ✅ Döviz kurları yüklenir

### 4. Satırlar:
- ✅ En az 1 satır olmalı
- ✅ Ürün kodu zorunlu
- ✅ Miktar > 0
- ✅ Birim fiyat >= 0

### 5. İndirimler:
- ✅ İndirim oranları 0-100 arası
- ✅ İndirim limitleri kontrol edilir
- ✅ Limit aşılırsa onay gerekir

### 6. Hesaplamalar:
- ✅ İndirimler sırayla uygulanır
- ✅ KDV doğru hesaplanır
- ✅ Toplamlar doğru hesaplanır

### 7. Form Submit:
- ✅ Ödeme tipi zorunlu
- ✅ Teslimat tarihi zorunlu
- ✅ Para birimi zorunlu
- ✅ Zod schema validasyonu
- ✅ Satır sayısı kontrolü

---

## 📝 TypeScript Tipleri

```typescript
// Form Schema
interface CreateQuotationSchema {
  quotation: {
    potentialCustomerId?: number | null;
    erpCustomerCode?: string | null;
    deliveryDate?: string | null;
    shippingAddressId?: number | null;
    representativeId?: number | null;
    status?: number | null;
    description?: string | null;
    paymentTypeId?: number | null;
    documentSerialTypeId?: number | null;
    offerType: string;
    offerDate?: string | null;
    offerNo?: string | null;
    revisionNo?: string | null;
    revisionId?: number | null;
    currency: string;
  };
}

// Line Form State
interface QuotationLineFormState {
  id: string;
  productId?: number | null;
  productCode: string;
  productName: string;
  groupCode?: string | null;
  quantity: number;
  unitPrice: number;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineGrandTotal: number;
  description?: string | null;
  pricingRuleHeaderId?: number | null;
  relatedStockId?: number | null;
  relatedProductKey?: string | null;
  isMainRelatedProduct?: boolean;
  approvalStatus?: ApprovalStatus;
  isEditing: boolean;
  relatedLines?: QuotationLineFormState[];
}

// Exchange Rate Form State
interface QuotationExchangeRateFormState {
  id: string;
  currency: string;
  exchangeRate: number;
  exchangeRateDate: string;
  isOfficial?: boolean;
  dovizTipi?: number;
}

// Bulk Create DTO
interface QuotationBulkCreateDto {
  quotation: CreateQuotationDto;
  lines: CreateQuotationLineDto[];
  exchangeRates?: QuotationExchangeRateCreateDto[];
}
```

---

## 🚀 Geliştirme Checklist

- [ ] Form component'i oluşturuldu (React Hook Form + Zod)
- [ ] Başlık form component'i oluşturuldu
- [ ] Satır tablosu component'i oluşturuldu
- [ ] Satır form component'i oluşturuldu
- [ ] Özet kartı component'i oluşturuldu
- [ ] Tüm API hook'ları oluşturuldu
- [ ] Müşteri seçimi (CRM/ERP) eklendi
- [ ] Temsilci seçimi eklendi
- [ ] Para birimi seçimi eklendi
- [ ] Döviz kuru yönetimi eklendi
- [ ] Satır ekleme/düzenleme/silme eklendi
- [ ] Ürün seçimi eklendi
- [ ] Fiyat kuralları entegrasyonu yapıldı
- [ ] İndirim limit kontrolleri eklendi
- [ ] Hesaplama fonksiyonları eklendi
- [ ] Para birimi değişim mantığı eklendi
- [ ] Tüm validasyonlar eklendi
- [ ] Form submit işlemi eklendi
- [ ] Error handling eklendi
- [ ] Loading state'leri eklendi
- [ ] Toast/notification sistemi eklendi
- [ ] Navigation entegrasyonu yapıldı
- [ ] i18n entegrasyonu yapıldı
- [ ] Test edildi

---

## 📚 Referans Dosyalar

- **Ana Component:** `src/features/quotation/components/QuotationCreateForm.tsx`
- **Başlık Formu:** `src/features/quotation/components/QuotationHeaderForm.tsx`
- **Satır Tablosu:** `src/features/quotation/components/QuotationLineTable.tsx`
- **Satır Formu:** `src/features/quotation/components/QuotationLineForm.tsx`
- **Özet Kartı:** `src/features/quotation/components/QuotationSummaryCard.tsx`
- **Schema:** `src/features/quotation/schemas/quotation-schema.ts`
- **API:** `src/features/quotation/api/quotation-api.ts`
- **Hooks:**
  - `src/features/quotation/hooks/useCreateQuotationBulk.ts`
  - `src/features/quotation/hooks/usePriceRuleOfQuotation.ts`
  - `src/features/quotation/hooks/useUserDiscountLimitsBySalesperson.ts`
  - `src/features/quotation/hooks/useQuotationCalculations.ts`
  - `src/features/quotation/hooks/useProductSelection.ts`
  - `src/features/quotation/hooks/useDiscountLimitValidation.ts`
- **Types:** `src/features/quotation/types/quotation-types.ts`
- **Utils:**
  - `src/features/quotation/utils/format-currency.ts`
  - `src/features/quotation/utils/price-conversion.ts`

---

**Son Güncelleme:** 26 Ocak 2026
