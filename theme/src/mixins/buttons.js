/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
// const colors = require('tailwindcss/colors');

// const button = () => ({
//   '&': {
//     'background-color': colors.blue.400
//   }
// })

/*
@mixin button {
  background-color: $brand-primary;
  color: $white;
  border-radius: $rounded-full;
  padding: .5rem 1rem;
  font-weight: $font-weight-bold;
  line-height: 1;
  border: 3px solid $brand-primary;
  transition: all $transition-speed $transition-default;

  &:hover {
    background-color: $blue-hover;
    border-color: $blue-hover;
    cursor: pointer;
  }

  @include focusRing;
}

@mixin button-secondary {
  background-color: transparent;
  color: $gray;
  border-radius: $rounded-full;
  padding: .5rem 1rem;
  font-weight: $font-weight-bold;
  line-height: 1;
  border: 3px solid $gray;
  transition: all $transition-speed $transition-default;
  text-transform: none;

  &:hover {
    border-color: $gray-darker;
    color: $gray-darker;
    cursor: pointer;
  }

  @include focusRing;
}

@mixin button-tertiary {
  background-color: transparent;
  color: $gray;
  border-radius: $rounded-full;
  padding: .5rem 1rem;
  font-weight: $font-weight-bold;
  line-height: 1;
  border: 3px solid transparent;
  transition: all $transition-speed $transition-default;

  &:hover {
    border-color: transparent;
    color: $gray-darker;
    cursor: pointer;
  }

  @include focusRing;
}
*/



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