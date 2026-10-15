const PARENT_CONTAINER_ID = '#topic-page';
const TOC_CONTAINER_ID = '#table-of-contents';
const TOPIC_CONTAINER_ID = '#topic-container';
const NEXT_LINK_SELECTOR = '.cmp-pager__next a';
const PREV_LINK_SELECTOR = '.cmp-pager__prev a';
const screenWidth = window.innerWidth;
let x0 = null;

const unify = (e) => e.changedTouches ? e.changedTouches[0] : e;

const lock = (e) => x0 = unify(e).clientX;

const move = (e) => {
  const nextLink = document.querySelector(NEXT_LINK_SELECTOR)?.getAttribute('href');
  const prevLink = document.querySelector(PREV_LINK_SELECTOR)?.getAttribute('href');

  const x1 = unify(e).clientX;
  const direction = x0 < x1 ? 'prev' : 'next';
  if ((screenWidth / 2) < Math.abs(x0 - x1)) {
    if (direction === 'prev' && prevLink) window.location.href = prevLink;
    if (direction === 'next' && nextLink) window.location.href = nextLink;
  }
};


const toc_btn_collapse_svg = "<svg width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "\t\t<g id=\"Frame\">\n" +
    "\t\t<path id=\"iconFill\" d=\"M3.6 1H3.4C2.6268 1 2 1.6268 2 2.4V2.6C2 3.3732 2.6268 4 3.4 4H3.6C4.3732 4 5 3.3732 5 2.6V2.4C5 1.6268 4.3732 1 3.6 1Z\" fill=\"#222222\"/>\n" +
    "\t\t<path id=\"iconFill_2\" d=\"M7.6 7H7.4C6.6268 7 6 7.6268 6 8.4V8.6C6 9.3732 6.6268 10 7.4 10H7.6C8.3732 10 9 9.3732 9 8.6V8.4C9 7.6268 8.3732 7 7.6 7Z\" fill=\"#222222\"/>\n" +
    "\t\t<path id=\"iconFill_3\" d=\"M7.6 13H7.4C6.6268 13 6 13.6268 6 14.4V14.6C6 15.3732 6.6268 16 7.4 16H7.6C8.3732 16 9 15.3732 9 14.6V14.4C9 13.6268 8.3732 13 7.6 13Z\" fill=\"#222222\"/>\n" +
    "\t\t<path id=\"iconFill_4\" d=\"M16.5 14H10.5C10.2239 14 10 14.2239 10 14.5V15.5C10 15.7761 10.2239 16 10.5 16H16.5C16.7761 16 17 15.7761 17 15.5V14.5C17 14.2239 16.7761 14 16.5 14Z\" fill=\"#222222\"/>\n" +
    "\t\t<path id=\"iconFill_5\" d=\"M16.5 8H10.5C10.2239 8 10 8.22386 10 8.5V9.5C10 9.77614 10.2239 10 10.5 10H16.5C16.7761 10 17 9.77614 17 9.5V8.5C17 8.22386 16.7761 8 16.5 8Z\" fill=\"#222222\"/>\n" +
    "\t\t<path id=\"iconFill_6\" d=\"M16.5 2H6.5C6.22386 2 6 2.22386 6 2.5V3.5C6 3.77614 6.22386 4 6.5 4H16.5C16.7761 4 17 3.77614 17 3.5V2.5C17 2.22386 16.7761 2 16.5 2Z\" fill=\"#222222\"/>\n" +
    "\t\t</g>\n" +
    "\t\t</svg>";

