<template>
  <div id="app">
    <div class="layout">
      <main>
        <div class="main-content">
          <router-view />
        </div>
      </main>

      <footer>
        <p>2024 © PT Nusantara Berkah Digital</p>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #fafafa;
  color: #333;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 0;
  background: #fafafa;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

footer {
  padding: 20px 0;
  margin-top: auto;
}

footer p {
  padding-left: 50px;
  color: #666;
  font-size: 14px;
  font-weight: 400;
}
</style>
