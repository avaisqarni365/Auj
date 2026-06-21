/* @ds-bundle: {"format":3,"namespace":"ACCADesignSystem_710445","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Modal","sourcePath":"components/core/Modal.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"StatCard","sourcePath":"components/core/StatCard.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"Tabs","sourcePath":"components/core/Tabs.jsx"}],"sourceHashes":{"assets/icons.js":"34a9ce911452","components/core/Avatar.jsx":"5edfea589299","components/core/Badge.jsx":"a4e96ab3da27","components/core/Button.jsx":"fe7cee9a42ac","components/core/Card.jsx":"c736b788ec43","components/core/Input.jsx":"504b444a5e30","components/core/Modal.jsx":"eb1753e22253","components/core/Select.jsx":"5c7ca2ffd6ae","components/core/StatCard.jsx":"41bd04c7a38e","components/core/Switch.jsx":"12f96892da54","components/core/Tabs.jsx":"3e62e49592d1","ui_kits/platform/App.jsx":"3b8a93e0fc97","ui_kits/platform/DashboardScreen.jsx":"07ef2a82e59e","ui_kits/platform/InvoicesScreen.jsx":"0075c5f86202","ui_kits/platform/LoginScreen.jsx":"a43aaa92ebd3","ui_kits/platform/Shell.jsx":"14d5997bc2e2"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ACCADesignSystem_710445 = window.ACCADesignSystem_710445 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/icons.js
try { (() => {
/**
 * ACCA icon set — the platform's custom outline icons, lifted verbatim
 * from the production app (apps/web-platform/.../nav-icons.tsx).
 *
 * Style: 20×20 viewBox · stroke="currentColor" · 1.5 stroke ·
 * round caps/joins · no fills. Color via `color:` on the parent.
 *
 * Usage (vanilla):
 *   el.innerHTML = accaIcon('invoice');                  // 18px default
 *   el.innerHTML = accaIcon('banking', 20);
 * Usage (React):
 *   <span dangerouslySetInnerHTML={{__html: accaIcon('vat')}} />
 *
 * Marketing/landing surfaces additionally use emoji for the 14 industry
 * profiles (🚕 🍽️ 🏨 …) and AI-pipeline steps — see readme ICONOGRAPHY.
 */
