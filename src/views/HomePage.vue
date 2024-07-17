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
    <div class="search-results">
  <h3>Sökresultat</h3>
  <ul>
    <li v-for="(result, index) in searchResults" :key="index">
      <div v-if="result.itineraries.length > 0 && result.itineraries[0].segments.length > 0">
        <p><strong>Flygnummer:</strong> {{ result.itineraries[0].segments[0].carrierCode }}{{ result.itineraries[0].segments[0].number }}</p>
        <p><strong>Från:</strong> {{ result.itineraries[0].segments[0].departure.iataCode }}, {{ fromInput }}</p>
        <p><strong>Avresedatum och tid:</strong> {{ formatDate(result.itineraries[0].segments[0].departure.at) }}</p>
        <p><strong>Till:</strong> {{ result.itineraries[0].segments[result.itineraries[0].segments.length - 1].arrival.iataCode }}, {{ destinationInput }}</p>
        <p><strong>Ankomstdatum och tid:</strong> {{ formatDate(result.itineraries[0].segments[result.itineraries[0].segments.length - 1].arrival.at) }}</p>
        <p><strong>Restid:</strong> {{ result.itineraries[0].duration }}</p>
        <p><strong>Direktflyg:</strong> {{ result.itineraries[0].segments.length === 1 ? 'Ja' : 'Nej' }}</p>
        
        <!-- Visa väntetiden -->
        <p v-if="result.itineraries[0].segments.length > 1">
          <strong>Väntetid till nästa flyg:</strong> {{ calculateWaitTime(result.itineraries[0].segments[0].arrival.at, result.itineraries[0].segments[1].departure.at) }} minuter
          
        </p>
        
        <ul v-if="result.itineraries[0].segments.length > 1">
          <li v-for="(segment, sIndex) in result.itineraries[0].segments.slice(1)" :key="sIndex">
            <p><strong>Mellanlandning {{ sIndex + 1 }}:</strong></p>
            <p><strong>Från:</strong> {{ segment.departure.iataCode }}</p>
            <p><strong>Avresa:</strong> {{ formatDate(segment.departure.at) }}</p>
            <p><strong>Till:</strong> {{ segment.arrival.iataCode }}</p>
            <p><strong>Ankomst:</strong> {{ formatDate(segment.arrival.at) }}</p>
            <p><strong>Flygtid:</strong> {{ segment.duration }}</p>
          </li>
        </ul>
        
        <p><strong>Antal vuxna:</strong> {{ getNumberOfAdults(result.travelerPricings) }}</p>
        <p><strong>Antal barn:</strong> {{ getNumberOfChildren(result.travelerPricings) }}</p>
        <p><strong>Pris:</strong> {{ result.price.total }} {{ result.price.currency }}</p>
      </div>
    </li>
  </ul>
  <p v-if="errorFetchingFlights" class="error-message">Det uppstod ett fel vid hämtning av flygerbjudanden.</p>
  <p v-if="searchResults.length === 0 && !errorFetchingFlights">Inga flygerbjudanden hittades.</p>
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
      filteredLocations: [],
      filteredDestinations: [],
      searchResults: [],
      accessToken: '',
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
      } catch (error) {
        console.error('Fel vid hämtning av åtkomsttoken:', error);
        this.errorFetchingFlights = true;
      }
    },
    async fetchLocations(keyword) {
      try {
        if (keyword) {
          const response = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${keyword}`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });

          if (!response.ok) {
            throw new Error('Misslyckades med att hämta platser');
          }

          const responseData = await response.json();

          if (responseData.data && Array.isArray(responseData.data)) {
            return responseData.data;
          } else {
            throw new Error('Response data is not an array');
          }
        } else {
          return [];
        }
      } catch (error) {
        console.error('Fel vid hämtning av platser:', error);
        this.errorFetchingFlights = true;
        return [];
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
            originDestinations: [{
              id: '1',
              originLocationCode: this.from,
              destinationLocationCode: this.destination,
              departureDateTimeRange: {
                date: this.departureDate,
                time: '10:00:00' // Just an example time, adjust as needed
              }
            }],
            travelers: this.generateTravelersArray(),
            sources: ['GDS'],
            searchCriteria: {
              maxFlightOffers: 10 // Adjust to the desired number of flight offers
            }
          })
        });

        if (!response.ok) {
          throw new Error('Misslyckades med att hämta flygerbjudanden');
        }

        const data = await response.json();
        this.searchResults = data.data;
        console.log('sökresultat', this.searchResults)
      } catch (error) {
        console.error('Fel vid sökning efter flygerbjudanden:', error);
        this.errorFetchingFlights = true;
      }
    },
    handleInputFrom: debounce(async function() {
      this.filteredLocations = await this.fetchLocations(this.fromInput);
    }, 300),
    handleInputDestination: debounce(async function() {
      this.filteredDestinations = await this.fetchLocations(this.destinationInput);
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
    },
    generateTravelersArray() {
      try {
        const travelers = [];
        
        // Vuxna (ADULT)
        for (let i = 1; i <= this.adults; i++) {
          travelers.push({
            id: `ADT${i}`,
            travelerType: 'ADULT',
            count: 1 // Varje vuxen har en count på 1
          });
        }
  
        // Barn (CHILD)
        for (let j = 1; j <= this.children; j++) {
          travelers.push({
            id: `CHD${j}`,
            travelerType: 'CHILD',
            count: 1 // Varje barn har en count på 1
          });
        }
        
        return travelers;
      } catch (error) {
        console.error('Fel vid generering av resenärer:', error);
        this.errorFetchingFlights = true;
        return [];
      }
    },
    formatDate(dateTimeStr) {
      // Funktion för att formatera datum och tid från ISO-format till läsbar sträng
      const dateTime = new Date(dateTimeStr);
      return dateTime.toLocaleString();
    },
    getNumberOfAdults(travelerPricings) {
      let adultsCount = 0;
      if (Array.isArray(travelerPricings)) {
        travelerPricings.forEach((pricing) => {
          if (pricing.travelerType === 'ADULT') {
            adultsCount += pricing.travelerCount || 1; // Default till 1 om travelerCount inte finns
          }
        });
      }
      return adultsCount;
    },
    getNumberOfChildren(travelerPricings) {
      let childrenCount = 0;
      if (Array.isArray(travelerPricings)) {
        travelerPricings.forEach((pricing) => {
          if (pricing.travelerType === 'CHILD') {
            childrenCount += pricing.travelerCount || 1; // Default till 1 om travelerCount inte finns
          }
        });
      }
      return childrenCount;
    },
    calculateWaitTime(firstArrival, nextDeparture) {
    const arrivalTime = new Date(firstArrival);
    const departureTime = new Date(nextDeparture);
    const diffMs = departureTime - arrivalTime; // Skillnaden i millisekunder
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60); // Extrahera antalet minuter
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24); // Extrahera antalet timmar

    if (diffHours > 0 && diffMinutes > 0) {
      // Om både timmar och minuter är större än 0, visa både
      return `${diffHours} timmar och ${diffMinutes} minuter`;
    } else if (diffHours > 0 && diffMinutes === 0) {
      // Om bara timmar är större än 0 och inga minuter, visa bara timmar
      return `${diffHours} timmar`;
    } else {
      // Om timmar är 0 eller mindre, visa inget
      return 'Mindre än en timme';
    }
  },
  
//     getFlightNumber(result) {
//   try {
//     if (
//       result && // Kontrollera om 'result' existerar och inte är null eller undefined
//       result.itineraries && // Kontrollera om 'itineraries' egenskapen finns i 'result'
//       result.itineraries.length > 0 && // Kontrollera om 'itineraries' arrayen har minst ett element
//       result.itineraries[0].segments && // Kontrollera om 'segments' egenskapen finns i det första elementet av 'itineraries' arrayen
//       result.itineraries[0].segments.length > 0 && // Kontrollera om 'segments' arrayen har minst ett segment
//       result.itineraries[0].segments[0] && // Kontrollera om det första segmentet existerar
//       result.itineraries[0].segments[0].carrierCode && // Kontrollera om 'carrierCode' egenskapen finns i det första segmentet
//       result.itineraries[0].segments[0].number // Kontrollera om 'number' egenskapen finns i det första segmentet
//     ) {
//       return `${result.itineraries[0].segments[0].carrierCode}${result.itineraries[0].segments[0].number}`; // Returnera flygnumret som en sträng
//     } else {
//       console.warn('Ogiltigt resultatobjekt eller saknade egenskaper för flygnummer:', result); // Visa varning om något av kraven inte uppfylls
//       return 'Flight Number N/A'; // Returnera ett standardvärde om kraven inte uppfylls
//     }
//   } catch (error) {
//     console.error('Fel i getFlightNumber:', error); // Hantera eventuella fel som kan uppstå
//     return 'Flight Number N/A'; // Returnera ett standardvärde vid fel
//   }
// }

  
   
   
    
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
  color: white;
}

.search-results h3 {
  margin-bottom: 1rem;
}

.error-message {
  color: red;
  margin-top: 1rem;
}
</style>

