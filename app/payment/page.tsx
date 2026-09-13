"use client";

import { useMemo, useState } from "react";
import styles from "./payment.module.css";

type PaymentOption = {
  name: string;
  group: string;
  region: string;
  description: string;
  integration: string;
  accent: string;
};

const paymentOptions: PaymentOption[] = [
  { name: "Visa", group: "Cards", region: "Global", description: "Widely accepted card network for credit, debit, and prepaid transactions.", integration: "Card network", accent: "visa" },
  { name: "Mastercard", group: "Cards", region: "Global", description: "Global card scheme supporting credit, debit, prepaid, and commercial cards.", integration: "Card network", accent: "mastercard" },
  { name: "American Express", group: "Cards", region: "Global", description: "Card network commonly used for consumer, premium, and corporate payments.", integration: "Card network", accent: "amex" },
  { name: "UnionPay", group: "Cards", region: "China / Global", description: "Major card network with strong acceptance across mainland China and international markets.", integration: "Card network", accent: "unionpay" },
  { name: "JCB", group: "Cards", region: "Japan / Global", description: "Japanese card network with broad acceptance across Asia and travel markets.", integration: "Card network", accent: "jcb" },
  { name: "Diners Club", group: "Cards", region: "Global", description: "A long-running charge and travel card network used by consumers and businesses.", integration: "Card network", accent: "diners" },
  { name: "Apple Pay", group: "Wallets", region: "Global", description: "Device wallet using tokenized cards and biometric or passcode confirmation.", integration: "Wallet", accent: "apple" },
  { name: "Google Pay", group: "Wallets", region: "Global", description: "Google wallet for saved cards, device payments, and supported online checkout flows.", integration: "Wallet", accent: "google" },
  { name: "Samsung Pay", group: "Wallets", region: "Global", description: "Samsung wallet supporting cards, device authentication, and selected local payment features.", integration: "Wallet", accent: "samsung" },
  { name: "PayPal", group: "Wallets", region: "Global", description: "Digital wallet with stored funding sources and buyer account authentication.", integration: "Wallet", accent: "paypal" },
  { name: "Amazon Pay", group: "Wallets", region: "Global", description: "Checkout using payment details and delivery information saved with Amazon.", integration: "Wallet", accent: "amazon" },
  { name: "Alipay", group: "Wallets", region: "China / Global", description: "Large Chinese digital wallet used for online, mobile, and QR payments.", integration: "Wallet", accent: "alipay" },
  { name: "WeChat Pay", group: "Wallets", region: "China / Global", description: "Mobile wallet integrated into WeChat for QR, in-app, and online payments.", integration: "Wallet", accent: "wechat" },
  { name: "Antom", group: "Wallets", region: "Asia / Global", description: "Ant International payment platform connecting merchants with wallets and local methods across markets.", integration: "Payment platform", accent: "antom" },
  { name: "GrabPay", group: "Local wallets", region: "Singapore / Southeast Asia", description: "Regional wallet associated with Grab services and local merchant payments.", integration: "Wallet", accent: "grab" },
  { name: "PayNow", group: "Local wallets", region: "Singapore", description: "Singapore instant payment method using a mobile number, NRIC/FIN, or a PayNow QR flow.", integration: "Bank transfer / QR", accent: "paynow" },
  { name: "DBS PayLah!", group: "Local wallets", region: "Singapore", description: "Singapore mobile wallet used for peer transfers, QR payments, and selected merchant checkout.", integration: "Wallet", accent: "dbs" },
  { name: "ShopeePay", group: "Local wallets", region: "Southeast Asia", description: "Regional wallet connected to Shopee and supported online and offline merchant experiences.", integration: "Wallet", accent: "shopee" },
  { name: "Kakao Pay", group: "Local wallets", region: "South Korea", description: "Korean wallet and financial services platform used across online and offline checkout.", integration: "Wallet", accent: "kakao" },
  { name: "LINE Pay", group: "Local wallets", region: "Asia", description: "Wallet experience connected to LINE and available in selected Asian markets.", integration: "Wallet", accent: "line" },
  { name: "PIX", group: "Bank methods", region: "Brazil", description: "Brazilian instant payment system supporting keys, QR codes, and immediate account transfers.", integration: "Instant bank transfer", accent: "pix" },
  { name: "iDEAL", group: "Bank methods", region: "Netherlands", description: "Dutch online banking method that sends customers to their bank for authorization.", integration: "Bank redirect", accent: "ideal" },
  { name: "Sofort", group: "Bank methods", region: "Europe", description: "Bank transfer method that lets customers authorize a payment through online banking.", integration: "Bank redirect", accent: "sofort" },
  { name: "Przelewy24", group: "Bank methods", region: "Poland", description: "Polish payment aggregator supporting online banking and other local payment flows.", integration: "Bank redirect", accent: "p24" },
  { name: "POLi", group: "Bank methods", region: "Australia / New Zealand", description: "Online bank transfer method that uses a customer's existing bank login.", integration: "Bank redirect", accent: "poli" },
  { name: "Klarna", group: "Buy now, pay later", region: "Global", description: "Flexible checkout provider offering pay-now, pay-later, and installment experiences where available.", integration: "BNPL", accent: "klarna" },
  { name: "Afterpay", group: "Buy now, pay later", region: "Australia / Global", description: "Installment payment method that splits an eligible purchase into scheduled payments.", integration: "BNPL", accent: "afterpay" },
  { name: "Atome", group: "Buy now, pay later", region: "Asia", description: "Asian installment payment provider available in selected merchant and customer markets.", integration: "BNPL", accent: "atome" },
  { name: "Crypto", group: "Alternative", region: "Selected markets", description: "Digital asset checkout, usually handled through a specialized processor and settlement flow.", integration: "Alternative payment", accent: "crypto" },
  { name: "Cash on delivery", group: "Offline", region: "Market dependent", description: "Customer pays when the order arrives. Useful for specific delivery models but operationally different from online authorization.", integration: "Offline", accent: "cash" },
];

