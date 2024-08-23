/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/


var jQuery = require("jquery");

// Wrap bindings in anonymous namespace to prevent collisions
jQuery(function ($) {
    "use strict";

    function displayCurrentLanguage() {
        var CMP_SELECTOR = '.languagenavigation',
            CMP_PROCESSED = 'data-lang-nav-processed',
            ACTIVE_LINK_SELECTOR = '.cmp-languagenavigation__item--active > .cmp-languagenavigation__item-link',
            ACTIVE_COUNTRY_SELECTOR = '.cmp-languagenavigation__item--level-0.cmp-languagenavigation__item--active',
            langNavs = $(CMP_SELECTOR).not('[' + CMP_PROCESSED + '=\'true\']'),
            activeCountryImg,
            activeLanguage,
            toggleButton,
            displayBototm,
            displayLeft;

        //Top Level Navigation (expected to only be one of these)
        if (langNavs != undefined) {
            for (let i = 0; i < langNavs.length; i++) {
                const langNav = langNavs[i];

                $(langNav).attr(CMP_PROCESSED, true);
                activeLanguage = $(CMP_SELECTOR + ' ' + ACTIVE_LINK_SELECTOR).attr('lang');
                activeLanguage = activeLanguage !== undefined ? activeLanguage : 'Language';

                activeCountryImg = $(CMP_SELECTOR + ' ' + ACTIVE_COUNTRY_SELECTOR)
                    .css('background-image');
                activeCountryImg = activeCountryImg !== undefined ? activeCountryImg.replace("\"", "\'").replace("\"", "\'") : 'none';
                
                const id = `langNavToggleHeader${i}`
                toggleButton = `<div id="${id}" class="cmp-languagenavigation--langnavtoggle"> \
            <a  href="#langNavToggle" aria-label="Toggle Language">${activeLanguage}</a> \
            <img id="lang-chevron${i}" src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%231532AD" class="bi bi-chevron-down" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>'/> \
            </div>`;
                $(langNav).prepend(toggleButton);

                // attach toggle to change languages
                $(`#${id}`).click(function (event) {
                    const rect = this.getBoundingClientRect()
                    displayLeft = rect.x
                    displayBototm = rect.top + rect.height;
                    // displayLeft = $(this).position().left;
                    // displayBototm = $(this).position().top + 32;
                    console.log(displayBototm, displayLeft)
                    $(CMP_SELECTOR + ' .cmp-languagenavigation').css({ left: displayLeft });
                    $(CMP_SELECTOR + ' .cmp-languagenavigation').css({ top: displayBototm });
                    $(CMP_SELECTOR + ' .cmp-languagenavigation').toggleClass('showMenu');
                    $(`#${id}`).toggleClass('open');
                    event.stopPropagation()
                });

                //allow users to click anywhere to close language switcher
                window.onclick = function (event) {
                    console.log(event.target)
                    if (!(event.target.matches(`#${id}`) || event.target.matches('#lang-chevron')) && $(`#${id}`).hasClass('open')) {
                        $(CMP_SELECTOR + ' .cmp-languagenavigation').removeClass('showMenu');
                        console.log('removed')
                        $(`#${id}`).removeClass('open');
                    }
                }
            }
            //insert current lnaguage in header
        }
    }

    displayCurrentLanguage();
});
