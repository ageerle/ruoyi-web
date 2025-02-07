<!-- src/components/SvgIcon.vue -->
<template>
    <svg :class="classNames" :width="width" :height="height" :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <use :xlink:href="`#icon-${icon}`"></use>
    </svg>
  </template>
  
  <script>
  export default {
    name: 'SvgIcon',
    props: {
      icon: {
        type: String,
        required: true
      },
      width: {
        type: [String, Number],
        default: '1em'
      },
      height: {
        type: [String, Number],
        default: '1em'
      },
      viewBox: {
        type: String,
        default: '0 0 24 24'
      },
      classNames: {
        type: String,
        default: ''
      }
    }
  };
  </script>
  
  <style scoped>
  svg {
    display: inline-block;
    vertical-align: middle;
  }
  </style>
  