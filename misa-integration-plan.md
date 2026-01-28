# MISA Integration Plan for The Roof HRM

## 📋 Overview

Based on research, MISA offers **Open API** for their AMIS platform that allows two-way data synchronization between external systems and MISA accounting software.

---

## 🔗 MISA API Capabilities

### What Can Be Synced

| Data Type | Direction | Description |
|-----------|-----------|-------------|
| **Sales/Revenue** | MISA → HRM | Pull daily sales data, invoices |
| **Customers** | Both ways | Sync customer database |
| **Inventory** | MISA → HRM | Stock levels (shisha, drinks) |
| **Invoices** | Both ways | E-invoices (hóa đơn điện tử) |
| **Warehouse** | MISA → HRM | Stock movements |
| **Chart of Accounts** | MISA → HRM | Account structure |

### What CANNOT Be Synced (Limitations)
- ❌ Cannot retrieve document lists via API
- ❌ Cannot retrieve documents by document code
- ❌ Results are returned via webhook (async), not immediate response

---

## 🔐 Authentication Flow

```
1. Register for API Access
   └── Contact MISA to get: app_id, secret_key
   └── Register your callback URL

2. Get Access Code
   └── User authorizes via MISA AMIS interface
   └── MISA returns access_code to your callback URL

3. Exchange for Access Token
   └── POST to MISA token endpoint
   └── Receive access_token (valid 12 hours)
   └── Use refresh_token when expired

4. Make API Calls
   └── Include access_token in headers
   └── Results returned via webhook callback
```

---

## 📊 Data We Want to Sync

### Priority 1: Daily Revenue (MISA → HRM)
```
What: Total daily sales, broken down by category
Why: Feed your KPI dashboard automatically
Frequency: Daily (end of day) or real-time

Data points:
- Total revenue (doanh thu)
- Number of transactions (PAX proxy)
- Payment method breakdown (cash/card/transfer)
- Category breakdown (shisha/drinks/food)
```

### Priority 2: Invoices (MISA → HRM)
```
What: E-invoice data
Why: Track sales by category, customer spending
Frequency: Real-time or hourly

Data points:
- Invoice number
- Customer info
- Line items (products sold)
- Total amount
- Payment status
```

### Priority 3: Inventory Levels (MISA → HRM)
```
What: Stock levels for key items
Why: Low stock alerts for shisha, premium spirits
Frequency: Daily

Data points:
- Item name
- Current quantity
- Minimum threshold
- Last restock date
```

---

## 🏗️ Integration Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│   MISA AMIS     │────▶│  Integration     │────▶│  The Roof HRM   │
│   (Accounting)  │     │  Service         │     │  (Dashboard)    │
│                 │◀────│  (Supabase Edge  │◀────│                 │
│                 │     │   Functions)     │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        │                       ▼                        │
        │              ┌──────────────────┐             │
        │              │                  │             │
        └─────────────▶│    Supabase DB   │◀────────────┘
                       │  (single source  │
                       │   of truth)      │
                       └──────────────────┘
```

### Option A: Scheduled Sync (Recommended for MVP)
```
Frequency: Every night at 2 AM
Process:
1. Supabase Edge Function triggers
2. Calls MISA API to get yesterday's data
3. Transforms and stores in Supabase
4. Dashboard shows fresh data in morning

Pros: Simple, reliable, low API usage
Cons: Not real-time (24-hour delay)
```

### Option B: Webhook Real-time Sync
```
Frequency: Real-time (as transactions happen)
Process:
1. MISA sends webhook when invoice created
2. Supabase Edge Function receives
3. Parses and stores immediately
4. Dashboard updates in real-time

Pros: Live data
Cons: More complex, need webhook endpoint
```

### Option C: Manual Sync Button
```
Frequency: On-demand
Process:
1. User clicks "Sync with MISA" button
2. Frontend calls Supabase Edge Function
3. Function pulls latest data from MISA
4. Dashboard refreshes

Pros: User control, simple
Cons: Requires manual action
```

---

## 📁 Database Tables for MISA Data

### misa_sync_log
```sql
CREATE TABLE misa_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL, -- 'daily_revenue', 'invoices', 'inventory'
  sync_date DATE NOT NULL,
  status TEXT NOT NULL, -- 'success', 'failed', 'pending'
  records_synced INTEGER,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### misa_daily_revenue
