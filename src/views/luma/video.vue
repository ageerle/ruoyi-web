 <script setup lang="ts">
 import VoInput from './voInput.vue';
 import VoList from './voList.vue';
 </script>
<template>

<div class="flex w-full h-full   video-content">
    <div class="w-[300px] h-full  overflow-y-auto vo-input">
         <VoInput/>
    </div>
    <div class=" flex-1  h-full bg-[#fafbfc] pt-2 dark:bg-[#18181c] overflow-y-auto video-list" >
        <VoList/>
    </div>
     
</div>
</template> 