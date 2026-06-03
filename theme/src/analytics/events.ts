/*
 * Adobe Analytics – Event Tracking
 *
 * Tracks user interactions and pushes them to window.adobeDataLayer so that
 * Adobe Launch rules can map them to the correct Analytics events.
 *
 * Event mapping (SDR → data layer event name):
 *   event147  Ratings – Helpful           → cf-feedback-helpful
 *   event136  Ratings – Not Helpful       → cf-feedback-not-helpful
 *   event137  Comment – Helpful + text    → cf-feedback-helpful-comment
 *   event138  Comment – Not Helpful + text→ cf-feedback-not-helpful-comment
 *   prop6     Site Search Term            → cf-site-search
 */

// ---------------------------------------------------------------------------
// Selectors (from guides-components/components/pagefeedback)
// ---------------------------------------------------------------------------

var SEL_FEEDBACK      = '#page-feedback-component';
var SEL_YES_BTN       = '.cmp-page-feedback__btn--positive.yes-button';
var SEL_NO_BTN        = '.cmp-page-feedback__btn--negative.no-button';
var SEL_POS_FORM      = '#page-feedback-positive';
var SEL_NEG_FORM      = '#page-feedback-negative';
var SEL_SUBMIT_BTN    = '.cmp-page-feedback__btn--submit.submit-button';
var SEL_TEXTAREA      = '.cmp-page-feedback__suggestions-input';
var SEL_REASON_CB     = 'input[name="reason"]';
var SEL_SEARCH_INPUT  = '.cmp-search-bar__input';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

var CF_EV_LOG = '[CF Analytics]';

function pushAnalyticsEvent(name: string, data?: Record<string, any>): void {
  (window as any).adobeDataLayer = (window as any).adobeDataLayer || [];
  var payload: Record<string, any> = { event: name };
  if (data) {
    for (var k in data) {
      if (data.hasOwnProperty(k)) payload[k] = data[k];
    }
  }
  (window as any).adobeDataLayer.push(payload);
  console.log(CF_EV_LOG + ' %c' + name, 'color: #1473E6; font-weight: bold', data || '');
}

function collectFormData(form: Element): { reasons: string[]; comment: string } {
  var reasons: string[] = [];
  var checkboxes = form.querySelectorAll(SEL_REASON_CB) as NodeListOf<HTMLInputElement>;
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) reasons.push(checkboxes[i].value);
  }
  var textarea = form.querySelector(SEL_TEXTAREA) as HTMLTextAreaElement;
  var comment = textarea ? (textarea.value || '').trim() : '';
  return { reasons: reasons, comment: comment };
}

// ---------------------------------------------------------------------------
// Page Feedback tracking (event147 / event136 / event137 / event138)
// ---------------------------------------------------------------------------

function initFeedbackTracking(): void {
  var root = document.querySelector(SEL_FEEDBACK);
  if (!root) {
    console.log(CF_EV_LOG + ' Page feedback component not found — skipping feedback tracking');
    return;
  }
  console.log(CF_EV_LOG + ' Page feedback component found — attaching listeners');

  var yesBtn = root.querySelector(SEL_YES_BTN);
  var noBtn  = root.querySelector(SEL_NO_BTN);

  // event147 – "Yes, thanks"
  if (yesBtn) {
    yesBtn.addEventListener('click', function () {
      pushAnalyticsEvent('cf-feedback-helpful');
    });
  }

  // event136 – "Not really"
  if (noBtn) {
    noBtn.addEventListener('click', function () {
      pushAnalyticsEvent('cf-feedback-not-helpful');
    });
  }

  // event137 – Submit on the *positive* follow-up form (helpful + comment)
  var posForm = document.querySelector(SEL_POS_FORM);
  if (posForm) {
    var posSubmit = posForm.querySelector(SEL_SUBMIT_BTN);
    if (posSubmit) {
      posSubmit.addEventListener('click', function () {
        var fd = collectFormData(posForm as Element);
        pushAnalyticsEvent('cf-feedback-helpful-comment', { cfFeedback: fd });
      });
    }
  }

  // event138 – Submit on the *negative* follow-up form (not helpful + comment)
  var negForm = document.querySelector(SEL_NEG_FORM);
  if (negForm) {
    var negSubmit = negForm.querySelector(SEL_SUBMIT_BTN);
    if (negSubmit) {
      negSubmit.addEventListener('click', function () {
        var fd = collectFormData(negForm as Element);
        pushAnalyticsEvent('cf-feedback-not-helpful-comment', { cfFeedback: fd });
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Site Search tracking (prop6)
// ---------------------------------------------------------------------------

function initSearchTracking(): void {
  console.log(CF_EV_LOG + ' Search tracking initialised');
  document.addEventListener('keydown', function (e: KeyboardEvent) {
    if (e.key !== 'Enter') return;
    var target = e.target as HTMLElement;
    if (!target || !target.matches(SEL_SEARCH_INPUT)) return;
    var val = (target as HTMLInputElement).value;
    if (val && val.trim()) {
      pushAnalyticsEvent('cf-site-search', {
        cfSearch: { term: val.trim() }
      });
    }
  });

  document.addEventListener('click', function (e: MouseEvent) {
    var target = e.target as HTMLElement;
    if (!target) return;
    var btn = target.closest('.cmp-search-bar__submit');
    if (!btn) return;
    var container = btn.closest('.cmp-search-bar') || document;
    var input = container.querySelector(SEL_SEARCH_INPUT) as HTMLInputElement;
    if (input && input.value && input.value.trim()) {
      pushAnalyticsEvent('cf-site-search', {
        cfSearch: { term: input.value.trim() }
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

function initEventTracking(): void {
  initFeedbackTracking();
  initSearchTracking();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEventTracking);
} else {
  initEventTracking();
}
