/**
 * Inject global styles for form elements and icons
 */
export function injectGlobalStyles() {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.innerHTML = `
    .form-input {
      display: block;
      width: 100%;
      border-radius: 0.375rem; /* rounded-md */
      border: 1px solid #D1D5DB; /* border-gray-300 */
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .dark .form-input {
      background-color: #374151; /* dark:bg-gray-700 */
      border-color: #4B5563; /* dark:border-gray-600 */
      color: #F9FAFB; /* dark:text-gray-100 */
      placeholder-color: #9CA3AF; /* dark:placeholder-gray-400 */
    }

    .form-input:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      border-color: #3B82F6; /* focus:border-blue-500 */
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); /* focus:ring-blue-500 */
    }

    .dark .form-input:focus {
      border-color: #3B82F6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
    }

    .icon-sm {
      width: 1.25rem; /* w-5 */
      height: 1.25rem; /* h-5 */
      color: #9CA3AF; /* text-gray-400 */
    }

    /* Custom slider thumb */
    .range-thumb-blue::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 1rem;
      height: 1rem;
      background: #3B82F6; /* bg-blue-600 */
      border-radius: 9999px; /* rounded-full */
      cursor: pointer;
      margin-top: -4px; /* Center thumb on track */
    }

    .range-thumb-blue::-moz-range-thumb {
      width: 1rem;
      height: 1rem;
      background: #3B82F6;
      border-radius: 9999px;
      cursor: pointer;
      border: none;
    }

    /* Icon padding */
    input[type="text"][id="beds"],
    input[type="number"][id="beds"],
    input[type="text"][id="baths"],
    input[type="number"][id="baths"],
    input[type="text"][id="year"],
    input[type="number"][id="year"] {
       padding-left: 2.5rem; /* pl-10 for icon */
    }

    /* No icon padding */
    #address, #purchasePrice, #monthlyRent, #avgNightlyRate, #equivalentRent, #monthlyHOA, #utilitiesMonthly, #loanTerm {
      padding-left: 0.75rem; /* pl-3 */
    }

    /* Fix number input alignment */
    input[type="number"].text-right {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
    }

    /* Remove number input spinners */
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `;
  document.head.appendChild(style);
}