const groups = ["All", ...new Set(paymentOptions.map((option) => option.group))];

export default function PaymentPage() {
  const [activeGroup, setActiveGroup] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(["Visa", "Mastercard", "Apple Pay", "PayNow"]);
  const [paymentMethod, setPaymentMethod] = useState("Visa");
  const [submitted, setSubmitted] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = useMemo(() => paymentOptions.filter((option) => {
    const searchable = Object.values(option).join(" ").toLowerCase();
    return (activeGroup === "All" || option.group === activeGroup) && (!normalizedQuery || searchable.includes(normalizedQuery));
  }), [activeGroup, normalizedQuery]);

  function toggleSelection(name: string) {
    setSelected((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  function handleMockSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className={styles.page}>
      <section className={styles.checkoutSection} aria-labelledby="checkout-title">
        <div className={styles.checkoutIntro}>
          <p className={styles.eyebrow}>Mock checkout</p>
          <h1 id="checkout-title">Try a payment.</h1>
          <p>Fill in sample customer and card details to preview the checkout flow. Nothing is sent anywhere.</p>
        </div>
        <form className={styles.checkoutForm} onSubmit={handleMockSubmit}>
          <fieldset>
            <legend>Customer details</legend>
            <div className={styles.formGrid}>
              <label>Full name<input name="fullName" autoComplete="name" placeholder="Alex Tan" required /></label>
              <label>Email address<input name="email" type="email" autoComplete="email" placeholder="alex@example.com" required /></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Payment method</legend>
            <div className={styles.methodChoices}>
              {selected.map((method) => <label className={paymentMethod === method ? styles.activeMethod : ""} key={method}><input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />{method}</label>)}
            </div>
          </fieldset>
          {paymentMethod === "Visa" || paymentMethod === "Mastercard" ? <fieldset>
            <legend>Card details</legend>
            <div className={styles.formGrid}>
              <label className={styles.fullField}>Card number<input name="cardNumber" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" required /></label>
              <label>Expiry date<input name="expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" required /></label>
              <label>Security code<input name="securityCode" inputMode="numeric" autoComplete="cc-csc" placeholder="123" required /></label>
            </div>
          </fieldset> : <p className={styles.walletHint}>{paymentMethod} would continue in its own wallet or authorization flow.</p>}
          <fieldset>
            <legend>Billing address</legend>
            <div className={styles.formGrid}>
              <label className={styles.fullField}>Address<input name="address" autoComplete="street-address" placeholder="10 Example Street" required /></label>
              <label>City<input name="city" autoComplete="address-level2" placeholder="Singapore" required /></label>
              <label>Postal code<input name="postalCode" autoComplete="postal-code" placeholder="018956" required /></label>
            </div>
          </fieldset>
          <div className={styles.formActions}><button type="submit" className={styles.payButton}>Preview payment</button>{submitted && <span className={styles.successMessage}>Mock payment accepted. No transaction was created.</span>}</div>
        </form>
      </section>

      <section className={styles.workspace} aria-label="Payment method explorer">
        <div className={styles.toolbar}>
          <label className={styles.search}><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Visa, Singapore, wallet..." /></label>
          <span className={styles.resultCount}>{visibleOptions.length} shown</span>
        </div>
        <div className={styles.content}>
          <aside className={styles.sidebar}>
            <p className={styles.sidebarLabel}>Browse by type</p>
            <div className={styles.groupList}>{groups.map((group) => <button type="button" className={activeGroup === group ? styles.activeGroup : ""} key={group} onClick={() => setActiveGroup(group)}><span>{group}</span><strong>{group === "All" ? paymentOptions.length : paymentOptions.filter((option) => option.group === group).length}</strong></button>)}</div>
            <div className={styles.mockNote}><span>MOCK MODE</span><p>Select methods to imagine your first checkout setup.</p></div>
          </aside>
          <div className={styles.results}>
            {visibleOptions.map((option) => <PaymentCard key={option.name} option={option} selected={selected.includes(option.name)} onToggle={() => toggleSelection(option.name)} />)}
            {!visibleOptions.length && <p className={styles.empty}>No payment methods match that search.</p>}
          </div>
          <aside className={styles.selection}>
            <p className={styles.sidebarLabel}>Your draft setup</p>
            <strong className={styles.selectionCount}>{selected.length}<span> selected</span></strong>
            <p className={styles.selectionHint}>A balanced starting point for an international checkout:</p>
            <ul>{selected.map((name) => <li key={name}><span>{name}</span><button type="button" onClick={() => toggleSelection(name)} aria-label={`Remove ${name}`}>×</button></li>)}</ul>
            <button type="button" className={styles.clearButton} onClick={() => setSelected([])}>Clear selection</button>
          </aside>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <p className={styles.eyebrow}>Payment methods / mock catalog</p>
          <h1>Build a payment <em>toolbox.</em></h1>
          <p>Explore {paymentOptions.length} payment options for a modern checkout. This is a planning mockup: no live gateway credentials or payment processing are connected.</p>
        </div>
        <span className={styles.footerTag}>Mockup only</span>
      </footer>
    </main>
  );
}

function PaymentCard({ option, selected, onToggle }: { option: PaymentOption; selected: boolean; onToggle: () => void }) {
  return <article className={`${styles.card} ${selected ? styles.selectedCard : ""}`}><div className={`${styles.logo} ${styles[option.accent]}`}>{option.name.slice(0, 2).toUpperCase()}</div><div className={styles.cardInfo}><div className={styles.cardMeta}><span>{option.group}</span><span>{option.region}</span></div><h2>{option.name}</h2><p>{option.description}</p><footer><span>{option.integration}</span><button type="button" onClick={onToggle}>{selected ? "Added" : "Add to setup"}</button></footer></div></article>;
}