const toc_btn_expand_svg = "<svg width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
"\t\t<g id=\"Frame\">\n" +
"\t\t<path id=\"iconFill\" d=\"M3.6 1H3.4C2.6268 1 2 1.6268 2 2.4V2.6C2 3.3732 2.6268 4 3.4 4H3.6C4.3732 4 5 3.3732 5 2.6V2.4C5 1.6268 4.3732 1 3.6 1Z\" fill=\"#ffffff\"/>\n" +
"\t\t<path id=\"iconFill_2\" d=\"M7.6 7H7.4C6.6268 7 6 7.6268 6 8.4V8.6C6 9.3732 6.6268 10 7.4 10H7.6C8.3732 10 9 9.3732 9 8.6V8.4C9 7.6268 8.3732 7 7.6 7Z\" fill=\"#ffffff\"/>\n" +
"\t\t<path id=\"iconFill_3\" d=\"M7.6 13H7.4C6.6268 13 6 13.6268 6 14.4V14.6C6 15.3732 6.6268 16 7.4 16H7.6C8.3732 16 9 15.3732 9 14.6V14.4C9 13.6268 8.3732 13 7.6 13Z\" fill=\"#ffffff\"/>\n" +
"\t\t<path id=\"iconFill_4\" d=\"M16.5 14H10.5C10.2239 14 10 14.2239 10 14.5V15.5C10 15.7761 10.2239 16 10.5 16H16.5C16.7761 16 17 15.7761 17 15.5V14.5C17 14.2239 16.7761 14 16.5 14Z\" fill=\"#ffffff\"/>\n" +
"\t\t<path id=\"iconFill_5\" d=\"M16.5 8H10.5C10.2239 8 10 8.22386 10 8.5V9.5C10 9.77614 10.2239 10 10.5 10H16.5C16.7761 10 17 9.77614 17 9.5V8.5C17 8.22386 16.7761 8 16.5 8Z\" fill=\"#ffffff\"/>\n" +
"\t\t<path id=\"iconFill_6\" d=\"M16.5 2H6.5C6.22386 2 6 2.22386 6 2.5V3.5C6 3.77614 6.22386 4 6.5 4H16.5C16.7761 4 17 3.77614 17 3.5V2.5C17 2.22386 16.7761 2 16.5 2Z\" fill=\"#ffffff\"/>\n" +
"\t\t</g>\n" +
"\t\t</svg>";




const fixCSS = () => {
  const topic_container = document.querySelector('#topic-container');

  // For article-content
  if(topic_container !== null) {
    const parent = topic_container.parentElement;
    parent.classList.add("injected-center-wrapper")
  }

  // For section-content
  const map_container = document.querySelector('#section-page-content')
  if(map_container !== null) {
    const parent = map_container.parentElement;
    parent.classList.add("injected-center-wrapper")
  }

  const toc_container = document.querySelector('#table-of-contents');
  if(toc_container !== null) {
    const parent_toc_container = toc_container.parentElement;
    parent_toc_container.classList.add("injected-toc-wrapper");
    const centerWrapper = document.querySelector('.injected-center-wrapper');
    if(centerWrapper != null) {
      let height = centerWrapper.getBoundingClientRect().height

      const mini_toc: any = document.querySelector('.cmp-mini-toc');
      if(mini_toc !== null) {
        mini_toc.style.height = `${height}px`;
      }
      parent_toc_container.style.minHeight = `${height}px`;
    }
  }

}

function openNavigation(tocWrapper, button) {
  const isExpanded = tocWrapper.getAttribute('data-expanded') === 'true';
  if (isExpanded) {
    console.log('Navigation closed');
    tocWrapper.setAttribute('data-expanded', 'false');
    button.innerHTML = toc_btn_collapse_svg
  } else {
    console.log('Navigation opened');
    button.innerHTML = toc_btn_expand_svg 
    tocWrapper.setAttribute('data-expanded', 'true');
  }
}

const fixTrigger = () => {
  const tocWrapper = document.querySelector("#table-of-contents");
  if(!tocWrapper) return
  const triggerEl = document.querySelector('#table-of-contents-trigger')
  const button = document.createElement('div')
  button.setAttribute("id", "toc-trigger-button")
  button.classList.add("toc-trigger-button")
  button.innerHTML = toc_btn_collapse_svg;
  triggerEl.appendChild(button)
  button.addEventListener('click', (event) => openNavigation(tocWrapper, button))
}

