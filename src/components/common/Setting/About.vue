<script setup lang='ts'>
  import { NCard,NImage } from 'naive-ui'
</script>

<template>
    <n-card  embedded:bordered="false">
    <div style="text-align:center">
      <span>联系客服</span>
      <br>
      <n-image style="margin: 20px;" width="150" src="http://43.139.70.230:6553/down/v7929z21iHCh.png"/>
      <br>
 
    </div>
       
      <template #action>
        <div class="p-2 space-y-2 rounded-md">
        <p>
          项目开源于
          <a
            class="text-blue-600 dark:text-blue-500"
            href="https://github.com/ageerle/ruoyi-ai"
            target="_blank"
          >
          Github
          </a>
          ,如果你觉得此项目对你有帮助,请在Github帮我点个Star,谢谢！
        </p>
      </div>
      </template>
 
  </n-card>
</template>