```sql
CREATE TABLE misa_daily_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  date DATE NOT NULL,
  total_revenue DECIMAL(15,2),
  cash_revenue DECIMAL(15,2),
  card_revenue DECIMAL(15,2),
  transfer_revenue DECIMAL(15,2),
  transaction_count INTEGER,
  shisha_revenue DECIMAL(15,2),
  drinks_revenue DECIMAL(15,2),
  food_revenue DECIMAL(15,2),
  other_revenue DECIMAL(15,2),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  misa_reference TEXT, -- reference ID from MISA
  UNIQUE(venue_id, date)
);
```

### misa_invoices
```sql
CREATE TABLE misa_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  misa_invoice_id TEXT NOT NULL,
  invoice_number TEXT,
  invoice_date TIMESTAMPTZ,
  customer_name TEXT,
  customer_phone TEXT,
  subtotal DECIMAL(15,2),
  tax DECIMAL(15,2),
  total DECIMAL(15,2),
  payment_method TEXT,
  status TEXT,
  line_items JSONB, -- array of products
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(misa_invoice_id)
);
```

---

## 🚀 Implementation Roadmap

### Phase 1: Manual Entry (Current)
- ✅ Daily metrics form for manual data entry
- ✅ Dashboard shows data from Supabase
- User enters revenue/PAX daily

### Phase 2: MISA API Setup (Week 1)
```
Tasks:
1. Contact MISA to request API access
2. Get app_id and credentials
3. Set up callback URL (Supabase Edge Function)
4. Test authentication flow
5. Store credentials securely in Supabase Vault
```

### Phase 3: Daily Revenue Sync (Week 2)
```
Tasks:
1. Create Supabase Edge Function for MISA sync
2. Implement daily revenue pull
3. Transform MISA data to HRM format
4. Store in misa_daily_revenue table
5. Update dashboard to use MISA data
6. Add manual "Sync Now" button
```

### Phase 4: Invoice Sync (Week 3)
```
Tasks:
1. Implement invoice sync (if API supports)
2. Create invoice list view
3. Calculate category breakdown from line items
4. Show top-selling products
```

### Phase 5: Inventory Alerts (Week 4)
```
Tasks:
1. Sync inventory levels
2. Set up low-stock thresholds
3. Create inventory alerts widget
4. Email notifications for critical items
```

---

## 📞 Next Steps: Contact MISA

### What to Ask MISA

1. **API Access Request**
   - "Chúng tôi muốn đăng ký sử dụng Open API của AMIS Kế toán"
   - Request app_id and API documentation

2. **Questions to Ask**
   - Endpoint để lấy doanh thu theo ngày?
   - Có thể lấy dữ liệu theo category (shisha, drinks, food)?
   - Rate limit là bao nhiêu requests/day?
   - Chi phí sử dụng API (nếu có)?

3. **Technical Details Needed**
   - API base URL
   - Authentication method (OAuth2?)
   - Webhook format for callbacks
   - Data format (JSON structure)

### MISA Contact
- Website: https://amis.misa.vn
- Support: Liên hệ qua hotline hoặc form trên website
- Documentation: https://www.misa.vn/154117/tong-quan-open-api-amis-ke-toan-doanh-nghiep/

---

## 💰 Cost Considerations

| Item | Estimated Cost |
|------|----------------|
| MISA API Access | May require AMIS subscription upgrade |
| Supabase Edge Functions | Free tier: 500K invocations/month |
| Development time | 2-3 weeks for full integration |

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| MISA API access denied | Continue with manual entry + CSV import |
| API rate limits | Implement caching, batch requests |
| Data format changes | Version your sync functions, add error handling |
| Real-time not supported | Use scheduled sync (acceptable for daily KPIs) |

---

## 🎯 Recommendation

**Start with Option A (Scheduled Nightly Sync)** because:
1. Simpler to implement
2. MISA API returns results via webhook (async anyway)
3. Daily KPIs don't need real-time data
4. Lower API usage = lower risk of rate limits

**Fallback Plan:**
If MISA API integration is too complex or costly, implement:
- CSV import from MISA export
- Simple daily form entry (already built)
- Both options maintain data consistency
