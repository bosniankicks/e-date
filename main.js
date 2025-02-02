const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Stagehand } = require("@browserbasehq/stagehand");
const fs = require('fs').promises;
require('dotenv').config();

let mainWindow;

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  mainWindow.loadFile('index.html');
}

// Create custom BrowserBase session
async function createCustomBrowserSession() {
  try {
    console.log('Creating custom BrowserBase session...');
    const response = await fetch('https://api.browserbase.com/v1/sessions', {
      method: 'POST',
      headers: {
        'x-bb-api-key': process.env.BROWSERBASE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: process.env.BROWSERBASE_PROJECT_ID,
        proxies: true,
        browserSettings: {
          advancedStealth: true,
          blockAds: false,
          solveCaptchas: false,
        },
      }),
    });

    const session = await response.json();
    console.log('Custom session created:', session.id);
    return session;
  } catch (error) {
    console.error('Error creating custom session:', error);
    throw error;
  }
}

// Initialize Stagehand with custom session
async function initializeStagehand() {
  try {
    const customSession = await createCustomBrowserSession();

    const stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      debugDom: true,
      headless: true,
      enableCaching: true,
      modelName: "gpt-4o",
      modelClientOptions: {
        apiKey: process.env.OPENAI_API_KEY,
      },
      logger: (message) => console.log(JSON.stringify(message)),
      browserbaseSessionID: customSession.id,
      browser: {
        defaultViewport: {
          width: 1280,
          height: 800
        }
      }
    });

    await stagehand.init();
    return stagehand;
  } catch (error) {
    console.error('Error initializing Stagehand:', error);
    throw error;
  }
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle date activities generation
ipcMain.handle('generate-date-activities', async () => {
  try {
    console.log('Starting date ideas generation process...');
    const stagehand = await initializeStagehand();
    console.log('Stagehand initialized successfully');

    const page = stagehand.page;
    await page.goto('about:blank', { waitUntil: 'networkidle' });

    const ideas = await handleDateIdeasGeneration(page);

    await stagehand.close();
    return {
      success: true,
      ideas: ideas
    };
  } catch (error) {
    console.error('Date ideas generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Handle date ideas generation process
async function handleDateIdeasGeneration(page) {
  try {
    // Navigate to the date ideas page
    await page.goto("https://www.theknot.com/content/date-ideas");
    await page.waitForTimeout(5000);

    // Get all date ideas
    const dateIdeas = await page.evaluate(() => {
      const ideas = [];
      // Looking for headers with date ideas
      const headers = document.querySelectorAll('h3.h3--70c74');
      headers.forEach(header => {
        // Get the next paragraph element for the description
        const description = header.nextElementSibling?.textContent;
        if (description) {
          ideas.push({
            title: header.textContent.trim(),
            description: description.trim()
          });
        }
      });
      return ideas;
    });

    if (!dateIdeas || dateIdeas.length === 0) {
      throw new Error("No date ideas found on the page.");
    }

    // Randomly select 3 unique date ideas
    const selectedIdeas = [];
    const usedIndices = new Set();

    while (selectedIdeas.length < 3 && usedIndices.size < dateIdeas.length) {
      const randomIndex = Math.floor(Math.random() * dateIdeas.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        const idea = dateIdeas[randomIndex];
        selectedIdeas.push(`${idea.title}: ${idea.description}`);
      }
    }

    if (selectedIdeas.length === 0) {
      throw new Error("Could not select any date ideas.");
    }

    return selectedIdeas;

  } catch (error) {
    console.error('Error in date ideas generation:', error);
    throw new Error(`Date ideas generation failed: ${error.message}`);
  }
}

// Handle reservation request
ipcMain.handle('start-reservation', async (event, formData) => {
  try {
    console.log('Starting reservation process...');
    const stagehand = await initializeStagehand();
    console.log('Stagehand initialized successfully');

    const page = stagehand.page;
    await page.goto('about:blank', { waitUntil: 'networkidle' });

    const result = await handleTockReservation(page, formData);

    await stagehand.close();
    return result;
  } catch (error) {
    console.error('Reservation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Handle Tock reservation process
async function handleTockReservation(page, formData) {
  try {
    await page.goto("https://www.exploretock.com/login?continue=%2F");
    await page.waitForTimeout(5000);

    await page.locator('[data-testid="email-input"]').click();
    await page.locator('[data-testid="email-input"]').fill(process.env.EMAIL);
    await page.waitForTimeout(500);

    await page.locator('[data-testid="password-input"]').click();
    await page.locator('[data-testid="password-input"]').fill(process.env.ACC_PASSWORD);
    await page.waitForTimeout(500);

    await page.locator('[data-testid="signin"]').click();
    await page.waitForTimeout(5000);

    await page.goto("https://www.exploretock.com/city/san-francisco");
    await page.waitForTimeout(15000);

    await page.waitForTimeout(1000);
    await page.act(`Select the date ${formData.date}`);
    await page.waitForTimeout(1000);

    const userStartMinutes = convertTimeToMinutes(formData.startTime);
    const userEndMinutes = convertTimeToMinutes(formData.endTime);
    const midpointMinutes = Math.floor((userStartMinutes + userEndMinutes) / 2);
    const midpointTime = convertMinutesToTime(midpointMinutes);

    await page.act(`Select the time closest to ${midpointTime} in the time dropdown selector`);
    await page.locator('[data-testid="in-city-search-button-desktop"]').click();
    await page.act("Click the 'More Filters' button");
    await page.act(`Click the price filter that matches "${formData.priceRange}"`);
    await page.getByRole('button', { name: 'Update search' }).click();
    await page.waitForTimeout(10000);

    const restaurantListings = await page.locator('li[data-testid^="businessId-"]').all();

    const filteredRestaurants = [];
    for (const restaurant of restaurantListings) {
      const name = await restaurant.locator('[data-testid="search-business-name"]').textContent();
      const url = await restaurant.locator('a').getAttribute('href');
    
      if (
        name &&
        !["Akari", "Azucar", "Dandelion Chocolate"].some((excluded) => name.includes(excluded)) &&
        url &&
        !url.includes("azucar")
      ) {
        filteredRestaurants.push(restaurant);
      }
    }

    if (filteredRestaurants.length === 0) {
      throw new Error("No valid restaurants available after filtering.");
    }

    const randomRestaurant = filteredRestaurants[Math.floor(Math.random() * filteredRestaurants.length)];
    const restaurantName = await randomRestaurant.locator('[data-testid="search-business-name"]').textContent();

    const timeButtons = await randomRestaurant.locator('[data-testid="select-time"]').all();

    const validTimes = [];
    for (const button of timeButtons) {
      const timeText = await button.locator('span.css-1sm15rv span').textContent();
      const timeMinutes = convertTimeToMinutes(timeText);

      if (timeMinutes >= userStartMinutes && timeMinutes <= userEndMinutes) {
        validTimes.push({ timeText, button });
      }
    }

    if (validTimes.length === 0) {
      throw new Error(`No available times for ${restaurantName}.`);
    }

    const { timeText, button } = validTimes[Math.floor(Math.random() * validTimes.length)];
    console.log(`Selecting time: ${timeText} for ${restaurantName}`);
    await button.click();
    await page.waitForTimeout(2000);

    const selectedDetails = {
      restaurant: restaurantName,
      time: timeText,
    };

    await page.act("Click the Complete reservation button");
    await page.waitForTimeout(2000);

    return {
      success: true,
      restaurant: selectedDetails.restaurant,
      time: selectedDetails.time,
      date: formData.date,
      priceLevel: formData.priceRange
    };

  } catch (error) {
    console.error('Error in form submission:', error);
    throw new Error(`Form submission failed: ${error.message}`);
  }
}

function convertTimeToMinutes(timeStr) {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function convertMinutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}
