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

    $copylink.on("click", function () {
        const url = window.location.href;
        console.log(url);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
                $copylink.addClass("copied");
                setTimeout(function () { $copylink.removeClass("copied"); }, 1500);
            }).catch(function (err: any) {
                console.error("Clipboard write failed: ", err);
                fallbackCopy(url);
            });
        } else {
            fallbackCopy(url);
        }

        function fallbackCopy(text: string) {
            const $tempInput = $("<input>");
            $("body").append($tempInput);
            $tempInput.val(text).select();
            try {
                document.execCommand("copy");
                $copylink.addClass("copied");
                setTimeout(function () { $copylink.removeClass("copied"); }, 1500);
            } catch (err) {
                console.error("Fallback copy failed: ", err);
            }
            $tempInput.remove();
        }
    });
});
