/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
const filterComponent = () => {
  const options = {};
  const conditionalEls = document.querySelectorAll('[data-condition]');

  if (conditionalEls.length > 0){

    const label = document.createElement('label');
    label.value = 'filter';
    label.innerText = 'Filter Content:'

    const div = document.createElement('div');
    div.classList.add('filter');
    div.appendChild(label);

    const noFilterOption = document.createElement('option');
    noFilterOption.innerText = 'Remove Filters';
    noFilterOption.setAttribute('value','');

    const sel = document.createElement('select');
    sel.setAttribute('name','filter');
    sel.appendChild(noFilterOption);

    sel.addEventListener('change', (e) => {
      conditionalEls.forEach(el => {
        el.style.removeProperty('display');
        if (e.target.value !== '' && el.dataset.condition.split(':')[1] !== e.target.value) el.style.display = 'none';
      });
    });

    conditionalEls.forEach((el) => {
      const [group,value] = el.dataset.condition.split(':');
      if (!options[group]) options[group] = [];
      if (!options[group].includes(value)) options[group].push(value);
    })

    Object.keys(options).forEach(key => {
      const optgroup = document.createElement('optgroup')
      optgroup.setAttribute('label',key);
      options[key].map(value => {
        const option = document.createElement('option');
        option.setAttribute('value',value);
        option.innerText = value;
        optgroup.appendChild(option);
      });
      sel.appendChild(optgroup);
    });

    div.appendChild(sel);
    document.querySelector('.pager').appendChild(div);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector('.pager')) filterComponent()
});