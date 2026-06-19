---
name: umrah-finance-planner
description: create, review, or implement an admin finance calculator and b2b umrah trip planner for travel agencies. use when designing modules for umrah package costing, traveller/group pricing, supplier rates, commissions, payments, invoices, profit calculations, b2b agent portals, visa/hotel/flight/transport cost tracking, or prompts for claude/cursor to build these features in a website or admin dashboard.
---

# Umrah Finance Planner

## Goal
Help build an admin-first Umrah finance and trip planning system for agencies. Focus on manual-first costing, package building, quotation, payment tracking, commissions, supplier payables, and profit reporting before adding expensive flight/hotel/visa APIs.

## Core operating principles
- Start with manual rates and uploaded confirmations before API integrations.
- Treat every package as a finance object: cost, selling price, markup, commission, payments, balance, and profit.
- Separate operational status from financial status.
- Keep AI optional and off by default; never require AI for normal calculations.
- Never claim direct visa/Nusuk/IATA capability unless the user has licensed provider access.
- Include audit logs for financial changes.
- Use role-based permissions for admin, finance, sales, visa officer, operations, and b2b agent.

## Recommended MVP modules
1. **Dashboard**: sales, cost, profit, pending payments, supplier payables, agent commissions.
2. **Package Builder**: economy, standard, premium, Ramadan, family, group, custom.
3. **Cost Calculator**: flights, visa, hotels, transport, ziyarat, guide, food, insurance, gateway fees, buffers, markup.
4. **Quote Builder**: customer-facing quotation with per-person and group totals.
5. **Traveller Management**: passport, documents, visa status, rooming, ticket, payments.
6. **Group Management**: departure, return, PNR, hotel dates, bus, guide, room allocation.
7. **Supplier Ledger**: hotel, airline/GDS, visa provider, transport, local operator, insurance.
8. **Payments & Invoices**: deposits, due dates, receipts, refunds, balances.
9. **B2B Agent Portal**: quotes, traveller upload, commission, status tracking.
10. **Reports**: profit by group, package, agent, supplier, destination, currency.

## Calculation rules
Use consistent formulas and show breakdowns clearly:

```text
base_cost = flight_cost + visa_cost + hotel_cost + transport_cost + ziyarat_cost + guide_cost + food_cost + insurance_cost + other_costs
buffer_amount = base_cost * buffer_percent / 100
payment_fee = expected_customer_payment * payment_fee_percent / 100
net_cost = base_cost + buffer_amount + payment_fee
markup_amount = fixed_markup + (net_cost * markup_percent / 100)
agent_commission = fixed_agent_commission + (selling_price * agent_commission_percent / 100)
tax_amount = taxable_amount * tax_percent / 100
selling_price = net_cost + markup_amount + agent_commission + tax_amount
profit = selling_price - net_cost - agent_commission - tax_amount
balance_due = selling_price - payments_received
```

When currency conversion applies:

```text
local_amount = foreign_amount * exchange_rate
profit_after_fx_buffer = profit - fx_buffer_amount
```

Always label currency, exchange rate, and whether the rate is locked or estimated.

## Data model checklist
When asked for implementation, include these minimum entities:

- users, roles, agencies, agents
- packages, package_items
- groups, travellers, group_travellers
- quotes, quote_items
- bookings, booking_travellers
- suppliers, supplier_rates, supplier_invoices
- payments, refunds, expenses
- commissions
- documents
- visa_applications
- flight_segments
- hotel_bookings
- transport_bookings
- invoices
- activity_logs

## Admin screens to design
- Finance Overview Dashboard
- Create Package
- Package Cost Calculator
- Create Quote
- Quote Detail / Send PDF
- Group Detail
- Traveller Detail
- Payment Collection
- Supplier Payables
- Agent Commission Report
- Profit & Loss Report
- Settings: currencies, taxes, buffers, markup rules

## User stories
Use these when creating PRDs or prompts:

- As an admin, create a package with all expected costs and markups.
- As a finance manager, see true profit after supplier costs, commissions, payment fees, and currency buffers.
- As a sales officer, create a quote for a traveller or family group.
- As a b2b agent, add travellers and documents but only see my own customers.
- As an operations officer, update visa, hotel, flight, and transport statuses.
- As an owner, compare package profitability across groups and agents.

## Integration guidance
Use integrations in phases:

### Phase 1: Manual-first
- Manual flight cost/PNR entry
- Manual hotel rate entry
- Manual visa provider status
- Manual transport cost
- PDF upload for confirmations

### Phase 2: Standard integrations
- Payment gateway
- WhatsApp notification
- PDF invoice/quote generation
- Accounting export CSV

### Phase 3: Travel APIs
- Flight APIs/GDS only after commercial access exists
- Hotel supplier APIs only after contracts exist
- Visa/Nusuk workflows only through licensed/approved providers

### Phase 4: MCP server
Use MCP mainly for admin/operator tools, not public traveller workflows. Suggested tools:
- `getPackageProfitability(packageId)`
- `createQuoteFromPackage(packageId, travellerCount, currency)`
- `updateTravellerVisaStatus(travellerId, status)`
- `listSupplierPayables(dateRange)`
- `exportGroupFinanceReport(groupId)`

## Prompt output rules
When generating a Claude/Cursor implementation prompt, include:
- exact target module name and route
- current project inspection step
- target files to create or modify
- database migration requirements
- role permissions
- calculation formulas
- acceptance criteria
- tests/build commands
- instruction to summarize changed files
- instruction to update memory/bugfix logs

## Quality checks
Before finalizing any finance feature, verify:
- all monetary fields use decimals, not floats
- every calculation stores source inputs and calculated outputs
- admins can override values with reason notes
- activity logs capture financial changes
- b2b agents cannot see other agents' customers
- invoices and quotes include currency and payment terms
- profit report reconciles with payments and expenses

## Ready feature breakdown
Use this breakdown for first implementation sprint:

1. Create finance settings: currencies, default markup, default buffer, payment fee, tax settings.
2. Create package cost calculator with itemized costs.
3. Create quote builder from package.
4. Add traveller/group count logic.
5. Add payments and balance tracking.
6. Add admin profit dashboard.
7. Add PDF quote/invoice export.
8. Add activity logging.
