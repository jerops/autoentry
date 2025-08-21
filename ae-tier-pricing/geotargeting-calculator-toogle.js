// ae-tier-pricing/webflow-scripts.js
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Geotargeting script started");
    
    /*--------------------start of Geotargeting -------------*/
    const currencyByCountry = {
      'US': 'US Dollar',
      'CA': 'Canadian Dollar', 
      'AU': 'Australian Dollar',
      'NZ': 'New Zealand Dollar',
      'ZA': 'South African Rand',
      'GB': 'British Pound',
      // EU countries
      'DE': 'Euro', 'FR': 'Euro', 'IT': 'Euro', 'ES': 'Euro',
      'NL': 'Euro', 'BE': 'Euro', 'AT': 'Euro', 'IE': 'Euro',
      'PT': 'Euro', 'FI': 'Euro', 'GR': 'Euro', 'LU': 'Euro',
      'MT': 'Euro', 'CY': 'Euro', 'SK': 'Euro', 'SI': 'Euro',
      'EE': 'Euro', 'LV': 'Euro', 'LT': 'Euro', 'HR': 'Euro'
    };
    
    let originalSelectValue = '';
    let filterApplied = false;
    
    async function setUserCurrency() {
      if (filterApplied) {
        console.log("🚫 Filter already applied, skipping");
        return;
      }
      
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        const currency = currencyByCountry[countryCode] || 'British Pound';
        
        console.log(`🌍 Location: ${countryCode}, Setting currency to: ${currency}`);
        
        preserveOriginalSelectValue();
        applyFilterWithFinsweet(currency);
        
        filterApplied = true;
        
      } catch (error) {
        console.error('❌ Geolocation failed:', error);
        preserveOriginalSelectValue();
        applyFilterWithFinsweet('British Pound');
        filterApplied = true;
      }
    }
    
    function preserveOriginalSelectValue() {
      const currencySelect = document.querySelector('[fs-list-field="planCurrency"]');
      if (currencySelect) {
        originalSelectValue = currencySelect.value;
        console.log(`💾 Stored original value: "${originalSelectValue}"`);
      }
    }
    
    function restoreOriginalSelectValue() {
      const currencySelect = document.querySelector('[fs-list-field="planCurrency"]');
      if (currencySelect) {
        currencySelect.value = originalSelectValue;
        console.log(`🔄 Restored original value: "${originalSelectValue}"`);
      }
    }
    
    function applyFilterWithFinsweet(currency) {
      // Check if Finsweet List Filter is ready
      if (window.fsAttributes && window.fsAttributes.listfilter && window.fsAttributes.listfilter.instances) {
        console.log(`✅ Finsweet ready with ${window.fsAttributes.listfilter.instances.length} instances`);
        
        window.fsAttributes.listfilter.instances.forEach((instance, index) => {
          try {
            instance.setFilter('planCurrency', currency);
            console.log(`✅ Applied ${currency} filter via Finsweet to instance ${index + 1}`);
          } catch (error) {
            console.error(`❌ Finsweet filter failed for instance ${index + 1}:`, error);
          }
        });
        
        setTimeout(restoreOriginalSelectValue, 50);
      } else {
        console.log('⏳ Finsweet not ready, using programmatic approach');
        applyFilterProgrammatically(currency);
      }
    }
    
    function applyFilterProgrammatically(currency) {
      console.log(`🎯 Applying ${currency} filter programmatically`);
      
      // Find the currency select and set its value, then trigger the filter
      const currencySelect = document.querySelector('[fs-list-field="planCurrency"]');
      
      if (currencySelect) {
        // Set the select value to trigger the filter
        currencySelect.value = currency;
        
        // Trigger events to notify Finsweet List Filter
        const events = ['change', 'input', 'click'];
        events.forEach(eventType => {
          const event = new Event(eventType, { 
            bubbles: true,
            cancelable: true 
          });
          currencySelect.dispatchEvent(event);
        });
        
        console.log(`✅ Set currency select to "${currency}" and triggered events`);
        
        // Restore the original select value after a short delay
        setTimeout(() => {
          restoreOriginalSelectValue();
        }, 100);
        
      } else {
        console.warn('❌ Currency select not found');
      }
    }
    
    // Initialize with Finsweet listener
    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push([
      'listfilter',
      (filterInstances) => {
        console.log('🎪 Finsweet List Filter initialized with', filterInstances.length, 'instance(s)');
        setTimeout(setUserCurrency, 100);
      },
    ]);
    
    // Backup attempt
    setTimeout(() => {
      if (!filterApplied) {
        console.log('⏰ Backup attempt - applying geotargeting');
        setUserCurrency();
      }
    }, 1000);
    
    /*--------------------end of Geotargeting -------------*/
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    /*--------------------start plan calculator and suggested output -------------*/
    const sliders = document.querySelectorAll(".credit-slider");
    const totalOutput = document.getElementById("total-credits");
    const suggestedTierOutput = document.getElementById("suggested-tier-output");
    const biggerPlanCard = document.querySelector('.js-need-bigger-plan_card');
  
    // Check if required elements exist
    if (!totalOutput || !suggestedTierOutput || !biggerPlanCard) {
      console.warn('Plan calculator: Required elements not found');
      return;
    }
  
    // Event listener for each slider to update fill color
    sliders.forEach((slider) => {
      slider.addEventListener("input", function () {
        const max = this.max || 100;
        const percentage = ((this.value - this.min) / (max - this.min)) * 100;
        this.style.setProperty("--slider-fill-percentage", `${percentage}%`);
      });
    });
  
    // Slider configurations
    const slidersConfig = {
      monthlyInvoices: {
        slider: document.getElementById("monthly-invoices-slider"),
        outputLabel: document.getElementById("monthly-invoices-value"),
      },
      invoicesPercentage: {
        slider: document.getElementById("invoices-percentage-slider"),
        outputLabel: document.getElementById("invoices-percentage-value"),
      },
      bankStatements: {
        slider: document.getElementById("bank-statements-slider"),
        outputLabel: document.getElementById("bank-statements-value"),
      },
    };
  
    // Function to update the value display of each slider
    const updateSliderDisplay = (slider, outputLabel) => {
      if (outputLabel && outputLabel.childNodes[0]) {
        outputLabel.childNodes[0].textContent = slider.value;
      }
    };
  
    // Add event listeners to sliders
    Object.values(slidersConfig).forEach(({ slider, outputLabel }) => {
      if (slider && outputLabel) {
        slider.addEventListener("input", () => {
          updateSliderDisplay(slider, outputLabel);
          updateTotalAndTier();
        });
      }
    });
  
    // Function to calculate total credits
    function calculateTotal() {
      const { monthlyInvoices, invoicesPercentage, bankStatements } = slidersConfig;
      
      if (!monthlyInvoices.slider || !invoicesPercentage.slider || !bankStatements.slider) {
        return 0;
      }
      
      const monthlyInvoicesValue = +monthlyInvoices.slider.value;
      const invoicesPercentageValue = +invoicesPercentage.slider.value / 100;
      const bankStatementsValue = +bankStatements.slider.value;
      
      return Math.round(
        monthlyInvoicesValue * invoicesPercentageValue +
        monthlyInvoicesValue +
        bankStatementsValue * 3
      );
    }
  
    // Function to manually filter plans by name
    function filterPlansByName(tierName) {
      // Find all list wrappers that should be affected by plan filtering
      const listWrappers = document.querySelectorAll('[fs-list-instance*="shared-filter"]');
      
      listWrappers.forEach((listWrapper, listIndex) => {
        const planItems = listWrapper.querySelectorAll('[fs-list-field="planName"]');
        
        if (planItems.length === 0) {
          // This list doesn't have plan names, skip it
          console.log(`📦 List ${listIndex + 1}: No planName fields, skipping`);
          return;
        }
        
        console.log(`📦 List ${listIndex + 1}: Found ${planItems.length} plan items`);
        
        planItems.forEach((planElement, itemIndex) => {
          const planName = planElement.textContent?.trim();
          const listItem = planElement.closest('[role="listitem"], .w-dyn-item');
          
          if (listItem) {
            if (!tierName || planName === tierName) {
              // Show item
              listItem.style.display = '';
              console.log(`  ✅ Showing: ${planName}`);
            } else {
              // Hide item
              listItem.style.display = 'none';
              console.log(`  ❌ Hiding: ${planName}`);
            }
          }
        });
      });
    }
  
  // Function to determine and update the suggested tier
  function updateSuggestedTier(total) {
    let tierName;
    
    if (total <= 0) {
      tierName = "Bronze";
      biggerPlanCard.classList.remove('is-active');
    } else if (total < 50) {
      tierName = "Bronze";
      biggerPlanCard.classList.remove('is-active');
    } else if (total < 100) {
      tierName = "Silver";
      biggerPlanCard.classList.remove('is-active');
    } else if (total < 200) {
      tierName = "Gold";
      biggerPlanCard.classList.remove('is-active');
    } else if (total < 500) {
      tierName = "Platinum";
      biggerPlanCard.classList.remove('is-active');
    } else if (total < 1500) {
      tierName = "Diamond";
      biggerPlanCard.classList.remove('is-active');
    } else if (total < 2500) {
      tierName = "Sapphire";
      biggerPlanCard.classList.remove('is-active');
   } else {
    // More than 2500 credits needed
    tierName = "Sapphire";
    biggerPlanCard.classList.add('is-active');
    filterPlansByName(tierName);
    suggestedTierOutput.value = "You need a bigger plan book a demo";
    
    // Add class for flex-column layout
    const suggestTierContainer = document.querySelector('[data-value="suggest_tier"]');
    if (suggestTierContainer) {
      suggestTierContainer.classList.add('long-message');
    }
    
    return;
  }
  
  // Remove class for normal tiers
  const suggestTierContainer = document.querySelector('[data-value="suggest_tier"]');
  if (suggestTierContainer) {
    suggestTierContainer.classList.remove('long-message');
  }
    
    // Apply custom plan filtering
    filterPlansByName(tierName);
    
    // Update the input value for display
    suggestedTierOutput.value = tierName;
    
    console.log(`📊 Suggested tier: ${tierName} for ${total} credits`);
  }
    // Function to update total credits and suggested tier
    function updateTotalAndTier() {
      const total = calculateTotal();
      totalOutput.textContent = total;
      updateSuggestedTier(total);
    }
  
    // Initialize by setting initial values
    updateTotalAndTier();
    /*--------------------end plan calculator and suggested output -------------*/
  });
  
  // Clean Toggle Script
  document.addEventListener("DOMContentLoaded", () => {
    const showAllPlansBtn = document.querySelector('.show-all-plans');
    const allPlansSection = document.querySelector('[data-value="all-plans"]');
    
    if (showAllPlansBtn && allPlansSection) {
      let isShowingAll = allPlansSection.classList.contains('is-show');
      
      showAllPlansBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        isShowingAll = !isShowingAll;
        allPlansSection.classList.toggle('is-show');
        showAllPlansBtn.textContent = isShowingAll ? 'Hide All Plans' : 'See All Plans';
      });
    }
  });