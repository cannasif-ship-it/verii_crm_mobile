# Rota – Yakındaki Müşteriler API Spesifikasyonu (Aşama 2)

Bu belge, **Rota** haritasında "potansiyel müşteriler" (sisteme kayıtlı müşteri adresleri) katmanını göstermek için backend API sözleşmesini tanımlar.

---

## 1. Amaç

- Mobil uygulama, kullanıcının bulunduğu konumu merkez alıp haritada hem OSM yerlerini (Aşama 1) hem de **CRM’deki müşteri adreslerini** gösterecek.
- Müşteri adresleri için **enlem/boylam (latitude, longitude)** gerekiyor; haritada pin ile gösterim için zorunlu.

---

## 2. Request (Client → Backend)

**Method:** `GET`

**URL:**  
`/api/Customer/nearby`  
veya  
`/api/Rota/customers`  
(Backend’in tercih ettiği route adı kullanılabilir.)

**Query parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `latitude` | number | Evet | Harita merkezi enlem (WGS84). Örn: 41.0082 |
| `longitude` | number | Evet | Harita merkezi boylam (WGS84). Örn: 28.9784 |
| `radiusKm` | number | Hayır | Aramada kullanılacak yarıçap (km). Varsayılan: 10. Önerilen max: 50 |
| `includeShippingAddresses` | boolean | Hayır | `true` ise müşteri ana adresi + teslimat adresleri; `false` ise sadece ana adres. Varsayılan: true |
| `filters` | string (JSON) | Hayır | Mevcut CRM filtre yapısı (PagedFilter[]). Örn: müşteri tipi, şube kodu vb. |

**Örnek istek:**

```
GET /api/Customer/nearby?latitude=41.0082&longitude=28.9784&radiusKm=15&includeShippingAddresses=true
```

Header’lar mevcut CRM API ile aynı (Authorization, X-Language, X-Branch-Code vb.).

---

## 3. Response (Backend → Client)

**Standart API sarmalayıcı:** Mevcut `ApiResponse<T>` yapısı kullanılmalı.

```json
{
  "success": true,
  "message": null,
  "exceptionMessage": null,
  "data": [
    {
      "id": 1,
      "customerId": 1,
      "customerCode": "MUS-001",
      "name": "Örnek Sanayi A.Ş.",
      "addressDisplay": "Organize Sanayi Bölgesi 5. Cadde No:12, Nilüfer, Bursa",
      "latitude": 40.2127,
      "longitude": 29.0312,
      "source": "main",
      "shippingAddressId": null,
      "customerTypeName": "Potansiyel",
      "phone": "+90 212 555 00 00"
    },
    {
      "id": 2,
      "customerId": 1,
      "customerCode": "MUS-001",
      "name": "Örnek Sanayi A.Ş.",
      "addressDisplay": "2. Teslimat Adresi, İstanbul",
      "latitude": 41.0152,
      "longitude": 28.9793,
      "source": "shipping",
      "shippingAddressId": 42,
      "customerTypeName": "Potansiyel",
      "phone": "+90 212 555 00 00"
    }
  ],
  "errors": [],
  "timestamp": "2025-02-20T12:00:00",
  "statusCode": 200,
  "className": null
}
```

**`data`** bir **dizi** olmalı; sayfalama yok. Makul üst sınır (örn. 200–500 kayıt) backend’de konulabilir.

---

## 4. Response DTO – Alan Açıklamaları

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `id` | number | Evet | Benzersiz satır kimliği (haritada key için). Ana adres için customerId ile aynı veya unique id; teslimat için shippingAddressId veya unique id |
| `customerId` | number | Evet | Müşteri ID (Customer.Id) |
| `customerCode` | string | Hayır | Müşteri kodu |
| `name` | string | Evet | Müşteri / firma adı |
| `addressDisplay` | string | Evet | Pin tooltip ve detayda gösterilecek tam adres metni (sokak + ilçe + il vb. birleştirilmiş) |
| `latitude` | number | Evet | WGS84 enlem. Haritada pin için zorunlu |
| `longitude` | number | Evet | WGS84 boylam. Haritada pin için zorunlu |
| `source` | string | Evet | `"main"` = müşteri ana adresi (Customer), `"shipping"` = teslimat adresi (ShippingAddress) |
| `shippingAddressId` | number? | Hayır | source = "shipping" ise ilgili ShippingAddress.Id; değilse null |
| `customerTypeName` | string | Hayır | Müşteri tipi adı (ör. Potansiyel, Aktif) |
| `phone` | string | Hayır | Gösterim için tek telefon |

---

## 5. Backend’in Yapması Gerekenler

1. **Koordinat kaynağı**  
   Haritada pin gösterebilmek için her adresin **latitude** ve **longitude** değeri olmalı. İki yaklaşım:
   - **Tercih:** DB’de koordinat saklamak: `Customer` ve/veya `ShippingAddress` tablolarına `Latitude`, `Longitude` (nullable) eklenir; adres kaydedilirken veya periyodik job ile bir geocoding servisi (Google, Nominatim, vb.) ile doldurulur.
   - **Alternatif:** İstek anında geocoding: Backend her adresi geocode edip koordinata çevirir (rate limit ve gecikme dikkate alınmalı).

2. **Filtreleme**  
   Sadece `latitude`, `longitude` ve `radiusKm` ile merkeze yakın kayıtları döndürmek. DB’de koordinat varsa:
   - Ya bounding box (min/max lat/lng) ile SQL filtre,
   - Ya da coğrafi mesafe hesabı (ör. Haversine veya DB’nin spatial fonksiyonları) kullanılabilir.

3. **Veri kaynağı**  
   - `source: "main"`: Müşteri ana adresi (Customer.Address + City/District/Country).
   - `source: "shipping"`: Teslimat adresleri (ShippingAddress), `includeShippingAddresses=true` ise dahil edilir. Aynı müşteri birden fazla teslimat adresiyle birden fazla pin ile gösterilebilir.

4. **Branch / yetki**  
   Mevcut CRM kurallarına uygun: istek header’daki `X-Branch-Code` ve kullanıcı yetkilerine göre sadece ilgili müşteriler dönülmeli.

---

## 6. Client (Mobil) Tarafında Kullanım

- Aynı Rota ekranında:
  - **Katman 1 (mevcut):** OSM’den çekilen çevredeki yerler (kategori filtreli).
  - **Katman 2 (Aşama 2):** Bu endpoint’ten dönen `data` listesi; her öğe için haritada ayrı bir pin (farklı ikon/renk ile, örn. “müşteri” pin’i).
- Pin’e tıklanınca: `name`, `addressDisplay`, `customerTypeName`, `phone` gösterilebilir; `customerId` ile müşteri detay sayfasına gidilebilir.
- İstek parametreleri: Ekrandaki harita merkezi (`currentRegion.latitude`, `currentRegion.longitude`) ve kullanıcı tercihine göre `radiusKm`, `includeShippingAddresses`; isteğe bağlı `filters`.

Bu spesifikasyona göre backend implementasyonu tamamlandığında, mobil tarafta sadece bu endpoint’i çağıran servis + haritada müşteri pin’lerini gösterecek UI eklenmesi yeterli olacaktır.