const ACCA_ICON_PATHS = {
  dashboard: '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/>',
  invoice: '<path d="M6 2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M7 7h6M7 10h6M7 13h3"/>',
  agent: '<circle cx="10" cy="8" r="4"/><path d="M6 16c0-2.2 1.8-4 4-4s4 1.8 4 4"/><path d="M14 4l2 2M4 4l2 2"/>',
  debtor: '<circle cx="10" cy="7" r="3"/><path d="M5 17c0-2.8 2.2-5 5-5s5 2.2 5 5"/>',
  kreditor: '<rect x="3" y="5" width="14" height="10" rx="2"/><path d="M3 9h14"/>',
  expense: '<circle cx="10" cy="10" r="7"/><path d="M10 6v8M7.5 8.5h5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5h-5"/>',
  banking: '<path d="M3 17h14M4 7h12M5 7v7M9 7v7M11 7v7M15 7v7M3 7l7-4 7 4"/>',
  openItems: '<rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 7h6M7 10h6M7 13h3"/>',
  vat: '<path d="M5 15l10-10M6 5a1 1 0 100 2 1 1 0 000-2zM14 13a1 1 0 100 2 1 1 0 000-2z"/>',
  check: '<circle cx="10" cy="10" r="7"/><path d="M7 10l2 2 4-4"/>',
  send: '<path d="M4 4l12 6-12 6V4z"/>',
  folder: '<path d="M3 5a2 2 0 012-2h3l2 2h5a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>',
  chart: '<path d="M3 17V7M8 17V3M13 17v-7M18 17V9"/>',
  closing: '<rect x="3" y="3" width="14" height="14" rx="2"/><path d="M3 8h14M7 3v5M13 3v5M7 12l2 2 4-4"/>',
  collab: '<circle cx="7" cy="8" r="2.5"/><circle cx="13" cy="8" r="2.5"/><path d="M3 17c0-2.2 1.8-4 4-4M13 13c2.2 0 4 1.8 4 4"/>',
  ai: '<path d="M10 2l2 4 4 .5-3 3 .5 4.5L10 12l-3.5 2 .5-4.5-3-3L8 6l2-4z"/>',
  datev: '<path d="M4 4h5a5 5 0 010 10H4V4z"/><path d="M13 4h3M13 10h3M13 16h3"/>',
  team: '<circle cx="7" cy="6" r="2.5"/><circle cx="13" cy="6" r="2.5"/><path d="M2 17c0-2.8 2.2-5 5-5s5 2.2 5 5M10 17c0-2.8 2.2-5 5-5s3 2.2 3 5"/>',
  monitor: '<path d="M3 8l3 3 4-6 3 4 4-3"/><rect x="2" y="3" width="16" height="12" rx="2"/><path d="M8 17h4"/>',
  settings: '<circle cx="10" cy="10" r="2.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"/>',
  bell: '<path d="M10 2a5 5 0 015 5c0 5 2 7 2 7H3s2-2 2-7a5 5 0 015-5zM8.5 16a1.5 1.5 0 003 0"/>',
  logout: '<path d="M13 3h2a2 2 0 012 2v10a2 2 0 01-2 2h-2M8 15l-5-5 5-5M3 10h10"/>',
  menu: '<path d="M3 5h14M3 10h14M3 15h14"/>',
  close: '<path d="M5 5l10 10M15 5L5 15"/>',
  integration: '<circle cx="10" cy="10" r="2"/><path d="M10 2v4M10 14v4M2 10h4M14 10h4"/>',
  recurring: '<path d="M4 10a6 6 0 0110-4l2 2M16 10a6 6 0 01-10 4l-2-2"/><path d="M14 4v4h4M6 16v-4H2"/>',
  layout: '<rect x="3" y="3" width="14" height="14" rx="2"/><path d="M3 8h14M8 8v9"/>',
  chat: '<path d="M7 3h7a3 3 0 013 3v4a3 3 0 01-3 3h-1"/><path d="M13 17l-2-3H6a3 3 0 01-3-3V8a3 3 0 013-3h7a3 3 0 013 3v3a3 3 0 01-3 3H8"/>',
  search: '<circle cx="8.5" cy="8.5" r="5"/><path d="M12.5 12.5l4 4"/>',
  plus: '<path d="M10 4v12M4 10h12"/>',
  chevronDown: '<path d="M5 8l5 5 5-5"/>',
  chevronRight: '<path d="M8 5l5 5-5 5"/>'
};
function accaIcon(name, size = 18) {
  const inner = ACCA_ICON_PATHS[name];
  if (!inner) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
if (typeof module !== 'undefined') module.exports = {
  ACCA_ICON_PATHS,
  accaIcon
};
if (typeof window !== 'undefined') {
  window.ACCA_ICON_PATHS = ACCA_ICON_PATHS;
  window.accaIcon = accaIcon;
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/icons.js", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PALETTE = [['var(--accent-100)', 'var(--accent-700)'], ['var(--success-100)', 'var(--success-700)'], ['var(--warning-100)', 'var(--warning-700)'], ['var(--info-100)', 'var(--info-700)'], ['var(--sand-200)', 'var(--sand-700)'], ['var(--accent-200)', 'var(--accent-800)']];
function initials(name) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}
function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

/**
 * ACCA Avatar — circular user/org token. Renders an image when `src`
 * is given, otherwise deterministic initials on a warm tint.
 */
function Avatar({
  name = '',
  src = '',
  size = 'md',
  className = '',
  ...props
}) {
  const cls = ['acca-avatar', `acca-avatar--${size}`, className].filter(Boolean).join(' ');
  if (src) {
    return /*#__PURE__*/React.createElement("span", _extends({
      className: cls
    }, props), /*#__PURE__*/React.createElement("img", {
      src: src,
      alt: name
    }));
  }
  const [bg, fg] = colorFor(name || '?');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    style: {
      background: bg,
      color: fg
    },
    title: name
  }, props), initials(name || '?'));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ACCA Badge — compact status / category label with a subtle inset ring.
 * Optional leading dot for live-status semantics.
 */
