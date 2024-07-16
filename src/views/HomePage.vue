<template>
  <div class="search-container">
    <div class="search-box">
      <h2>Sök efter flyg och hotell</h2>
      <form @submit.prevent="submitSearch">
        <div class="d-flex gap-3">
          <div class="form-group">
            <label for="from">Från</label>
            <input type="text" id="from" v-model="fromInput" class="form-control" @input="handleInputFrom" @focus="handleInputFrom" placeholder="Skriv för att söka" required>
            <ul v-if="filteredLocations.length > 0" class="autocomplete-options">
              <li v-for="location in filteredLocations" :key="location.iataCode" @click="selectLocation(location, 'from')">
                {{ location.name }}
              </li>
            </ul>
          </div>
          <div class="form-group">
            <label for="destination">Destination</label>
            <input type="text" id="destination" v-model="destinationInput" class="form-control" @input="handleInputDestination" @focus="handleInputDestination" placeholder="Skriv för att söka" required>
            <ul v-if="filteredDestinations.length > 0" class="autocomplete-options">
              <li v-for="destination in filteredDestinations" :key="destination.iataCode" @click="selectLocation(destination, 'destination')">
                {{ destination.name }}
              </li>
            </ul>
          </div>
        </div>
        <div class="d-flex gap-3">
          <div class="form-group">
            <label for="departureDate">Avresedatum</label>
            <input type="date" id="departureDate" v-model="departureDate" class="form-control" required>
          </div>
          <div class="form-group">
            <label for="returnDate">Återvändandedatum</label>
            <input type="date" id="returnDate" v-model="returnDate" class="form-control">
          </div>
        </div>
        <div class="d-flex gap-3">
          <div class="form-group">
            <label for="adults">Vuxna (18+ år)</label>
            <input type="number" id="adults" v-model="adults" class="form-control" min="1" required>
          </div>
          <div class="form-group">
            <label for="children">Barn (under 18 år)</label>
            <input type="number" id="children" v-model="children" class="form-control" min="0" required>
          </div>
        </div>
        <div class="form-group">
          <button type="submit" class="search-btn">Sök</button>
        </div>
      </form>
    </div>
    <div v-if="searchResults" class="search-results">
      <h3>Sökresultat</h3>
      <ul>
        <li v-for="result in searchResults" :key="result.id">
          {{ result.offerItems[0].services[0].segments[0].flightSegment.departure.iataCode }} - {{ result.offerItems[0].services[0].segments[0].flightSegment.arrival.iataCode }}:
          {{ result.offerItems[0].price.total }} EUR
        </li>
      </ul>
    </div>
    <div v-if="errorFetchingFlights" class="error-message">
      Det uppstod ett fel vid hämtning av flygerbjudanden. Vänligen försök igen senare.
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash';

export default {
  data() {
    return {
      from: '',
      fromInput: '',
      destination: '',
      destinationInput: '',
      departureDate: '',
      returnDate: '',
      adults: 1,
      children: 0,
      locations: [],
      filteredLocations: [],
      filteredDestinations: [],
      searchResults: null,
      accessToken: '',
      errorFetchingLocations: false,
      errorFetchingFlights: false
    };
  },
  mounted() {
    this.fetchAccessToken();
  },
  methods: {
    async fetchAccessToken() {
      try {
        const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            'grant_type': 'client_credentials',
            'client_id': 'lpASLKg8VPPdmSog5veHG8KORavCAodT',
            'client_secret': 'vcDr9yyIP1VeWwu9'
          })
        });

        if (!response.ok) {
          throw new Error('Misslyckades med att hämta åtkomsttoken');
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        console.log('Access Token:', this.accessToken);
      } catch (error) {
        console.error('Fel vid hämtning av åtkomsttoken:', error);
        this.errorFetchingLocations = true;
      }
    },
    async fetchLocations() {
      try {
        if (this.fromInput) {
          const response = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${this.fromInput}`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });

          if (!response.ok) {
            throw new Error('Misslyckades med att hämta platser');
          }

          const responseData = await response.json();

          if (responseData.data && Array.isArray(responseData.data)) {
            this.locations = responseData.data;
            this.filteredLocations = this.locations;
          } else {
            console.error('Response data is not an array:', responseData);
            throw new Error('Response data is not an array');
          }
        } else {
          this.locations = [];
          this.filteredLocations = [];
        }
      } catch (error) {
        console.error('Fel vid hämtning av platser:', error);
        this.errorFetchingLocations = true;
      }
    },
    async fetchDestinations() {
      try {
        if (this.destinationInput) {
          const response = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${this.destinationInput}`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });

          if (!response.ok) {
            throw new Error('Misslyckades med att hämta destinationer');
          }

          const responseData = await response.json();

          if (responseData.data && Array.isArray(responseData.data)) {
            this.destinations = responseData.data;
            this.filteredDestinations = this.destinations;
          } else {
            console.error('Response data is not an array:', responseData);
            throw new Error('Response data is not an array');
          }
        } else {
          this.destinations = [];
          this.filteredDestinations = [];
        }
      } catch (error) {
        console.error('Fel vid hämtning av destinationer:', error);
        this.errorFetchingDestinations = true;
      }
    },
    async submitSearch() {
      try {
        const response = await fetch('https://test.api.amadeus.com/v2/shopping/flight-offers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`
          },
          body: JSON.stringify({
            originLocationCode: this.from,
            destinationLocationCode: this.destination,
            departureDate: this.departureDate,
            returnDate: this.returnDate,
            adults: this.adults,
            children: this.children,
            max: 10
          })
        });

        if (!response.ok) {
          throw new Error('Misslyckades med att hämta flygerbjudanden');
        }

        const data = await response.json();
        this.searchResults = data.data;
      } catch (error) {
        console.error('Fel vid sökning efter flygerbjudanden:', error);
        this.errorFetchingFlights = true;
      }
    },
    handleInputFrom: debounce(function() {
      this.fetchLocations();
    }, 300),
    handleInputDestination: debounce(function() {
      this.fetchDestinations();
    }, 300),
    selectLocation(location, type) {
      if (type === 'from') {
        this.from = location.iataCode;
        this.fromInput = location.name;
        this.filteredLocations = [];
      } else if (type === 'destination') {
        this.destination = location.iataCode;
        this.destinationInput = location.name;
        this.filteredDestinations = [];
      }
    }
  }
};
</script>

<style scoped>
.search-container {
  max-width: 900px;
  margin: auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #504f4f77;
}

.search-box {
  width: 100%;
  max-width: 600px; /* Justera beroende på ditt layoutbehov */
  color: white;
  background-color: #0606067b;
  padding: 1.5rem;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2 {
  justify-content: center;
  display: flex;
  margin-bottom: 2rem;
}

.form-group {
  width: 100%;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.search-btn {
  border: none;
  border-radius: 20px;
  padding: 0.3rem 1.5rem;
  background-color: rgb(59, 57, 57);
  color: white;
}

.search-btn:hover {
  background-color: black;
}

.search-results {
  margin-top: 2rem;
}

.search-results h3 {
  margin-bottom: 1rem;
}

.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
