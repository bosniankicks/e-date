const app = document.getElementById("app");

// Main Page
function renderMainPage() {
  app.innerHTML = `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-pink-50 to-white">
      <div class="text-center">
        <h1 class="text-5xl font-bold text-red-600 mb-8">Valentine's Day Planner</h1>
        <svg class="text-red-500 w-32 h-32 mb-8 mx-auto" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <button id="createDateBtn" class="btn text-2xl px-8 py-4 transform hover:scale-110 transition-transform duration-200">
          Create A Date
        </button>
      </div>
    </div>
  `;
  document.getElementById("createDateBtn").addEventListener("click", renderOptionsPage);
}

// Options Page
function renderOptionsPage() {
  app.innerHTML = `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-pink-50 to-white">
      <div class="text-center">
        <h2 class="text-4xl font-bold text-red-600 mb-8">Choose an Option</h2>
        <div class="space-y-6">
          <button id="reserveBtn" class="btn block w-64 mx-auto transform hover:scale-105 transition-transform duration-200">
            Reserve a Date
          </button>
            <button id="activitiesBtn" class="btn block w-64 mx-auto transform hover:scale-105 transition-transform duration-200">
                Generate Date Night Activities
            </button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("reserveBtn").addEventListener("click", renderReservationForm);
  document.getElementById("activitiesBtn").addEventListener("click", renderDateActivitiesPage);
}

// Date Activities Page
function renderDateActivitiesPage() {
  app.innerHTML = `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-pink-50 to-white">
      <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div class="flex items-center mb-6">
          <button id="backBtn" class="text-red-600 hover:text-red-800 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Options
          </button>
        </div>

        <h2 class="text-4xl font-bold text-red-600 mb-8 text-center">Generate Date Night Ideas</h2>
        
        <div class="space-y-6">
          <button id="generateBtn" class="w-full btn bg-pink-500 hover:bg-pink-600">
            Generate Ideas
          </button>

          <div id="loadingIndicator" class="text-center hidden">
            <div class="flex justify-center space-x-2 mb-4">
              <div class="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
              <div class="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
            <p class="text-gray-600">Finding perfect date ideas for you...</p>
          </div>

          <div id="dateIdeasContainer" class="space-y-4 mt-6">
            <!-- Date ideas will be inserted here -->
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", renderOptionsPage);
  document.getElementById("generateBtn").addEventListener("click", handleGenerateIdeas);
}

// Handle Generate Date Ideas
async function handleGenerateIdeas() {
  const generateBtn = document.getElementById("generateBtn");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const dateIdeasContainer = document.getElementById("dateIdeasContainer");

  generateBtn.disabled = true;
  generateBtn.classList.add("opacity-50", "cursor-not-allowed");
  loadingIndicator.classList.remove("hidden");
  dateIdeasContainer.innerHTML = "";

  try {
    const result = await window.electronAPI.generateDateActivities();
    
    dateIdeasContainer.innerHTML = result.ideas.map((idea, index) => `
      <div class="bg-pink-50 rounded-xl p-6">
        <h3 class="text-xl font-semibold text-red-600 mb-2">Date Idea ${index + 1}:</h3>
        <p class="text-gray-700">${idea}</p>
      </div>
    `).join("");
  } catch (error) {
    console.error("Error generating date ideas:", error);
    dateIdeasContainer.innerHTML = `
      <div class="bg-red-50 rounded-xl p-6">
        <p class="text-red-600">Error generating date ideas. Please try again.</p>
      </div>
    `;
  }

  generateBtn.disabled = false;
  generateBtn.classList.remove("opacity-50", "cursor-not-allowed");
  loadingIndicator.classList.add("hidden");
}

// Loading Screen
function renderLoadingScreen() {
  app.innerHTML = `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-pink-50 to-white">
      <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center">
          <svg class="text-red-500 w-24 h-24 mb-8 mx-auto animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <h3 class="text-3xl font-bold text-red-600 mb-4">Reserving Your Night Together</h3>
          <div class="flex justify-center space-x-2 mb-6">
            <div class="w-3 h-3 bg-red-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
            <div class="w-3 h-3 bg-red-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-3 h-3 bg-red-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
          <p class="text-gray-600">Finding the perfect spot for your special evening...</p>
        </div>
      </div>
    </div>
  `;
}