function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  const cls = ['acca-badge', `acca-badge--${variant}`, `acca-badge--${size}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, props), dot && /*#__PURE__*/React.createElement("span", {
    className: "acca-badge__dot"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ACCA Button — the primary action control.
 * Class-based styling (see components.css) so hover/active/focus
 * states are native. Token-driven; no Tailwind, no CSS-in-JS.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  disabled = false,
  className = '',
  ...props
}) {
  const cls = ['acca-btn', `acca-btn--${variant}`, `acca-btn--${size}`, fullWidth ? 'acca-btn--block' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    disabled: disabled || loading
  }, props), loading && /*#__PURE__*/React.createElement("svg", {
    className: "acca-btn__spinner",
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    stroke: "currentColor",
    strokeWidth: "4",
    opacity: "0.25"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 12a8 8 0 018-8",
    stroke: "currentColor",
    strokeWidth: "4",
    strokeLinecap: "round"
  })), !loading && icon && iconPosition === 'left' && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex'
    }
  }, icon), children != null && /*#__PURE__*/React.createElement("span", null, children), !loading && icon && iconPosition === 'right' && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex'
    }
  }, icon));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAD = {
  none: '0',
  sm: '12px 16px',
  md: '16px 20px',
  lg: '20px 24px'
};

/**
 * ACCA Card — content surface with an optional header (icon/title/subtitle
 * + actions) and footer. The default app card: white, 1px sand border,
 * 14px radius.
 */
function Card({
  children,
  title,
  subtitle,
  icon = null,
  actions = null,
  footer = null,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) {
  const pad = PAD[padding];
  const hasHeader = title || subtitle || actions || icon;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['acca-card-cmp', `acca-card-cmp--${variant}`, className].filter(Boolean).join(' ')
  }, props), hasHeader && /*#__PURE__*/React.createElement("div", {
    className: "acca-card-cmp__header",
    style: {
      padding: pad,
      borderBottom: children ? '1px solid var(--sand-200)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sand-600)',
      display: 'flex',
      marginTop: '2px'
    }
  }, icon), /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("h3", {
    className: "acca-card-cmp__title"
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    className: "acca-card-cmp__subtitle"
  }, subtitle))), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexShrink: 0,
      marginLeft: '16px'
    }
  }, actions)), children && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pad
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pad,
      borderTop: '1px solid var(--sand-200)',
      background: 'var(--sand-50)',
      borderRadius: '0 0 var(--radius-xl) var(--radius-xl)'
    }
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ACCA Input — labelled text field with optional leading icon,
 * helper text and error state.
 */
function Input({
  label,
  error,
  helperText,
  icon = null,
  id,
  required,
  className = '',
  ...props
}) {
  const inputId = id || (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const inputCls = ['acca-input', icon ? 'acca-input--has-icon' : '', error ? 'acca-input--error' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    className: "acca-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "acca-field__label",
    htmlFor: inputId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "acca-field__req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "acca-field__wrap"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "acca-field__icon"
  }, icon), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    className: inputCls,
    required: required
  }, props))), error ? /*#__PURE__*/React.createElement("p", {
    className: "acca-field__error"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M8 15A7 7 0 108 1a7 7 0 000 14zm.75-9.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5zM8 11a1 1 0 100-2 1 1 0 000 2z"
  })), error) : helperText ? /*#__PURE__*/React.createElement("p", {
    className: "acca-field__help"
  }, helperText) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Modal.jsx
try { (() => {
/**
 * ACCA Modal — centered dialog over a blurred sand scrim. Closes on
 * overlay click (optional) and Escape; locks body scroll while open.
 */
function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer = null,
  size = 'md',
  closeOnOverlay = true
}) {
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = e => {
      if (e.key === 'Escape') onClose && onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "acca-modal-overlay"
  }, /*#__PURE__*/React.createElement("div", {
    className: "acca-modal-overlay__bg animate-fade-in",
    onClick: closeOnOverlay ? onClose : undefined
  }), /*#__PURE__*/React.createElement("div", {
    className: ['acca-modal', `acca-modal--${size}`, 'animate-slide-up'].join(' '),
    role: "dialog",
    "aria-modal": "true"
  }, (title || description) && /*#__PURE__*/React.createElement("div", {
    className: "acca-modal__header"
  }, /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("h2", {
    className: "acca-modal__title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "acca-modal__desc"
  }, description)), /*#__PURE__*/React.createElement("button", {
    className: "acca-modal__close",
    onClick: onClose,
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "acca-modal__body scrollbar-thin"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "acca-modal__footer"
  }, footer)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Modal.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ACCA Select — native select styled to match Input, with a custom
 * chevron, label, helper and error states.
 */
function Select({
  label,
  error,
  helperText,
  options = [],
  placeholder,
  id,
  required,
  className = '',
  ...props
}) {
  const selId = id || (label ? `sel-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    className: "acca-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "acca-field__label",
    htmlFor: selId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "acca-field__req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "acca-field__wrap"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selId,
    className: ['acca-select', className].filter(Boolean).join(' '),
    required: required,
    defaultValue: placeholder ? '' : undefined
  }, props), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value,
    disabled: o.disabled
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    className: "acca-field__chevron"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z"
  })))), error ? /*#__PURE__*/React.createElement("p", {
    className: "acca-field__error"
  }, error) : helperText ? /*#__PURE__*/React.createElement("p", {
    className: "acca-field__help"
  }, helperText) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ARROW = {
  up: 'M3 9.5L7 5.5l3 3 5-5',
  warning: null,
  down: 'M3 5.5L7 9.5l3-3 5 5',
  neutral: null
};

/**
 * ACCA StatCard — KPI tile used across dashboards. Big tabular value
 * with a small trend/change line underneath.
 */
