/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
const generateStyles = (breakPoint, columnTotal, column=0) => {
  let styles = {};
  while (column <= columnTotal) {
    styles = {
      ...styles,
      [`& > .aem-GridColumn.aem-GridColumn--${breakPoint}--${column}`]: {
        float: 'left',
        clear: 'none',
        width: `${column * 100 / columnTotal}%`
      },
      [`& > .aem-GridColumn.aem-GridColumn--offset--${breakPoint}--${column}`]: {
        'margin-left': `${column * 100 / columnTotal}%`
      }
    }
    column++;
  }
  return styles;
};

module.exports = (mixin, breakPoint, columnTotal) => {
  return {
    ...generateStyles(breakPoint, parseInt(columnTotal)),
    [`& > .aem-GridColumn.aem-GridColumn--${breakPoint}--newline`]: {
      display: 'block',
      clear: 'both !important',
    },
    [`& > .aem-GridColumn.aem-GridColumn--${breakPoint}--none`]: {
        display: 'block',
        clear: 'none !important',
        float: 'left' 
    },        
    [`& > .aem-GridColumn.aem-GridColumn--${breakPoint}--hide`]: {
        display: 'none'
    },
  }
};