<template>
  <div id="app">
    <NavBar />
    <router-view />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';

export default {
  name: 'App',
  components: {
    NavBar
  }
};
</script>

<style>
/* Global CSS */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding-top: 5rem; /* Provide space for fixed navbar */
  background-image: url('./assets/nature.jpg'); /* Path to your background image */
  background-color: rgba(0, 0, 0, 0.3); /* Solid färg med opacity (rgba) */
  background-blend-mode: overlay; /* Blandningsläge för att kombinera färg och bild */
  background-size: cover;
  background-position: center;
  background-attachment: fixed; /* Keep background fixed while scrolling */
}
#app {
  position: relative;
  overflow-x: hidden; /* Hide horizontal scrollbar */
}

</style>