function StatCard({
  label,
  value,
  change,
  trend = 'neutral',
  className = '',
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['acca-stat', className].filter(Boolean).join(' ')
  }, props), /*#__PURE__*/React.createElement("div", {
    className: "acca-stat__label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "acca-stat__value"
  }, value), change != null && /*#__PURE__*/React.createElement("div", {
    className: `acca-stat__change acca-stat__change--${trend}`
  }, trend === 'up' && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 17 15",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 9.5L7 5.5l3 3 5-5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 3.5v3h-3"
  })), trend === 'down' && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 17 15",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 5.5L7 9.5l3-3 5 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 11.5v-3h-3"
  })), trend === 'warning' && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 16 16",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 1.5l6.5 11.5h-13L8 1.5zM8 6v3.5M8 11.2v.05",
    stroke: "currentColor",
    strokeWidth: "1.3",
    fill: "none",
    strokeLinecap: "round"
  })), change));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
/**
 * ACCA Switch — accessible on/off toggle. Accent track when on.
 * Optional label + description on the right.
 */
function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md'
}) {
  const trackCls = ['acca-switch__track', `acca-switch__track--${size}`, checked ? 'acca-switch__track--on' : ''].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("label", {
    className: ['acca-switch', disabled ? 'acca-switch--disabled' : ''].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: () => !disabled && onChange && onChange(!checked),
    className: trackCls
  }, /*#__PURE__*/React.createElement("span", {
    className: "acca-switch__thumb"
  })), (label || description) && /*#__PURE__*/React.createElement("span", null, label && /*#__PURE__*/React.createElement("span", {
    className: "acca-switch__label"
  }, label), description && /*#__PURE__*/React.createElement("span", {
    className: "acca-switch__desc"
  }, description)));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/core/Tabs.jsx
