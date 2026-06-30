<div align="center">

**Language:** [English](README.md) · **Русский**

# Faber Companii — Web

**Фронтенд мультитенантной B2B/B2C платформы для сервисных компаний**

React 19 · Vite 7 · TanStack Query · Zustand · Tailwind CSS 4

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Быстрый старт](#-быстрый-старт) · [Архитектура](#-архитектура) · [Маршруты](#-маршрутизация) · [Роли](#-роли-и-пользовательские-сценарии) · [API](#-взаимодействие-с-api)

</div>

---

## Что это за проект?

**companii-web** — клиентская часть платформы **Faber Companii**: публичный маркетинговый сайт, каталог компаний, три изолированных кабинета и единая система авторизации.

| Зона приложения | URL | Кто использует |
|-----------------|-----|----------------|
| **Публичный сайт** | `/{locale}/...` | Все посетители |
| **Кабинет компании** | `/company/*` | `COMPANY_STAFF` |
| **Клиентский портал** | `/portal/*` | `END_CLIENT` |
| **Админка платформы** | `/admin/*` | `PLATFORM_ADMIN` |

Backend: **[companii-api](../companii-api)** — NestJS + PostgreSQL RLS.

---

## Общая схема системы

```mermaid
flowchart TB
    subgraph Browser["Браузер пользователя"]
        subgraph WEB["companii-web"]
            PUB["Публичные страницы<br/>ro / ru"]
            CAB["Кабинеты<br/>company · portal · admin"]
            STATE["Zustand + TanStack Query"]
        end
    end

    subgraph Proxy["Dev: Vite Proxy · Prod: nginx"]
        PX["/api → :4100<br/>/uploads → :4100"]
    end

    subgraph API["companii-api"]
        REST["REST /api/v1"]
        SSE["SSE notifications/stream"]
    end

    PUB --> STATE
    CAB --> STATE
    STATE -->|"apiFetch<br/>Bearer + x-company-id"| PX
  PX --> REST
    STATE -->|"EventSource"| SSE
```

---

## Архитектура

Проект следует принципам **Feature-Sliced Design (FSD)** — код разделён по слоям ответственности, бизнес-логика живёт в `features/`.

```mermaid
flowchart TB
    subgraph app["app/"]
        ROUTER["router.tsx"]
        PROVIDERS["providers.tsx"]
    end

    subgraph pages["pages/"]
        PAGE["Тонкие страницы маршрутов"]
    end

    subgraph widgets["widgets/"]
        LAYOUT["Layout-оболочки"]
        LANDING["Landing-блоки"]
        CABINET["Cabinet UI-kit"]
    end

    subgraph features["features/"]
        F1["auth"]
        F2["companies"]
        F3["fsm"]
        F4["estimates"]
        F5["portal"]
        F6["admin"]
        F7["..."]
    end

    subgraph entities["entities/"]
        E1["user / authStore"]
        E2["company / roles"]
        E3["fsm / statuses"]
        E4["estimate / plans"]
    end

    subgraph shared["shared/"]
        API["api/client"]
        I18N["config/i18n"]
        UI["ui/ примитивы"]
    end

    ROUTER --> PAGE
    PAGE --> widgets
    PAGE --> features
    features --> entities
    features --> shared
    entities --> shared
```

### Управление состоянием

```mermaid
flowchart LR
    subgraph Client["Клиентское состояние — Zustand"]
        AUTH["useAuthStore<br/>accessToken · user · status"]
        CTX["useCompanyContextStore<br/>activeCompanyId → localStorage"]
    end

    subgraph Server["Серверное состояние — TanStack Query v5"]
        HOOKS["~40+ hooks<br/>features/*/api/"]
        CACHE["Persisted cache<br/>планы · города · категории"]
        SSE["SSE stream<br/>уведомления"]
    end

    subgraph API["apiFetch"]
        FETCH["fetch + timeout"]
        REFRESH["401 → auto refresh"]
    end

    AUTH --> FETCH
    CTX --> FETCH
    HOOKS --> FETCH
    FETCH --> REFRESH
    REFRESH --> AUTH
```

| Инструмент | Файл | Назначение |
|------------|------|------------|
| **Zustand** | `src/entities/user/model/authStore.ts` | Токен, пользователь, login/logout |
| **Zustand** | `src/entities/company/model/companyContextStore.ts` | Активная компания (persist) |
| **TanStack Query** | `src/shared/api/queryClient.ts` | Кэш API, staleTime 5 мин |
| **Persist** | `src/shared/api/persistQuery.ts` | IndexedDB для справочников |

> Redux **не используется** — осознанный выбор: Zustand для UI/auth, TanStack Query для всего серверного.

---

## Feature-модули

10 бизнес-модулей в `src/features/`:

```mermaid
mindmap
  root((features))
    auth
      login register guards
    companies
      каталог профиль команда
    fsm
      CRM работы счета
    estimates
      мастер сметы pricing
    portal
      клиентский кабинет
    admin
      модерация справочники
    notifications
      SSE Telegram
    subscriptions
      тарифы upgrade
    reviews
      отзывы
    settings
      язык пароль
```

| Модуль | API-хуки | UI |
|--------|----------|-----|
| **auth** | `useAuth.ts` | формы login/register, `AuthBootstrap` |
| **companies** | `useCompaniesPublic`, `useCompaniesTeam` | профиль, галерея, каталог |
| **fsm** | `useCustomers`, `useLeads`, `useInterventions`, `useQuotes`, `useInvoices` | CRM, Kanban, календарь, аналитика |
| **estimates** | `useEstimateProjects`, `useEstimateActions` | мастер 5 шагов, worksheets |
| **portal** | `usePortal.ts` | секции заявок, смет, счетов |
| **admin** | `useAdminCompanies`, `useAdminStats` | модерация, blueprints |
| **notifications** | `api.ts` + SSE | `NotificationBell` |
| **subscriptions** | plans API | `PlanCards`, `PlanUpgradePanel` |

---

## Маршрутизация

Конфигурация: `src/app/routes/router.tsx`  
Константы: `src/shared/constants/routes.constants.ts`

```mermaid
flowchart TD
    ROOT["/"] -->|"redirect"| LOCALE["/{locale}/"]
    LOCALE --> PUB["Публичные страницы"]
    LOCALE --> COMPANIES["companies/:slug"]

    LOGIN["/login"] --> AUTH["AuthLayout"]
    REGISTER["/register"] --> AUTH

    COMPANY["/company/*"] --> CG["RequireAuth<br/>COMPANY_STAFF"]
    CG --> CR["RequireCompanyRole<br/>роль + тариф"]
    CR --> CL["CompanyLayout"]

    PORTAL["/portal/*"] --> PG["RequireAuth<br/>END_CLIENT"]
    PG --> PL["PortalLayout"]

    ADMIN["/admin/*"] --> AG["RequireAuth<br/>PLATFORM_ADMIN"]
    AG --> AL["AdminLayout"]
```

### Публичные страницы (`/{locale}/...`)

| Путь | Страница |
|------|----------|
| `/` | Лендинг |
| `how-it-works` | Как это работает |
| `faq` | FAQ |
| `preturi` | Тарифы |
| `companies` | Каталог компаний |
| `companies/:slug` | Профиль компании + заявка |
| `privacy`, `terms` | Юридические документы |

**Локали:** `ro` (по умолчанию) и `ru` — префикс в URL.

### Кабинет компании (`/company/*`)

| Путь | Раздел | Мин. роль / план |
|------|--------|------------------|
| `/company` | Dashboard + аналитика | MEMBER |
| `/company/profile` | Профиль компании | OWNER |
| `/company/clienti` | CRM клиентов | MANAGER · PRO |
| `/company/cereri` | Заявки (лиды) | MANAGER · PRO |
| `/company/pipeline` | Kanban | MANAGER · BUSINESS |
| `/company/lucrari` | Работы | MEMBER |
| `/company/calendar` | Календарь | MEMBER |
| `/company/smete` | Сметы | MANAGER · BUSINESS |
| `/company/oferte` | Оферты | MANAGER · BUSINESS |
| `/company/facturi` | Счета | MANAGER · BUSINESS |
| `/company/team` | Команда | OWNER |
| `/company/subscription` | Тариф | OWNER |
| `/company/audit` | Аудит | OWNER |

### Клиентский портал (`/portal/*`)

| Путь | Раздел |
|------|--------|
| `/portal` | Dashboard |
| `/portal/cereri` | Мои заявки |
| `/portal/lucrari` | Работы |
| `/portal/oferte` | Оферты (принять/отклонить) |
| `/portal/smete` | Сметы |
| `/portal/facturi` | Счета + подтверждение оплаты |

### Админка (`/admin/*`)

| Путь | Раздел |
|------|--------|
| `/admin` | Статистика + модерация |
| `/admin/companies` | Компании |
| `/admin/cities` | Города |
| `/admin/categories` | Категории |
| `/admin/blueprints` | Шаблоны смет |
| `/admin/waitlist` | Лист ожидания |
| `/admin/audit` | Аудит платформы |

Страницы загружаются **lazy** через `src/app/routes/lazy-pages/`.

---

## Роли и пользовательские сценарии

### Три типа аккаунтов

```mermaid
flowchart LR
    subgraph Roles["AccountKind"]
        CS["COMPANY_STAFF"]
        EC["END_CLIENT"]
        PA["PLATFORM_ADMIN"]
    end

    CS --> COMPANY["/company/*"]
    EC --> PORTAL["/portal/*"]
    PA --> ADMIN["/admin/*"]
    PA -.->|"также"| COMPANY

    subgraph CompanyRoles["Роли в компании"]
        OW["OWNER"]
        MG["MANAGER"]
        MB["MEMBER"]
    end

    CS --> CompanyRoles
```

### Сценарий: от заявки до оплаты

```mermaid
sequenceDiagram
    actor Client as Клиент (END_CLIENT)
    actor Staff as Менеджер (COMPANY_STAFF)
    participant WEB as companii-web
    participant API as companii-api

    Client->>WEB: Заявка на companies/:slug
    WEB->>API: POST /companies/:slug/request-project
    Staff->>WEB: /company/cereri — новый лид
    Staff->>WEB: Конвертация → работа
  WEB->>API: POST /fsm/leads/:id/convert
    Staff->>WEB: /company/smete/new — мастер сметы
    WEB->>API: POST /estimates/projects + calculate
    Staff->>WEB: Generate quote
    WEB->>API: POST /estimates/projects/:id/generate-quote
    Client->>WEB: /portal/oferte — принять оферту
    WEB->>API: PATCH /portal/quotes/:id
    Staff->>WEB: /company/facturi — выставить счёт
    Client->>WEB: /portal/facturi — загрузить proof of payment
    WEB->>API: POST /portal/invoices/:id/payment-proof
```

### Сценарий: сотрудник компании

```mermaid
flowchart TD
    REG["Регистрация /team/invite"] --> ONB["Onboarding<br/>/company/profile"]
    ONB --> PUB["Публикация профиля"]
    PUB --> LIVE["Публичная страница<br/>/{locale}/companies/:slug"]
    LIVE --> LEADS["Заявки → /company/cereri"]
    LEADS --> CRM["CRM → /company/clienti"]
    CRM --> WORK["Работы → /company/lucrari"]
    WORK --> EST["Сметы → /company/smete"]
    EST --> QUOTE["Оферты → /company/oferte"]
    QUOTE --> INV["Счета → /company/facturi"]
```

### Мастер сметы (5 шагов)

```mermaid
flowchart LR
    S1["1. Объект<br/>ObjectStep"] --> S2["2. Диагностика<br/>DiagnosticStep"]
    S2 --> S3["3. Этапы<br/>StagesStep"]
    S3 --> S4["4. План<br/>PlanStep"]
    S4 --> S5["5. Обзор<br/>ReviewStep"]
    S5 --> PDF["PDF / Оферта / Конвертация"]
```

Файлы: `src/features/estimates/wizard/steps/`

---

## Взаимодействие с API

```mermaid
sequenceDiagram
    participant UI as React Component
    participant Hook as useXxxQuery
    participant Fetch as apiFetch
    participant Store as useAuthStore
    participant API as companii-api

    UI->>Hook: render
    Hook->>Fetch: GET /fsm/customers
    Fetch->>Store: get accessToken + companyId
    Fetch->>API: Authorization: Bearer ...<br/>x-company-id: ...
    alt 401 Unauthorized
        API-->>Fetch: 401
        Fetch->>API: POST /auth/refresh (cookie)
        API-->>Fetch: new accessToken
        Fetch->>Store: setToken
        Fetch->>API: retry original request
    end
    API-->>Hook: { data, meta }
    Hook-->>UI: { data, isLoading, error }
```

| Файл | Назначение |
|------|------------|
| `src/shared/api/client/apiFetch.ts` | Основной fetch-wrapper |
| `src/shared/api/client/config.ts` | Auth context + refresh |
| `src/entities/user/api/refreshAccessToken.ts` | Обновление токена |
| `src/entities/user/api/authContext.ts` | Bearer + x-company-id |
| `src/shared/config/env.ts` | `VITE_API_URL`, httpOnly cookie |

**Dev proxy** (`vite.config.ts`): `/api` и `/uploads` → `http://127.0.0.1:4100`  
**Prod** (`nginx.conf`): SPA fallback + proxy `/api/` → `http://api:4100/api/`

---

## UI и дизайн-система

```mermaid
flowchart TB
    subgraph Design["Дизайн"]
        TW["Tailwind CSS 4"]
        FONT["Manrope + Outfit"]
        ICON["Phosphor Icons"]
        MOTION["Framer Motion"]
    end

    subgraph Components["Компоненты"]
        SHARED["shared/ui/<br/>примитивы, модалки, SEO"]
        CABINET["widgets/cabinet/<br/>Panel, PageHero, EmptyState"]
        LAYOUT["widgets/layout/<br/>CompanyLayout, PortalLayout"]
        LANDING["widgets/landing/<br/>Hero, Features, CTA"]
    end

    subgraph Forms["Формы"]
        RHF["react-hook-form"]
        ZOD["zod validation"]
    end

    Design --> Components
    Forms --> Components
```

| Технология | Использование |
|------------|---------------|
| **Tailwind CSS 4** | `@theme` в `src/index.css`, violet/indigo палитра |
| **Radix UI** | Label, Slot |
| **TanStack Table** | Таблицы CRM, счетов |
| **ApexCharts** | Аналитика dashboard (lazy) |
| **react-hot-toast** | Уведомления |
| **react-helmet-async** | SEO meta tags |

Cabinet UI-kit: `src/widgets/cabinet/cabinet-ui.tsx` — `Panel`, `PageHero`, `SoftBadge`, glass-panel стили.

---

## Интернационализация (i18n)

| Параметр | Значение |
|----------|----------|
| Библиотека | i18next + react-i18next |
| Языки | `ro` (fallback), `ru` |
| Публичные URL | `/{locale}/...` |
| Кабинеты | Язык из localStorage / i18next |
| Lazy load | Только активный язык в initial bundle |

```
src/shared/config/i18n/translations/
├── companii/ru|ro/     # кабинет, auth, admin, portal
├── public/ru|ro/       # landing, marketing
└── status.ru|ro.ts     # статусы FSM
```

---

## Тарифные ограничения

```mermaid
flowchart TD
    FREE["FREE"] --> F1["Работы · Календарь · Услуги · Отзывы"]
    PRO["PRO"] --> F1
    PRO --> P1["+ CRM · Заявки · Рабочие листы"]
    BUSINESS["BUSINESS"] --> P1
    BUSINESS --> B1["+ Pipeline · Сметы · Оферты · Счета"]

    subgraph Guard["RequireCompanyRole"]
        CHECK{"plan >= required?"}
        CHECK -->|нет| UPGRADE["PlanUpgradePanel"]
        CHECK -->|да| PAGE["Страница"]
    end
```

Файл: `src/entities/subscription/model/planEntitlements.ts`

---

## Быстрый старт

### Локальная разработка

```bash
# 1. Запустите API (в соседнем репозитории)
cd ../companii-api
docker compose -f docker-compose.dev.yml up -d postgres redis
npm run start:dev

# 2. Запустите фронтенд
cd ../companii-web
cp .env.example .env
npm install
npm run dev
```

| Сервис | URL |
|--------|-----|
| Приложение | http://localhost:5174 |
| API (через proxy) | http://localhost:5174/api/v1 |

### Docker

```bash
cp .env.docker.example .env.docker
npm run docker:up        # dev, порт 5174
npm run docker:prod:up   # prod nginx, порт 8082
```

---

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `VITE_API_URL` | Base URL API | `/api/v1` |
| `VITE_DEV_API_PROXY_TARGET` | Target Vite proxy | `http://127.0.0.1:4100` |
| `VITE_ENV` | Окружение | `development` |
| `VITE_USE_HTTPONLY_COOKIE` | Refresh в cookie | `true` |
| `VITE_MEDIA_URL` | CDN для медиа (опц.) | — |

Production build args: `VITE_API_URL=https://api.companii.faber.md/api/v1`

---

## Структура репозитория

```
companii-web/
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── providers.tsx       # Query, i18n, Motion
│   │   └── routes/             # router, lazy-pages, guards
│   ├── pages/                  # страницы маршрутов
│   ├── widgets/
│   │   ├── layout/             # CompanyLayout, PortalLayout, AdminLayout
│   │   ├── landing/            # лендинг-блоки
│   │   └── cabinet/            # UI-kit кабинета
│   ├── features/               # 10 бизнес-модулей
│   │   ├── auth/
│   │   ├── companies/
│   │   ├── fsm/
│   │   ├── estimates/          # самый крупный модуль
│   │   ├── portal/
│   │   └── admin/
│   ├── entities/               # доменные модели + stores
│   │   ├── user/model/authStore.ts
│   │   ├── company/model/roles.constants.ts
│   │   └── subscription/model/planEntitlements.ts
│   └── shared/
│       ├── api/                # apiFetch, queryClient
│       ├── config/i18n/        # переводы ro/ru
│       └── ui/                 # примитивы
├── nginx.conf                  # prod: SPA + API proxy
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── Dockerfile                  # dev (Vite) + prod (nginx)
```

---

## Скрипты

```bash
npm run dev              # Vite dev server :5174
npm run build            # tsc + vite build
npm run build:seo        # build + sitemap
npm run build:analyze    # bundle visualizer
npm run test             # Vitest
npm run lint             # ESLint
```

---

## Real-time уведомления

```mermaid
sequenceDiagram
    participant Bell as NotificationBell
    participant SSE as useNotificationStream
    participant API as companii-api

    Bell->>SSE: mount
    SSE->>API: GET /notifications/stream (SSE)
    loop events
        API-->>SSE: notification.created
        SSE->>Bell: update unread count
    end
    Bell->>API: PATCH /notifications/:id/read
```

Файлы: `src/features/notifications/hooks/useNotificationStream.ts`

---

## Связь с API

| Аспект | Web | API |
|--------|-----|-----|
| Авторизация | Zustand + httpOnly cookie | JWT + refresh rotation |
| Tenant | `x-company-id` header | PostgreSQL RLS |
| Кэш | TanStack Query + IndexedDB | Redis cache |
| Файлы | `MediaImage`, lightbox | B2 / local uploads |
| PDF | download blob | BullMQ pdf workers |

Backend: **[companii-api](../companii-api)**

---

<div align="center">

**Faber Companii Web** · React 19 · Private

</div>
