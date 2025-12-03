/**
 * Custom JavaScript functions for contact form handling
 */

(function() {
  "use strict";

  // Form validation state
  const formValidationState = {
    name: false,
    surname: false,
    email: false,
    phone: false,
    address: false,
    rating1: true, // Sliders always have a value
    rating2: true,
    rating3: true
  };

  /**
   * Generate a random word for helper tag
   */
  function generateRandomWord() {
    const words = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 
                   'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
                   'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey',
                   'Xray', 'Yankee', 'Zulu', 'Ace', 'Bravo', 'Charlie', 'Diamond'];
    return words[Math.floor(Math.random() * words.length)];
  }

  /**
   * Generate a random 5-character code with uppercase letters and digits
   */
  function generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Validate name or surname (only letters, not empty)
   */
  function validateName(value) {
    if (!value || value.trim() === '') {
      return { valid: false, error: 'This field cannot be empty' };
    }
    const lettersOnly = /^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim());
    if (!lettersOnly) {
      return { valid: false, error: 'Name can only contain letters' };
    }
    if (value.trim().length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' };
    }
    return { valid: true, error: '' };
  }

  /**
   * Validate email format
   */
  function validateEmail(value) {
    if (!value || value.trim() === '') {
      return { valid: false, error: 'This field cannot be empty' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return { valid: false, error: 'Please enter a valid email address' };
    }
    return { valid: true, error: '' };
  }

  /**
   * Validate address (meaningful text string)
   */
  function validateAddress(value) {
    if (!value || value.trim() === '') {
      return { valid: false, error: 'This field cannot be empty' };
    }
    if (value.trim().length < 5) {
      return { valid: false, error: 'Address must be at least 5 characters' };
    }
    // Check if address contains meaningful content (not just spaces or special chars)
    const meaningfulRegex = /[a-zA-Z0-9]/.test(value.trim());
    if (!meaningfulRegex) {
      return { valid: false, error: 'Please enter a valid address' };
    }
    return { valid: true, error: '' };
  }

  /**
   * Validate phone number (Lithuanian format)
   */
  function validatePhone(value) {
    // Remove formatting for validation
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length === 0) {
      return { valid: false, error: 'This field cannot be empty' };
    }
    // Lithuanian format: +370 followed by 8 digits (mobile starts with 6)
    if (!digitsOnly.startsWith('370')) {
      return { valid: false, error: 'Phone number must start with +370' };
    }
    if (digitsOnly.length !== 11) {
      return { valid: false, error: 'Phone number must be 11 digits (including +370)' };
    }
    if (digitsOnly[3] !== '6') {
      return { valid: false, error: 'Mobile number must start with +370 6' };
    }
    return { valid: true, error: '' };
  }

  /**
   * Format phone number with Lithuanian format
   */
  function formatPhoneNumber(value) {
    // Remove all non-digits except keep track of + at start
    let digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 11 digits (+370 + 8 digits)
    if (digitsOnly.length > 11) {
      digitsOnly = digitsOnly.substring(0, 11);
    }
    
    // If user starts typing without +370, add it for mobile numbers
    if (digitsOnly.length > 0 && !digitsOnly.startsWith('370')) {
      if (digitsOnly[0] === '6' || digitsOnly[0] === '8' || digitsOnly[0] === '5') {
        digitsOnly = '370' + digitsOnly;
        // Re-limit after adding prefix
        if (digitsOnly.length > 11) {
          digitsOnly = digitsOnly.substring(0, 11);
        }
      } else if (digitsOnly.length >= 1) {
        // If doesn't start with mobile prefix, prepend 370
        digitsOnly = '370' + digitsOnly;
        if (digitsOnly.length > 11) {
          digitsOnly = digitsOnly.substring(0, 11);
        }
      }
    }
    
    // Format: +370 6xx xxxxx
    if (digitsOnly.length === 0) {
      return '';
    } else if (digitsOnly.length <= 3) {
      return '+' + digitsOnly;
    } else if (digitsOnly.length <= 6) {
      return '+' + digitsOnly.substring(0, 3) + ' ' + digitsOnly.substring(3);
    } else {
      return '+' + digitsOnly.substring(0, 3) + ' ' + digitsOnly.substring(3, 6) + ' ' + digitsOnly.substring(6);
    }
  }

  /**
   * Show validation error for a field
   */
  function showFieldError(fieldName, errorMessage) {
    const field = document.querySelector(`input[name="${fieldName}"]`);
    const errorContainer = document.getElementById(`${fieldName}-error`);
    
    if (field) {
      field.classList.add('field-error');
      field.classList.remove('field-valid');
    }
    
    if (errorContainer) {
      errorContainer.textContent = errorMessage;
      errorContainer.classList.add('show');
    }
    
    formValidationState[fieldName] = false;
    updateSubmitButton();
  }

  /**
   * Clear validation error for a field
   */
  function clearFieldError(fieldName) {
    const field = document.querySelector(`input[name="${fieldName}"]`);
    const errorContainer = document.getElementById(`${fieldName}-error`);
    
    if (field) {
      field.classList.remove('field-error');
      field.classList.add('field-valid');
    }
    
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.classList.remove('show');
    }
    
    formValidationState[fieldName] = true;
    updateSubmitButton();
  }

  /**
   * Update submit button state based on form validation
   */
  function updateSubmitButton() {
    const submitButton = document.querySelector('.php-email-form button[type="submit"]');
    const allValid = Object.values(formValidationState).every(valid => valid === true);
    
    if (submitButton) {
      if (allValid) {
        submitButton.disabled = false;
        submitButton.classList.remove('disabled');
      } else {
        submitButton.disabled = true;
        submitButton.classList.add('disabled');
      }
    }
  }

  /**
   * Calculate average rating from three rating values
   */
  function calculateAverage(rating1, rating2, rating3) {
    const avg = (parseFloat(rating1) + parseFloat(rating2) + parseFloat(rating3)) / 3;
    return parseFloat(avg.toFixed(1));
  }

  /**
   * Get color class based on average rating
   */
  function getRatingColorClass(average) {
    if (average >= 0 && average < 4) {
      return 'rating-red';
    } else if (average >= 4 && average < 7) {
      return 'rating-orange';
    } else if (average >= 7 && average <= 10) {
      return 'rating-green';
    }
    return '';
  }

  /**
   * Display form results below the form
   */
  function displayFormResults(formData, average, randomCode) {
    // Remove existing results if any
    const existingResults = document.querySelector('.form-results-container');
    if (existingResults) {
      existingResults.remove();
    }

    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'form-results-container';

    // Create results heading
    const resultsHeading = document.createElement('h3');
    resultsHeading.textContent = 'Form Submission Results';
    resultsHeading.className = 'form-results-heading';
    resultsContainer.appendChild(resultsHeading);

    // Create results list
    const resultsList = document.createElement('div');
    resultsList.className = 'form-results-list';

    // Add form data items
    const fields = [
      { label: 'Name', value: formData.name },
      { label: 'Surname', value: formData.surname },
      { label: 'Email', value: formData.email },
      { label: 'Phone number', value: formData.phone },
      { label: 'Address', value: formData.address },
      { label: 'Rating 1', value: formData.rating1 },
      { label: 'Rating 2', value: formData.rating2 },
      { label: 'Rating 3', value: formData.rating3 }
    ];

    fields.forEach(field => {
      const resultItem = document.createElement('div');
      resultItem.className = 'form-result-item';
      resultItem.innerHTML = `<strong>${field.label}:</strong> ${field.value}`;
      resultsList.appendChild(resultItem);
    });

    // Add helper tag with random word
    const randomWord = generateRandomWord();
    const helperTag = document.createElement('div');
    helperTag.className = 'form-result-item';
    helperTag.innerHTML = `<strong>Helper tag:</strong> ${randomWord} FE24-JS-CF-${randomCode}`;
    resultsList.appendChild(helperTag);

    resultsContainer.appendChild(resultsList);

    // Add average rating display
    const averageContainer = document.createElement('div');
    averageContainer.className = 'form-average-container';
    const averageLabel = document.createElement('div');
    averageLabel.className = 'form-average-label';
    const colorClass = getRatingColorClass(average);
    averageLabel.innerHTML = `<strong>${formData.name} ${formData.surname}:</strong> <span class="rating-average ${colorClass}">${average}</span>`;
    averageContainer.appendChild(averageLabel);
    resultsContainer.appendChild(averageContainer);

    // Insert results after the form column in the same row
    const contactForm = document.querySelector('.php-email-form');
    if (contactForm) {
      // Find the parent row container
      const formColumn = contactForm.closest('.col-lg-8');
      const rowContainer = formColumn ? formColumn.parentElement : null;
      
      if (rowContainer) {
        // Wrap results in a column div to maintain grid layout
        const resultsColumn = document.createElement('div');
        resultsColumn.className = 'col-lg-12';
        resultsColumn.appendChild(resultsContainer);
        
        // Insert after the row's existing columns
        rowContainer.appendChild(resultsColumn);
        
        // Scroll to results smoothly
        setTimeout(() => {
          resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } else {
        // Fallback: just append after form column
        contactForm.parentElement.insertAdjacentElement('afterend', resultsContainer);
      }
    }
  }

  /**
   * Show success popup notification
   */
  function showSuccessPopup() {
    // Remove existing popup if any
    const existingPopup = document.querySelector('.success-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'success-popup';
    popup.innerHTML = `
      <div class="success-popup-content">
        <i class="bi bi-check-circle-fill"></i>
        <p>Form submitted successfully!</p>
      </div>
    `;

    // Add popup to body
    document.body.appendChild(popup);

    // Trigger animation
    setTimeout(() => {
      popup.classList.add('show');
    }, 10);

    // Remove popup after 3 seconds
    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => {
        popup.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Handle form submission
   */
  function handleFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation(); // Prevent other handlers from running

    // Get form element
    const form = event.target;

    // Collect form data
    const formData = {
      name: form.querySelector('input[name="name"]')?.value || '',
      surname: form.querySelector('input[name="surname"]')?.value || '',
      email: form.querySelector('input[name="email"]')?.value || '',
      phone: form.querySelector('input[name="phone"]')?.value || '',
      address: form.querySelector('input[name="address"]')?.value || '',
      rating1: form.querySelector('input[name="rating1"]')?.value || '',
      rating2: form.querySelector('input[name="rating2"]')?.value || '',
      rating3: form.querySelector('input[name="rating3"]')?.value || ''
    };

    // Validate that all fields are filled
    const requiredFields = ['name', 'surname', 'email', 'phone', 'address', 'rating1', 'rating2', 'rating3'];
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        isValid = false;
      }
    });

    if (!isValid) {
      alert('Please fill in all fields before submitting.');
      return;
    }

    // Generate random code
    const randomCode = generateRandomCode();
    formData.helperTag = `FE24-JS-CF-${randomCode}`;

    // Calculate average rating
    const average = calculateAverage(formData.rating1, formData.rating2, formData.rating3);

    // Print to console
    console.log('Form Data Object:', formData);
    console.log('Average Rating:', average);

    // Display results
    displayFormResults(formData, average, randomCode);

    // Show success popup
    showSuccessPopup();
  }

  /**
   * Initialize real-time validation for name field
   */
  function initNameValidation() {
    const nameField = document.querySelector('input[name="name"]');
    if (nameField) {
      nameField.addEventListener('input', function() {
        const validation = validateName(this.value);
        if (validation.valid) {
          clearFieldError('name');
        } else {
          showFieldError('name', validation.error);
        }
      });
      
      nameField.addEventListener('blur', function() {
        const validation = validateName(this.value);
        if (!validation.valid) {
          showFieldError('name', validation.error);
        }
      });
    }
  }

  /**
   * Initialize real-time validation for surname field
   */
  function initSurnameValidation() {
    const surnameField = document.querySelector('input[name="surname"]');
    if (surnameField) {
      surnameField.addEventListener('input', function() {
        const validation = validateName(this.value);
        if (validation.valid) {
          clearFieldError('surname');
        } else {
          showFieldError('surname', validation.error);
        }
      });
      
      surnameField.addEventListener('blur', function() {
        const validation = validateName(this.value);
        if (!validation.valid) {
          showFieldError('surname', validation.error);
        }
      });
    }
  }

  /**
   * Initialize real-time validation for email field
   */
  function initEmailValidation() {
    const emailField = document.querySelector('input[name="email"]');
    if (emailField) {
      emailField.addEventListener('input', function() {
        const validation = validateEmail(this.value);
        if (validation.valid) {
          clearFieldError('email');
        } else {
          showFieldError('email', validation.error);
        }
      });
      
      emailField.addEventListener('blur', function() {
        const validation = validateEmail(this.value);
        if (!validation.valid) {
          showFieldError('email', validation.error);
        }
      });
    }
  }

  /**
   * Initialize phone number masking and validation
   */
  function initPhoneMasking() {
    const phoneField = document.querySelector('input[name="phone"]');
    if (phoneField) {
      // Set initial placeholder
      phoneField.placeholder = '+370 6xx xxxxx';
      
      phoneField.addEventListener('input', function(e) {
        const cursorPosition = this.selectionStart;
        const oldValue = this.value;
        const newValue = formatPhoneNumber(this.value);
        
        this.value = newValue;
        
        // Restore cursor position (adjust for added formatting)
        const digitsBefore = oldValue.substring(0, cursorPosition).replace(/\D/g, '').length;
        let newCursorPosition = 0;
        let digitCount = 0;
        
        for (let i = 0; i < newValue.length && digitCount < digitsBefore; i++) {
          if (/\d/.test(newValue[i])) {
            digitCount++;
          }
          newCursorPosition = i + 1;
        }
        
        this.setSelectionRange(newCursorPosition, newCursorPosition);
        
        // Validate phone number
        const validation = validatePhone(newValue);
        if (validation.valid) {
          clearFieldError('phone');
        } else {
          // Only show error if user has started typing
          if (newValue.replace(/\D/g, '').length > 0) {
            showFieldError('phone', validation.error);
          } else {
            formValidationState.phone = false;
            updateSubmitButton();
          }
        }
      });
      
      phoneField.addEventListener('keydown', function(e) {
        // Allow: backspace, delete, tab, escape, enter, arrow keys, and control keys
        if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
            (e.keyCode === 65 && e.ctrlKey === true) || // Allow: Ctrl+A
            (e.keyCode >= 35 && e.keyCode <= 40) ||     // Allow: Home, End, Left, Right
            (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 88))) { // Allow: Ctrl+C, Ctrl+V, Ctrl+X
          return;
        }
        // Allow numbers (0-9) from both main keyboard and numpad
        if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
          return;
        }
        // Allow + sign (Shift + = or + on numpad)
        if (e.keyCode === 187 && e.shiftKey) {
          return;
        }
        // Block all other keys
        e.preventDefault();
      });
      
      // Handle paste events
      phoneField.addEventListener('paste', function(e) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        // Format pasted text
        const formatted = formatPhoneNumber(pastedText);
        this.value = formatted;
        // Trigger input event to validate
        this.dispatchEvent(new Event('input'));
      });
      
      phoneField.addEventListener('blur', function() {
        const validation = validatePhone(this.value);
        if (!validation.valid && this.value.trim() !== '') {
          showFieldError('phone', validation.error);
        }
      });
    }
  }

  /**
   * Initialize real-time validation for address field
   */
  function initAddressValidation() {
    const addressField = document.querySelector('input[name="address"]');
    if (addressField) {
      addressField.addEventListener('input', function() {
        const validation = validateAddress(this.value);
        if (validation.valid) {
          clearFieldError('address');
        } else {
          showFieldError('address', validation.error);
        }
      });
      
      addressField.addEventListener('blur', function() {
        const validation = validateAddress(this.value);
        if (!validation.valid) {
          showFieldError('address', validation.error);
        }
      });
    }
  }

  /**
   * Initialize rating slider value displays
   */
  function initRatingSliders() {
    const ratingSliders = document.querySelectorAll('input[name^="rating"]');
    ratingSliders.forEach(slider => {
      const valueDisplay = document.querySelector(`#${slider.id}-value`);
      if (valueDisplay) {
        // Set initial value
        valueDisplay.textContent = slider.value;
        
        // Update on change
        slider.addEventListener('input', function() {
          valueDisplay.textContent = this.value;
          formValidationState[this.name] = true;
          updateSubmitButton();
        });
      }
    });
  }

  /**
   * Initialize form event listener when DOM is ready
   */
  function initContactForm() {
    const contactForm = document.querySelector('.php-email-form');
    if (contactForm) {
      // Remove any existing listeners and add ours
      // Use capture phase to run before validate.js handler
      contactForm.addEventListener('submit', handleFormSubmit, true);
    }
    
    // Initialize all validations
    initNameValidation();
    initSurnameValidation();
    initEmailValidation();
    initPhoneMasking();
    initAddressValidation();
    initRatingSliders();
    
    // Disable submit button initially
    updateSubmitButton();
  }

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }

})();