try { (() => {
/**
 * ACCA Tabs — segmented navigation. `underline` (default) for page-level
 * section switching; `pills` for compact in-card filters.
 */
function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline',
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['acca-tabs', `acca-tabs--${variant}`, className].filter(Boolean).join(' ')
  }, tabs.map(tab => {
    const active = tab.id === activeTab;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.id,
      type: "button",
      className: ['acca-tab', active ? 'acca-tab--active' : ''].filter(Boolean).join(' '),
      onClick: () => onChange && onChange(tab.id)
    }, tab.icon && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex'
      }
    }, tab.icon), tab.label, tab.count != null && /*#__PURE__*/React.createElement("span", {
      className: "acca-tab__count"
    }, tab.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/App.jsx
try { (() => {
/* global React */
// ACCA Platform — interactive demo: login → app shell with screen switching.
(function () {
  const TITLES = {
    dashboard: 'Dashboard',
    invoices: 'Rechnungen'
  };
  function App() {
    const [authed, setAuthed] = React.useState(false);
    const [screen, setScreen] = React.useState('dashboard');
    if (!authed) return /*#__PURE__*/React.createElement(window.LoginScreen, {
      onLogin: () => setAuthed(true)
    });
    let body;
    if (screen === 'invoices') body = /*#__PURE__*/React.createElement(window.InvoicesScreen, null);else body = /*#__PURE__*/React.createElement(window.DashboardScreen, null);
    return /*#__PURE__*/React.createElement(window.Shell, {
      active: screen,
      onNav: id => {
        if (id === 'invoices' || id === 'dashboard') setScreen(id);
      },
      title: TITLES[screen] || 'Dashboard'
    }, body);
  }
  window.ACCAApp = App;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/DashboardScreen.jsx
try { (() => {
/* global React */
// ACCA Platform — Business dashboard screen.
(function () {
  const {
    StatCard,
    Card,
    Button,
    Badge
  } = window.ACCADesignSystem_710445;
  function ActivityRow({
    dot,
    title,
    sub,
    amount,
    tone
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: dot,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        color: 'var(--text-primary)'
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-tertiary)'
      }
    }, sub)), amount && /*#__PURE__*/React.createElement("span", {
      className: "tabular",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        color: tone || 'var(--text-primary)'
      }
    }, amount));
  }
  function QuickAction({
    label,
    desc
  }) {
    const [h, setH] = React.useState(false);
    return /*#__PURE__*/React.createElement("a", {
      onMouseEnter: () => setH(true),
      onMouseLeave: () => setH(false),
      style: {
        display: 'block',
        padding: '12px 14px',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        border: '1px solid ' + (h ? 'var(--accent-300)' : 'var(--border-secondary)'),
        background: 'var(--surface-card)',
        transition: 'border-color .15s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        color: h ? 'var(--accent-700)' : 'var(--text-primary)'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-tertiary)',
        marginTop: 2
      }
    }, desc));
  }
  function DashboardScreen() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 'var(--radius-2xl)',
        padding: '22px 24px',
        color: '#fff',
        background: 'linear-gradient(135deg, var(--accent-600), var(--accent-500) 55%, #e8a23f)',
        boxShadow: 'var(--shadow-elevated)'
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 'var(--text-2xl)',
        fontWeight: 700,
        color: '#fff',
        letterSpacing: 'var(--tracking-tight)'
      }
    }, "Guten Morgen, Jawad"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4
      }
    }, "Enviree Services GmbH \xB7 GmbH \xB7 IT & Consulting \xB7 SKR03")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Offene Rechnungen",
      value: "12",
      change: "3 \xFCberf\xE4llig",
      trend: "warning"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Au\xDFenstand",
      value: "\u20AC 48.250,00",
      change: "14 Debitoren",
      trend: "neutral"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Konten",
      value: "117",
      change: "SKR03 Kontenrahmen",
      trend: "neutral"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Nicht abgeglichen",
      value: "6",
      change: "6 Posten offen",
      trend: "warning"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 16px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--warning-50)',
        border: '1px solid var(--warning-200)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        color: 'var(--warning-700)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex'
      },
      dangerouslySetInnerHTML: {
        __html: window.accaIcon('invoice', 15)
      }
    }), "3 Rechnungsentw\xFCrfe ausstehend \xB7 \u20AC 8.940,00"), /*#__PURE__*/React.createElement("a", {
      style: {
        fontSize: 'var(--text-2xs)',
        fontWeight: 700,
        color: 'var(--warning-700)',
        textDecoration: 'underline',
        cursor: 'pointer'
      }
    }, "pr\xFCfen \u2192")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 16,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement(Card, {
      title: "Letzte Aktivit\xE4t",
      actions: /*#__PURE__*/React.createElement("a", {
        style: {
          fontSize: 'var(--text-xs)',
          fontWeight: 500,
          color: 'var(--accent-600)',
          cursor: 'pointer'
        }
      }, "Alle Rechnungen"),
      padding: "none"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column'
      },
      className: "acca-divided"
    }, [['var(--accent-500)', 'RE-2026-00148 erstellt', 'Berliner Gastro GmbH · fällig 30.06.', '€ 4.200,00', null], ['var(--success-500)', 'Zahlung verbucht', 'Müller Transport GmbH · SEPA', '+ € 2.380,00', 'var(--success-600)'], ['var(--info-500)', 'DATEV-Export erstellt', 'Mai 2026 · 248 Buchungen', null, null], ['var(--warning-500)', '2 überfällige Rechnungen', 'Offene Posten prüfen', null, null]].map((r, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        borderTop: i ? '1px solid var(--sand-100)' : 'none'
      }
    }, /*#__PURE__*/React.createElement(ActivityRow, {
      dot: r[0],
      title: r[1],
      sub: r[2],
      amount: r[3],
      tone: r[4]
    }))))), /*#__PURE__*/React.createElement(Card, {
      title: "Schnellzugriff",
      padding: "md"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(QuickAction, {
      label: "Neue Rechnung",
      desc: "Ausgangsrechnung erstellen"
    }), /*#__PURE__*/React.createElement(QuickAction, {
      label: "Invoice Agent",
      desc: "KI-gest\xFCtzte Verarbeitung"
    }), /*#__PURE__*/React.createElement(QuickAction, {
      label: "Bericht erzeugen",
      desc: "BWA, SuSa, GuV, Bilanz"
    }), /*#__PURE__*/React.createElement(QuickAction, {
      label: "Bankabgleich",
      desc: "Transaktionen zuordnen"
    })))));
  }
  window.DashboardScreen = DashboardScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/InvoicesScreen.jsx
