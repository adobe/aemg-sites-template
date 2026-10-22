/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

var jQuery = require("jquery");

jQuery(function ($: any) {
    const $container = $("#share-this-page");
    if (!$container.length) return;

    const pageUrl = window.location.href;
    const pageTitle = document.title;

    const $facebook = $container.find("#share-facebook");
    const $x = $container.find("#share-x");
    const $linkedin = $container.find("#share-linkedin");
    const $copylink = $container.find("#share-copylink");

    $facebook.on("click", function () {
        window.open(
            "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(pageUrl),
            "_blank",
            "noopener,noreferrer,width=600,height=400"
        );
    });

    $x.on("click", function () {
        window.open(
            "https://twitter.com/intent/tweet?url=" + encodeURIComponent(pageUrl) + "&text=" + encodeURIComponent(pageTitle),
            "_blank",
            "noopener,noreferrer,width=600,height=400"
        );
    });

    $linkedin.on("click", function () {
        window.open(
            "https://www.linkedin.com/shareArticle?mini=true&url=" + encodeURIComponent(pageUrl) + "&title=" + encodeURIComponent(pageTitle),
            "_blank",
            "noopener,noreferrer,width=600,height=400"
        );
    });

    const $tooltip = $('<span class="share-copied-tooltip">Copied!</span>');
    $copylink.append($tooltip);

    $copylink.on("click", function () {
        const url = window.location.href;

        function showCopied() {
            $copylink.addClass("copied");
            $tooltip.addClass("visible");
            setTimeout(function () {
                $tooltip.removeClass("visible");
                $copylink.removeClass("copied");
            }, 1500);
        }

        function fallbackCopy(text: string) {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.setAttribute("readonly", "");
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            textarea.style.top = "-9999px";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, text.length);
            try {
                var ok = document.execCommand("copy");
                if (ok) { showCopied(); }
            } catch (_) { /* ignore */ }
            document.body.removeChild(textarea);
        }

        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            navigator.clipboard.writeText(url).then(function () {
                showCopied();
            }).catch(function () {
                fallbackCopy(url);
            });
        } else {
            fallbackCopy(url);
        }
    });
});