// Error Screen
function renderErrorScreen(error, formData) {
  app.innerHTML = `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-pink-50 to-white">
      <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center">
          <svg class="text-red-500 w-24 h-24 mb-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h3 class="text-3xl font-bold text-red-600 mb-4">Oops! Something Went Wrong</h3>
          <p class="text-gray-600 mb-6">${error}</p>
          <button id="retryBtn" class="btn mb-4">Try Again</button>
          <button id="backBtn" class="btn btn-outline">Back to Main Page</button>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById("retryBtn").addEventListener("click", () => renderReservationForm());
  document.getElementById("backBtn").addEventListener("click", renderMainPage);
}

// Reservation Form
function renderReservationForm() {
  app.innerHTML = `
    <div class="min-h-screen p-6 bg-gradient-to-b from-pink-50 to-white">
      <div class="form-container">
        <div class="flex items-center mb-6">
          <button id="backBtn" class="text-red-600 hover:text-red-800 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Options
          </button>
        </div>

        <h2 class="text-4xl font-bold text-red-600 mb-8 text-center">Plan Your Perfect Date</h2>
        
        <form id="reservationForm" class="space-y-8">
          <!-- Partners Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="label" for="partner1FirstName">Partner 1 First Name</label>
              <input 
                class="input" 
                id="partner1FirstName" 
                type="text" 
                placeholder="Enter first name"
                required
              >
            </div>
            <div class="form-group">
              <label class="label" for="partner1LastName">Partner 1 Last Name</label>
              <input 
                class="input" 
                id="partner1LastName" 
                type="text" 
                placeholder="Enter last name"
                required
              >
            </div>
            <div class="form-group">
              <label class="label" for="partner2FirstName">Partner 2 First Name</label>
              <input 
                class="input" 
                id="partner2FirstName" 
                type="text" 
                placeholder="Enter first name"
                required
              >
            </div>
            <div class="form-group">
              <label class="label" for="partner2LastName">Partner 2 Last Name</label>
              <input 
                class="input" 
                id="partner2LastName" 
                type="text" 
                placeholder="Enter last name"
                required
              >
            </div>
          </div>

          <!-- Contact Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="label" for="email">Email</label>
              <input 
                class="input" 
                id="email" 
                type="email" 
                placeholder="Enter email address"
                required
              >
            </div>
            <div class="form-group">
              <label class="label" for="phone">Phone Number</label>
              <input 
                class="input" 
                id="phone" 
                type="tel" 
                placeholder="Enter phone number"
                required
              >
            </div>
          </div>

          <!-- Location -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="label" for="city">City</label>
              <input 
                class="input" 
                id="city" 
                type="text" 
                placeholder="Enter city"
                required
              >
            </div>
            <div class="form-group">
              <label class="label" for="state">State</label>
              <input 
                class="input" 
                id="state" 
                type="text" 
                placeholder="Enter state"
                required
              >
            </div>
          </div>

          <!-- Price Range -->
          <div class="form-group">
            <label class="label">Price Range</label>
            <div class="flex items-center space-x-8 mt-2">
              <label class="inline-flex items-center cursor-pointer">
                <input type="radio" class="form-radio text-red-600" name="priceRange" value="$" required>
                <span class="ml-2">$</span>
              </label>
              <label class="inline-flex items-center cursor-pointer">
                <input type="radio" class="form-radio text-red-600" name="priceRange" value="$$">
                <span class="ml-2">$$</span>
              </label>
              <label class="inline-flex items-center cursor-pointer">
                <input type="radio" class="form-radio text-red-600" name="priceRange" value="$$$">
                <span class="ml-2">$$$</span>
              </label>
              <label class="inline-flex items-center cursor-pointer">
                <input type="radio" class="form-radio text-red-600" name="priceRange" value="$$$$">
                <span class="ml-2">$$$$</span>
              </label>
            </div>
          </div>

         <!-- Date and Time -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="form-group">
    <label class="label" for="date">Date</label>
    <input 
      class="input" 
      id="date" 
      type="date" 
      required
      min="${new Date().toISOString().split('T')[0]}"
    >
  </div>
  <div class="form-group">
    <label class="label" for="startTime">Start Time</label>
    <select class="input" id="startTime" required>
      <option value="">Select time</option>
      ${generateTimeOptions()}
    </select>
  </div>
  <div class="form-group">
    <label class="label" for="endTime">End Time</label>
    <select class="input" id="endTime" required>
      <option value="">Select time</option>
      ${generateTimeOptions()}
    </select>
    </div>
    </div>

        <!-- Submit Button -->
        <div class="flex justify-center pt-6">
        <button type="submit" class="btn w-full md:w-auto md:px-12">
            Plan Our Date
        </button>
        </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", renderOptionsPage);
  document.getElementById("reservationForm").addEventListener("submit", handleReservationSubmit);

  // Add date validation
  const dateInput = document.getElementById("date");
  dateInput.min = new Date().toISOString().split('T')[0];

  // Add time validation
  const startTimeSelect = document.getElementById("startTime");
  const endTimeSelect = document.getElementById("endTime");
  
  startTimeSelect.addEventListener('change', () => {
    validateTimeRange(startTimeSelect, endTimeSelect);
  });

  endTimeSelect.addEventListener('change', () => {
    validateTimeRange(startTimeSelect, endTimeSelect);
  });
}