try { (() => {
/* global React */
// ACCA Platform — Invoices list screen (AR/AP, MonthTimeline, table).
(function () {
  const {
    Card,
    Button,
    Badge,
    Tabs,
    Input
  } = window.ACCADesignSystem_710445;
  const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  const COUNTS = [4, 6, 3, 8, 12, 7, 0, 0, 0, 0, 0, 0];
  const ROWS = [['RE-2026-00148', 'Berliner Gastro GmbH', '12.06.2026', '4.200,00', 'open', 'posted'], ['RE-2026-00147', 'Müller Transport GmbH', '10.06.2026', '2.380,00', 'paid', 'posted'], ['RE-2026-00146', 'Modehaus Klein e.K.', '08.06.2026', '1.190,00', 'overdue', 'posted'], ['RE-2026-00145', 'Braun Consulting GmbH', '05.06.2026', '6.540,00', 'draft', 'unposted'], ['RE-2026-00144', 'Gasthaus zum Adler GmbH', '03.06.2026', '845,50', 'sent', 'posted'], ['RE-2026-00143', 'Berliner Taxi Union GmbH', '01.06.2026', '3.120,00', 'paid', 'posted']];
  const STATUS = {
    open: ['warning', 'Offen'],
    paid: ['success', 'Bezahlt'],
    overdue: ['error', 'Überfällig'],
    draft: ['default', 'Entwurf'],
    sent: ['info', 'Gesendet']
  };
  function InvoicesScreen() {
    const [tab, setTab] = React.useState('ar');
    const [month, setMonth] = React.useState(5);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 'var(--text-2xl)',
        fontWeight: 700,
        letterSpacing: 'var(--tracking-tight)'
      }
    }, "Rechnungen"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        marginTop: 2
      }
    }, "Ausgangs- & Eingangsrechnungen \xB7 GoBD-konform")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      icon: /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'flex'
        },
        dangerouslySetInnerHTML: {
          __html: window.accaIcon('datev', 16)
        }
      })
    }, "DATEV-Export"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'flex'
        },
        dangerouslySetInnerHTML: {
          __html: window.accaIcon('plus', 16)
        }
      })
    }, "Neue Rechnung"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 12
      }
    }, [['Gesamt', '€ 18.275,50', '40 Rechnungen'], ['Bezahlt', '€ 9.620,00', '24'], ['Offen', '€ 7.420,00', '14'], ['Überfällig', '€ 1.235,50', '2']].map((k, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "acca-card",
      style: {
        padding: '14px 16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-tertiary)'
      }
    }, k[0]), /*#__PURE__*/React.createElement("div", {
      className: "tabular",
      style: {
        fontSize: 'var(--text-lg)',
        fontWeight: 700,
        marginTop: 3,
        fontFamily: 'var(--font-mono)'
      }
    }, k[1]), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-tertiary)',
        marginTop: 2
      }
    }, k[2])))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, MONTHS.map((m, i) => {
      const active = i === month;
      const empty = COUNTS[i] === 0;
      return /*#__PURE__*/React.createElement("button", {
        key: m,
        onClick: () => setMonth(i),
        style: {
          flex: 1,
          padding: '8px 0',
          borderRadius: 'var(--radius-lg)',
          cursor: 'pointer',
          border: '1px solid ' + (active ? 'var(--accent-600)' : 'var(--border-secondary)'),
          background: active ? 'var(--accent-600)' : 'var(--surface-card)',
          transform: active ? 'scale(1.04)' : 'none',
          transition: 'all .15s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          opacity: empty ? 0.5 : 1
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: active ? '#fff' : 'var(--text-secondary)'
        }
      }, m), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9,
          fontWeight: 600,
          color: active ? 'rgba(255,255,255,0.85)' : 'var(--text-tertiary)'
        }
      }, COUNTS[i] || '—'));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      variant: "pills",
      activeTab: tab,
      onChange: setTab,
      tabs: [{
        id: 'ar',
        label: 'Ausgang (AR)'
      }, {
        id: 'ap',
        label: 'Eingang (AP)'
      }, {
        id: 'all',
        label: 'Alle'
      }]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 240
      }
    }, /*#__PURE__*/React.createElement(Input, {
      icon: /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'flex'
        },
        dangerouslySetInnerHTML: {
          __html: window.accaIcon('search', 16)
        }
      }),
      placeholder: "Rechnung suchen\u2026"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "acca-card",
      style: {
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 'var(--text-sm)'
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        background: 'var(--surface-sunken)',
        textAlign: 'left'
      }
    }, ['Nummer', 'Debitor', 'Datum', 'Betrag', 'Status', 'Buchung', ''].map((h, i) => /*#__PURE__*/React.createElement("th", {
      key: i,
      style: {
        padding: '10px 16px',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        textAlign: i === 3 ? 'right' : 'left',
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase'
      }
    }, h)))), /*#__PURE__*/React.createElement("tbody", null, ROWS.map((r, i) => {
      const [sv, sl] = STATUS[r[4]];
      return /*#__PURE__*/React.createElement("tr", {
        key: i,
        style: {
          borderTop: '1px solid var(--sand-100)'
        }
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '12px 16px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color: 'var(--accent-700)'
        }
      }, r[0]), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '12px 16px',
          color: 'var(--text-primary)'
        }
      }, r[1]), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '12px 16px',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)'
        }
      }, r[2]), /*#__PURE__*/React.createElement("td", {
        className: "tabular",
        style: {
          padding: '12px 16px',
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600
        }
      }, "\u20AC ", r[3]), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '12px 16px'
        }
      }, /*#__PURE__*/React.createElement(Badge, {
        variant: sv,
        dot: true
      }, sl)), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '12px 16px'
        }
      }, r[5] === 'posted' ? /*#__PURE__*/React.createElement(Badge, {
        variant: "success"
      }, "\u2713 Posted") : /*#__PURE__*/React.createElement(Badge, {
        variant: "warning"
      }, "Unposted")), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '12px 16px',
          textAlign: 'right'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-tertiary)',
          display: 'inline-flex',
          cursor: 'pointer'
        },
        dangerouslySetInnerHTML: {
          __html: window.accaIcon('chevronRight', 16)
        }
      })));
    })))));
  }
  window.InvoicesScreen = InvoicesScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/InvoicesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/LoginScreen.jsx