const toggleShowItem = (e) => {
  // Toggle visibility of the <ul> element
  if (e.classList.contains('show-children')) {
    // If <ul> is visible, hide it
    e.classList.remove('show-children');
    e.classList.add('hide-children');
  } else {
    // If <ul> is hidden, show it
    e.classList.remove('hide-children');
    e.classList.add('show-children');
  }
}
const toggleTOC = () => {
  let tocBtn = document.querySelector('.toc-btn');
  if(tocBtn === null) {
    return;
  }
  tocBtn.addEventListener('click', () => {
    toggle(tocBtn);
    appendSvgToTocBtn();
    let tocContainer = document.querySelector('.cmp-navigation')
    toggle(tocContainer);
    let label = document.querySelector('.main-map-label');
    toggle(label);
  })
}

function appendSvgToTocBtn () {
  let btn = document.querySelector('.toc-btn')
  if(btn === null) {
    return;
  }
  if(btn.classList.contains("expand")) {
    console.log("expand added")
    btn.innerHTML = toc_btn_expand_svg
  } else if(btn.classList.contains("collapse")) {
    console.log("collapse added")
    btn.innerHTML = toc_btn_collapse_svg
  }

}



function toggle(element){
  if(element === null) {
    return;
  }
  if(element.classList.contains('expand')) {
    element.classList.remove('expand')
    element.classList.add('collapse')
  } else {
    element.classList.remove('collapse')
    element.classList.add('expand')
  }
}

const TOC = () => {
  const body = document.getElementsByTagName('body')[0]
  const parentContainer = document.querySelector(PARENT_CONTAINER_ID);
  const topicContentContainer = document.querySelector(TOPIC_CONTAINER_ID);
  const tocContainer = document.querySelector(TOC_CONTAINER_ID);

  fixCSS();
  toggleTOC();
  appendSvgToTocBtn();
  fixTrigger();


  if (parentContainer && topicContentContainer && tocContainer) {
    topicContentContainer.addEventListener('touchstart', lock, false); 
    topicContentContainer.addEventListener('touchend', move, false);
  }
  const activeItemsList = document.querySelectorAll('.cmp-navigation__item--active')
  activeItemsList.forEach((item)=> {
    const childListItem = item.querySelector('.cmp-navigation__group');
    const chevronElement = item.querySelector('.item-child-toggle');
    const tocListItem = item.querySelector('.toc-list-item')
    if(chevronElement !== null) {
      chevronElement.classList.remove('hide-children');
      chevronElement.classList.add('show-children');
    }
    if(childListItem !== null) {
      childListItem.classList.remove('hide-children');
      childListItem.classList.add('show-children');
    }
    if(tocListItem !== null) {
      item.querySelector('.toc-list-item').classList.remove('hide-children');
      item.querySelector('.toc-list-item').classList.add('show-children');
    }


    // chevronElement.forEach((element)=>{
    //   element.classList.remove('hide-children');
    //   element.classList.add('show-children');
    // })
    // childListItem.forEach((childItem)=> {
    //   childItem.classList.remove('hide-children');
    //   childItem.classList.add('show-children');
    // })
  })
  const toggleButtons = document.querySelectorAll('.item-child-toggle');

  // Iterate over each toggle button
    toggleButtons.forEach(button => {
      // Add click event listener
      button.addEventListener('click', () => {
        // Get the parent <li> element
        const parentLi = button.closest('.cmp-navigation__item');
        // Get the <ul> element inside the parent <li>
        const childUl = parentLi.querySelector('.cmp-navigation__group');
        toggleShowItem(childUl);
        toggleShowItem(button);

      });
    });

    var toggleMenu = (isDesktop) => {
      if (isDesktop) {
        body.classList.add('desktop')
        body.classList.remove('mobile')
      } else {
        body.classList.remove('desktop')
        body.classList.add('mobile')
      }
    }


    const isDesktop = window.matchMedia('(min-width: 768px)');
    toggleMenu(isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(isDesktop.matches));  
};

document.addEventListener("DOMContentLoaded", TOC);