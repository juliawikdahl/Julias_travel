<template>
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top">
      <div class="container">
        <router-link to="/" class="navbar-brand">Julia's Travel</router-link>
        <div class="collapse navbar-collapse justify-content-center">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link to="/" class="nav-link">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/flights" class="nav-link">Flights</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/hotels" class="nav-link">Hotels</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/contact" class="nav-link">Contact Us</router-link>
            </li>
          </ul>
        </div>
        <div class="navbar-nav ml-auto">
          <div class="nav-item dropdown" @mouseover="showDropdown" @mouseleave="hideDropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button">
              My Travel
            </a>
            <div class="dropdown-menu dropdown-menu-right" :class="{ show: dropdownVisible }" aria-labelledby="navbarDropdown">
              <router-link to="/profile" class="dropdown-item">My Profile</router-link>
              <router-link to="/bookings" class="dropdown-item">My Bookings</router-link>
              <div class="dropdown-divider"></div>
              <span v-if="loggedIn">
                <button @click="logout" class="dropdown-item">Log Out</button>
              </span>
              <span v-else>
                <router-link to="/login" class="dropdown-item">Log In</router-link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'NavBar',
    data() {
      return {
        loggedIn: false, // Eller sätt detta baserat på din applikations tillstånd
        dropdownVisible: false
      };
    },
    methods: {
      logout() {
        // Implementera din logout-logik här
      },
      showDropdown() {
        this.dropdownVisible = true;
      },
      hideDropdown() {
        this.dropdownVisible = false;
      }
    }
  };
  </script>
  
  <style scoped>
  .navbar {
    padding: 1rem 5rem;
  }
  
  .nav-link {
    color: white !important;
  }
  
  .dropdown-item {
    color: white !important;
  }
  .dropdown-item:hover {
    background-color: rgba(59, 59, 59, 0.663);
  }

/* Ensuring dropdown-menu is visible over other content */
.navbar .dropdown-menu.show {
 
  background-color: rgba(255, 255, 255, 0.108);
}


</style>
  
 
  