try { (() => {
/* global React */
// ACCA Platform — Login screen (two-column: form + demo accounts).
(function () {
  const {
    Button,
    Input,
    Badge
  } = window.ACCADesignSystem_710445;
  const DEMO = [['Business Owner', 'jawad@enviree.de', 'blue'], ['Tax Adviser', 'owner@schmidt-stb.de', 'purple'], ['Bookkeeper', 'bk@buchwerk.de', 'teal'], ['Platform Admin', 'admin@acca.de', 'red']];
  const TONE = {
    blue: ['var(--info-50)', 'var(--info-700)'],
    purple: ['#f3effa', '#6d4ca8'],
    teal: ['var(--success-50)', 'var(--success-700)'],
    red: ['var(--error-50)', 'var(--error-700)']
  };
  function LoginScreen({
    onLogin
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100%',
        background: 'var(--surface-card)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 56px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 32
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--accent-600)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-soft)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#fff',
        fontWeight: 700,
        fontSize: 17
      }
    }, "A")), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 'var(--text-lg)',
        letterSpacing: 'var(--tracking-tight)'
      }
    }, "ACCA")), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        letterSpacing: 'var(--tracking-tight)'
      }
    }, "Willkommen zur\xFCck"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        marginTop: 6,
        marginBottom: 28
      }
    }, "Melden Sie sich bei Ihrem ACCA-Konto an."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 380
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "E-Mail",
      type: "email",
      defaultValue: "jawad@enviree.de"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Passwort",
      type: "password",
      defaultValue: "Demo2024"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 'var(--text-sm)'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        color: 'var(--text-secondary)',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      defaultChecked: true,
      style: {
        accentColor: 'var(--accent-600)',
        width: 15,
        height: 15
      }
    }), " Angemeldet bleiben"), /*#__PURE__*/React.createElement("a", {
      style: {
        color: 'var(--accent-700)',
        fontWeight: 500,
        cursor: 'pointer'
      }
    }, "Passwort vergessen?")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      fullWidth: true,
      onClick: onLogin
    }, "Anmelden"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-tertiary)',
        textAlign: 'center'
      }
    }, "Noch kein Konto? ", /*#__PURE__*/React.createElement("a", {
      style: {
        color: 'var(--accent-700)',
        fontWeight: 500,
        cursor: 'pointer'
      }
    }, "Kostenlos starten")))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'linear-gradient(160deg, var(--accent-50), var(--surface-sunken))',
        borderLeft: '1px solid var(--border-secondary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 48px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "primary",
      dot: true
    }, "Live-Demo")), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 'var(--text-xl)',
        fontWeight: 700,
        letterSpacing: 'var(--tracking-tight)'
      }
    }, "Demo-Konten"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        marginTop: 6,
        marginBottom: 18,
        maxWidth: 340
      }
    }, "Tippen Sie auf ein Konto, um es als verschiedene Rollen auszuprobieren. Passwort ", /*#__PURE__*/React.createElement("code", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        background: 'var(--surface-raised)',
        padding: '1px 5px',
        borderRadius: 4
      }
    }, "Demo@2024"), "."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, DEMO.map(([role, email, tone]) => {
      const [bg, fg] = TONE[tone];
      return /*#__PURE__*/React.createElement("a", {
        key: email,
        onClick: onLogin,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 14px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-secondary)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-soft)'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 34,
          height: 34,
          borderRadius: 'var(--radius-lg)',
          background: bg,
          color: fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 'var(--text-sm)'
        }
      }, role[0]), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          lineHeight: 1.25
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 'var(--text-sm)',
          fontWeight: 600
        }
      }, role), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)'
        }
      }, email)), /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-tertiary)',
          display: 'flex'
        },
        dangerouslySetInnerHTML: {
          __html: window.accaIcon('chevronRight', 16)
        }
      }));
    }))));
  }
  window.LoginScreen = LoginScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/Shell.jsx
