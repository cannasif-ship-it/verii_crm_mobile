# Sidebar – Aktivite Alanları: Çalışma Mantığı, API, DTO ve URL Dokümantasyonu

Bu belge, React Native (Expo) CRM uygulamasında **Sidebar > Aktivite** altındaki ekranların çalışma mantığını, hangi DTO ile nereye istek atıldığını, response yapısını, URL ve query parametrelerini tanımlar.

---

## 1. Genel Yapı

- **Base URL:** `config.json` içindeki `apiUrl` → `src/constants/config.ts` → `src/lib/axios.ts` (`apiClient`). Tüm API istekleri `apiClient` instance ile atılır (interceptor ile token eklenir).
- **Tüm API response'ları** şu wrapper ile gelir:

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  exceptionMessage: string;
  data: T;
  errors: string[];
  timestamp: string;
  statusCode: number;
  className: string;
}
```

- Sayfa listeleri **sayfalı (paged)** endpoint'ler kullanır; backend bazen `data` bazen `items` ile dizi döner. Frontend `normalizePagedResponse` ile `PagedResponse<T>` olarak normalize eder.

---

## 2. Sidebar Menü ve Rotalar

| Menü metni (sidebar)   | Route path                 | Sayfa / feature                    |
|------------------------|----------------------------|------------------------------------|
| Günlük İşler          | `/(tabs)/activities/daily-tasks` | `DailyTasksScreen` (`features/daily-tasks`) |
| Aktivite Yönetimi     | `/(tabs)/activities/list`  | `ActivityListScreen` (`features/activity`)  |
| Aktivite Tipleri      | `/(tabs)/activities/activity-type-management` | `features/activity-type` (hooks + types)    |

---

## 3. Aktivite Yönetimi (`/activity-management` → `activities/list`)

### 3.1. Amaç ve akış

- Tüm aktiviteleri sayfalı liste halinde gösterir; arama, basit filtre (Tümü / Aktif / Tamamlanan), gelişmiş filtre (kolon + operatör + değer) ve sıralama destekler.
- Yeni aktivite ekleme ve mevcut aktivite düzenleme/silme yapılır.
- Liste **Activity** API'den çekilir; oluşturma/güncelleme/silme aynı API'ye gider.

### 3.2. Liste isteği (GET)

- **URL:** `GET /api/Activity`
- **Query parametreleri:** `pageNumber`, `pageSize`, `sortBy`, `sortDirection`, `filters` (JSON string).
- **filters formatı:** `PagedFilter[]` → `JSON.stringify` ile query'e eklenir.

```ts
interface PagedFilter {
  column: string;   // örn: 'Subject', 'Status', 'StartDateTime'
  operator: string; // örn: 'Contains', 'Equals', 'gte', 'lte'
  value: string;
}
```

- **Kullanılan hook:** `useActivities({ pageNumber, pageSize, sortBy, sortDirection, filters })` → `activityApi.getList(params)`.
- **Response:** `ApiResponse<PagedResponse<ActivityDto>>`. `PagedResponse` içinde `data` veya `items` gelir; frontend `normalizePagedResponse` ile `items` kullanır.

### 3.3. Basit filtreler

- **Arama (searchTerm):** `Subject` üzerinde `Contains` → `{ column: 'Subject', operator: 'Contains', value: trimmed }`.
- **Aktif/Tamamlanan:** Aktif: `Status` `Equals` `0` (Scheduled). Tamamlanan: `Status` `Equals` `1` (Completed).
- Helper: `buildSimpleFilters(searchTerm, activeFilter)` (`features/activity/utils/buildSimpleFilters.ts`).

### 3.4. Detay – GET

- **URL:** `GET /api/Activity/{id}`
- **Response:** `ApiResponse<ActivityDto>`
- **Hook:** `useActivity(id)` veya `activityApi.getById(id)`.

### 3.5. Oluşturma – POST

- **URL:** `POST /api/Activity`
- **Body:** `CreateActivityDto` (activityTypeId, startDateTime, endDateTime, isAllDay, status, priority, assignedUserId, contactId, potentialCustomerId, erpCustomerCode, reminders).
- **Helper:** `buildCreateActivityPayload(data, { activityTypes, assignedUserIdFallback })` (`features/activity/utils/buildCreateActivityPayload.ts`).
- **Hook:** `useCreateActivity()`.

### 3.6. Güncelleme – PUT

- **URL:** `PUT /api/Activity/{id}`
- **Body:** `UpdateActivityDto` (CreateActivityDto ile aynı alanlar).
- **Hook:** `useUpdateActivity()`.

### 3.7. Silme – DELETE

- **URL:** `DELETE /api/Activity/{id}`
- **Hook:** `useDeleteActivity()`.

---

## 4. Aktivite Tipleri (`/activity-type-management`)

### 4.1. Amaç ve akış

- Aktivite tiplerini listeler; client-side arama (isim, açıklama) yapılabilir.
- Yeni tip ekleme, düzenleme ve silme vardır.
- Tüm veri **ActivityType** API'den gelir; istatistik (stats) aynı list endpoint'i ile client'ta hesaplanır.

### 4.2. Liste – GET

- **URL:** `GET /api/ActivityType`
- **Query:** `pageNumber`, `pageSize`, `sortBy`, `sortDirection`, istenirse `filters` (JSON string).
- **Hook:** `useActivityTypeList(params)` → `activityTypeApi.getList(params)`.
- **Response:** `ApiResponse<PagedResponse<ActivityTypeDto>>`; frontend normalize eder.

### 4.3. Detay – GET

- **URL:** `GET /api/ActivityType/{id}`
- **Hook:** `useActivityType(id)`.

### 4.4. Oluşturma – POST

- **URL:** `POST /api/ActivityType`
- **Body:** `CreateActivityTypeDto` { name, description? }.
- **Hook:** `useCreateActivityType()`.

### 4.5. Güncelleme – PUT

- **URL:** `PUT /api/ActivityType/{id}`
- **Body:** `UpdateActivityTypeDto` { name, description? }.
- **Hook:** `useUpdateActivityType()`.

### 4.6. Silme – DELETE

- **URL:** `DELETE /api/ActivityType/{id}`
- **Hook:** `useDeleteActivityType()`.

### 4.7. İstatistik (stats)

- Ayrı backend endpoint yok. `useActivityTypeStats()` içinde `activityTypeApi.getList({ pageNumber: 1, pageSize: 1000 })` çağrılır; client'ta `totalActivityTypes`, `activeActivityTypes`, `newThisMonth` hesaplanır.

---

## 5. Günlük İşler (`/daily-tasks`)

### 5.1. Amaç ve akış

- Kullanıcının günlük/haftalık/takvim görünümünde kendi (veya seçilen kullanıcının) aktivitelerini görmesi, yeni aktivite eklemesi, durum güncellemesi ve silmesi.
- Veri kaynağı **Activity** API; filtreler ve görünüm (Kartlar / Liste / Takvim) farklıdır.

### 5.2. Liste – GET

- **URL:** `GET /api/Activity`
- **Sabit parametreler:** `pageNumber: 1`, `pageSize: 1000`, `sortBy: 'StartDateTime'`, `sortDirection: 'asc'`.
- **Filtreler:** `StartDateTime` gte/lte (YYYY-MM-DD), `AssignedUserId` eq, `Status` eq.
- **Hook:** `useDailyTasks(filter)` → `dailyTasksApi.getList(filter)`.

### 5.3. Oluşturma / Güncelleme / Silme

- Activity API ile aynı: `POST /api/Activity`, `PUT /api/Activity/{id}`, `DELETE /api/Activity/{id}`.
- Hooks: `useCreateActivity()`, `useUpdateActivity()`, `useDeleteActivity()` (activity feature).

---

## 6. Özet Tablo: İstekler ve DTO'lar

| Ekran             | İşlem   | Method | URL                    | Request body / query | Response |
|-------------------|--------|--------|------------------------|----------------------|----------|
| Aktivite Yönetimi | Liste  | GET    | `/api/Activity?…`      | filters: PagedFilter[] (JSON) | ApiResponse<PagedResponse<ActivityDto>> |
| Aktivite Yönetimi | Detay  | GET    | `/api/Activity/{id}`   | -                   | ApiResponse<ActivityDto> |
| Aktivite Yönetimi | Oluştur| POST   | `/api/Activity`        | CreateActivityDto    | ApiResponse<ActivityDto> |
| Aktivite Yönetimi | Güncelle | PUT  | `/api/Activity/{id}`   | UpdateActivityDto    | ApiResponse<ActivityDto> |
| Aktivite Yönetimi | Sil    | DELETE | `/api/Activity/{id}`   | -                   | ApiResponse<object> |
| Aktivite Tipleri  | Liste  | GET    | `/api/ActivityType?…`  | pageNumber, pageSize, sortBy, sortDirection | ApiResponse<PagedResponse<ActivityTypeDto>> |
| Aktivite Tipleri  | Detay  | GET    | `/api/ActivityType/{id}` | -                 | ApiResponse<ActivityTypeDto> |
| Aktivite Tipleri  | Oluştur| POST   | `/api/ActivityType`    | CreateActivityTypeDto | ApiResponse<ActivityTypeDto> |
| Aktivite Tipleri  | Güncelle | PUT  | `/api/ActivityType/{id}` | UpdateActivityTypeDto | ApiResponse<ActivityTypeDto> |
| Aktivite Tipleri  | Sil    | DELETE | `/api/ActivityType/{id}` | -                 | ApiResponse<object> |
| Günlük İşler      | Liste  | GET    | `/api/Activity?…`      | filters: StartDateTime, AssignedUserId, Status | ApiResponse (normalize → items) |
| Günlük İşler      | Oluştur/Güncelle/Sil | POST/PUT/DELETE | `/api/Activity` / `/{id}` | CreateActivityDto / UpdateActivityDto | ApiResponse<ActivityDto> |

---

## 7. Ortak tipler

```ts
interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
```

Backend bazen `items` bazen `data` döndüğünde frontend `normalizePagedResponse` ile tek forma getirir; tüm sayfalarda sonuç `PagedResponse<T>.items` üzerinden kullanılır.