function renderConfirmation(formData, reservationDetails) {
  app.innerHTML = `
    <div class="min-h-screen p-6 bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
      <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h3 class="text-3xl font-bold text-red-600 mb-6 text-center">Your Perfect Evening is Set!</h3>
        
        <!-- Restaurant Details -->
        <div class="bg-red-50 rounded-xl p-6 mb-6">
          <h4 class="text-xl font-semibold text-red-600 mb-4">Your Reservation</h4>
          <div class="space-y-3">
            <p class="text-lg"><span class="font-semibold text-red-500">Restaurant:</span> ${reservationDetails.restaurant}</p>
            <p class="text-lg"><span class="font-semibold text-red-500">Time:</span> ${reservationDetails.time}</p>
            <p class="text-lg"><span class="font-semibold text-red-500">Price Range:</span> ${reservationDetails.priceLevel}</p>
          </div>
        </div>

        <!-- Partners Info -->
        <div class="bg-pink-50 rounded-xl p-4 mb-4">
          <p class="text-lg">
            <span class="font-semibold text-red-500">Partners:</span> 
            ${formData.partner1FirstName} ${formData.partner1LastName} & 
            ${formData.partner2FirstName} ${formData.partner2LastName}
          </p>
        </div>

        <!-- Date Info -->
        <div class="bg-pink-50 rounded-xl p-4 mb-4">
          <p class="text-lg">
            <span class="font-semibold text-red-500">Date:</span> 
            ${new Date(formData.date + 'T00:00:00').toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <!-- Contact Info -->
        <div class="bg-pink-50 rounded-xl p-4 mb-6">
          <p class="text-lg">
            <span class="font-semibold text-red-500">Contact:</span> 
            ${formData.email} | ${formData.phone}
          </p>
        </div>

        <div class="text-center space-y-6">
          <div class="bg-green-50 rounded-xl p-4">
            <p class="text-green-600">✓ Confirmation email sent to ${formData.email}</p>
          </div>
          
          <div>
            <p class="text-xl font-semibold text-red-600">Enjoy your Valentine's Day date!</p>
            <p class="text-sm text-gray-600 mt-2">Don't forget to bring flowers and chocolates! 💝</p>
          </div>
          
          <button id="backToMainBtn" class="btn">Back to Main Page</button>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById("backToMainBtn").addEventListener("click", renderMainPage);
}

async function handleReservationSubmit(event) {
  event.preventDefault();
  
  const formData = {
    partner1FirstName: document.getElementById("partner1FirstName").value,
    partner1LastName: document.getElementById("partner1LastName").value,
    partner2FirstName: document.getElementById("partner2FirstName").value,
    partner2LastName: document.getElementById("partner2LastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    priceRange: document.querySelector('input[name="priceRange"]:checked').value,
    date: document.getElementById("date").value,
    startTime: document.getElementById("startTime").value,
    endTime: document.getElementById("endTime").value,
  };

  // Show loading screen
  renderLoadingScreen();

  try {
    // Start reservation process
    const result = await window.electronAPI.startReservation(formData);
    
    if (result.success) {
      renderConfirmation(formData, result);
    } else {
      renderErrorScreen(result.error, formData);
    }
  } catch (error) {
    renderErrorScreen(error.message, formData);
  }
}

function generateTimeOptions() {
  const times = [];
  for (let i = 0; i < 24; i++) {
    const hour = i < 10 ? `0${i}` : i;
    const period = i < 12 ? "AM" : "PM";
    const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
    const formattedHour = displayHour < 10 ? `0${displayHour}` : displayHour;

    times.push(`<option value="${formattedHour}:00 ${period}">${formattedHour}:00 ${period}</option>`);
    times.push(`<option value="${formattedHour}:30 ${period}">${formattedHour}:30 ${period}</option>`);
  }
  return times.join("");
}

function validateTimeRange(startSelect, endSelect) {
  const startTime = startSelect.value;
  const endTime = endSelect.value;

  if (startTime && endTime) {
    const start = new Date(`2025-01-01 ${startTime}`);
    const end = new Date(`2025-01-01 ${endTime}`);

    if (end <= start) {
      endSelect.setCustomValidity('End time must be after start time');
      endSelect.reportValidity();
    } else {
      endSelect.setCustomValidity('');
    }
  }
}

renderMainPage();