try { (() => {
/* global React */
// ACCA Platform — sidebar + topbar shell. Assigns Shell to window.
(function () {
  const {
    Avatar,
    Badge
  } = window.ACCADesignSystem_710445;
  const I = (n, s) => /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex'
    },
    dangerouslySetInnerHTML: {
      __html: window.accaIcon(n, s || 18)
    }
  });
  const NAV = [{
    label: 'Overview',
    items: [['dashboard', 'Dashboard', 'dashboard']]
  }, {
    label: 'Invoicing',
    items: [['invoice', 'All Invoices', 'invoices'], ['folder', 'Belegeingang', 'inbox'], ['invoice', 'Invoice Hub', 'hub']]
  }, {
    label: 'Contacts',
    items: [['team', 'Company Directory', 'dir'], ['debtor', 'Debtors', 'debtors'], ['kreditor', 'Kreditors', 'kreditors'], ['openItems', 'Open Items', 'open']]
  }, {
    label: 'Finance',
    items: [['openItems', 'Journal Entry', 'journal'], ['chart', 'General Ledger', 'ledger'], ['expense', 'Cash Book', 'cash'], ['banking', 'Banking', 'banking']]
  }, {
    label: 'Tax & VAT',
    items: [['vat', 'VAT Overview', 'vat'], ['vat', 'VAT Returns', 'returns'], ['send', 'Submissions', 'subs']]
  }, {
    label: 'Reports',
    items: [['chart', 'Reports', 'reports'], ['closing', 'Month-End', 'closing'], ['monitor', 'Audit Log', 'audit']]
  }];
  function NavItem({
    icon,
    label,
    active,
    onClick
  }) {
    const [hover, setHover] = React.useState(false);
    const bg = active ? 'var(--surface-active)' : hover ? 'var(--surface-raised)' : 'transparent';
    return /*#__PURE__*/React.createElement("a", {
      onClick: onClick,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 10px',
        borderRadius: 'var(--radius-lg)',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: bg,
        lineHeight: 1.2
      }
    }, icon, label);
  }
  function Shell({
    active,
    onNav,
    title,
    subtitle,
    headerAccent,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: '100%',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-sans)'
      }
    }, /*#__PURE__*/React.createElement("aside", {
      className: "scrollbar-thin",
      style: {
        width: 248,
        flexShrink: 0,
        background: 'var(--surface-sidebar)',
        borderRight: '1px solid var(--border-secondary)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '16px 16px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--accent-600)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-soft)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#fff',
        fontWeight: 700,
        fontSize: 15
      }
    }, "A")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        lineHeight: 1.05
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: 'var(--sand-900)',
        letterSpacing: 'var(--tracking-tight)'
      }
    }, "ACCA"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        color: 'var(--text-tertiary)'
      }
    }, "by Enviree UG"))), /*#__PURE__*/React.createElement("nav", {
      style: {
        padding: '4px 10px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, NAV.map(sec => /*#__PURE__*/React.createElement("div", {
      key: sec.label
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--text-2xs)',
        fontWeight: 600,
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color: 'var(--text-tertiary)',
        padding: '0 10px 6px'
      }
    }, sec.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }
    }, sec.items.map(([ic, lb, id]) => /*#__PURE__*/React.createElement(NavItem, {
      key: id,
      icon: I(ic),
      label: lb,
      active: active === id,
      onClick: () => onNav && onNav(id)
    })))))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'auto',
        borderTop: '1px solid var(--border-secondary)',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "Jawad Khan",
      size: "sm"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        lineHeight: 1.2,
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, "Jawad Khan"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: 'var(--text-tertiary)'
      }
    }, "Enviree Services GmbH")), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-tertiary)',
        display: 'flex'
      },
      dangerouslySetInnerHTML: {
        __html: window.accaIcon('logout', 16)
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("header", {
      style: {
        height: 56,
        flexShrink: 0,
        borderBottom: '1px solid var(--border-secondary)',
        background: 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 'var(--text-md)',
        fontWeight: 600
      }
    }, title)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 34,
        padding: '0 12px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        background: 'var(--surface-page)',
        width: 260,
        color: 'var(--text-tertiary)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex'
      },
      dangerouslySetInnerHTML: {
        __html: window.accaIcon('search', 16)
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--text-sm)'
      }
    }, "Suchen\u2026")), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-secondary)',
        display: 'flex',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("span", {
      dangerouslySetInnerHTML: {
        __html: window.accaIcon('bell', 20)
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: 'var(--accent-600)',
        border: '1.5px solid var(--surface-card)'
      }
    })), /*#__PURE__*/React.createElement(Avatar, {
      name: "Jawad Khan",
      size: "sm"
    })), /*#__PURE__*/React.createElement("main", {
      className: "scrollbar-thin",
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: 24
      }
    }, children)));
  }
  window.Shell = Shell;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/Shell.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
