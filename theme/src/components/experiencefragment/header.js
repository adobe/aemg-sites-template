/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
var setHeader = () => {
  var domEl = document.querySelector("#page-with-search-in-header")
  console.log('out....')
  console.log(domEl)
  if (domEl) {
    console.log('in....')
    var searchEl = document.querySelector("#page-content .cmp-experiencefragment--header .searchbar")
    console.log(searchEl)
    if (searchEl) {
      searchEl.style.visibility = 'visible';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const toc_btn_collapse_svg = `<svg width=2rem xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
</svg>`;

const toc_btn_expand_svg = `<svg width=2rem xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
</svg>`;

  var header = document.querySelector('.experiencefragment.header')
  const hamburgerButton = document.querySelector('#mobile-hamburger-button');
  hamburgerButton.innerHTML = toc_btn_expand_svg
  var toggleMenu = (isDesktop) => {
    if (isDesktop) {
      header.classList.add('desktop')
      header.classList.remove('mobile')
    } else {
      header.classList.remove('desktop')
      header.classList.add('mobile')
    }
  }

  function openNavigation() {
    const isExpanded = header.getAttribute('data-expanded') === 'true';
    if (isExpanded) {
      console.log('Navigation closed');
      header.setAttribute('data-expanded', 'false');
      hamburgerButton.innerHTML = toc_btn_expand_svg
    } else {
      console.log('Navigation opened');
      hamburgerButton.innerHTML = toc_btn_collapse_svg
      header.setAttribute('data-expanded', 'true');
    }
  }

  const isDesktop = window.matchMedia('(min-width: 768px)');
  header.setAttribute('data-expanded', 'false');
  toggleMenu(isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(isDesktop.matches));
  hamburgerButton.addEventListener("click", () => openNavigation())
  
})
setTimeout(function () { setHeader() }, 1000);