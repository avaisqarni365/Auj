# Claude integration prompt

Use this prompt to ask Claude/Cursor to implement the Admin Finance Calculator.

```text
You are a senior full-stack developer and travel-finance systems architect.

Project goal:
Build an Admin Finance Calculator for an Umrah B2B trip planner inside my existing website/admin project.

First inspect the current project structure and identify:
1. framework and routing system
2. authentication and role system
3. database ORM/migration system
4. existing admin layout/components
5. existing currency/payment/invoice features, if any

Do not start coding until you provide a short file-by-file implementation plan.

Required admin route/module:
- /admin/umrah-finance

Core screens:
1. Finance Dashboard
2. Package Cost Calculator
3. Create/Edit Package
4. Create Quote from Package
5. Traveller/Group Cost Summary
6. Payment & Balance Tracking
7. Supplier Cost Breakdown
8. Agent Commission Summary
9. Profit Report

Calculator fields:
- traveller_count
- adult_count
- child_count
- infant_count
- currency
- exchange_rate
- flight_cost_per_person
- visa_cost_per_person
- makkah_hotel_cost_total
- madinah_hotel_cost_total
- transport_cost_total
- ziyarat_cost_total
- guide_cost_total
- food_cost_total
- insurance_cost_per_person
- other_costs
- buffer_percent
- payment_fee_percent
- fixed_markup
- markup_percent
- agent_commission_fixed
- agent_commission_percent
- tax_percent
- discount
- deposit_received

Required formulas:
base_cost = all direct costs
buffer_amount = base_cost * buffer_percent / 100
payment_fee = expected_customer_payment * payment_fee_percent / 100
net_cost = base_cost + buffer_amount + payment_fee
markup_amount = fixed_markup + (net_cost * markup_percent / 100)
agent_commission = agent_commission_fixed + (selling_price * agent_commission_percent / 100)
tax_amount = taxable_amount * tax_percent / 100
selling_price = net_cost + markup_amount + agent_commission + tax_amount - discount
profit = selling_price - net_cost - agent_commission - tax_amount
balance_due = selling_price - deposit_received
per_person_price = selling_price / traveller_count

Important implementation rules:
- Use decimal/money-safe handling. Do not use unsafe floating point for stored financial values.
- Store both input values and calculated totals.
- Allow admin override with reason note.
- Add activity log for all financial edits.
- Support draft, confirmed, invoiced, paid, cancelled statuses.
- B2B agents should only see their own quotes/customers.
- Admin and finance roles can see profit. Agents should not see internal profit.
- No AI calls are needed for this calculator.

Database tables to add if missing:
- umrah_packages
- umrah_package_items
- umrah_quotes
- umrah_quote_items
- umrah_groups
- umrah_travellers
- umrah_payments
- umrah_expenses
- umrah_suppliers
- umrah_commissions
- activity_logs or finance_activity_logs

UI requirements:
- Admin dashboard cards: total sales, total costs, gross profit, pending balance, supplier payable, agent commission.
- Itemized calculator table with cost category, unit cost, quantity, total cost, markup, selling amount.
- Summary panel showing total cost, selling price, profit, margin %, balance due.
- Buttons: Save Draft, Generate Quote, Create Invoice, Export PDF, Duplicate Package.
- Responsive admin layout.

Acceptance criteria:
- Existing site still builds.
- New admin route works.
- Admin can create a package and calculate total selling price.
- Admin can create a quote for a group/traveller count.
- Deposit and balance are calculated correctly.
- Profit is hidden from non-admin/non-finance users.
- All currency amounts show currency code.
- Changes are recorded in activity log.
- Provide test cases for at least three packages: economy, family, premium.
- Summarize changed files and next steps after implementation.
```
