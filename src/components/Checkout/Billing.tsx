import React, { useEffect, useState } from "react";

interface BillingProps {
  formData: {
    firstName: string;
    lastName: string;
    companyName: string;
    country: string;
    address: string;
    addressTwo: string;
    town: string;
    phone: string;
    email: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

// Define a type for a single saved billing detail entry
interface SavedBillingEntry {
  id: string; // Unique ID for each saved entry
  name: string; // A display name for the saved entry (e.g., "Home Address", "Work Address")
  firstName: string;
  lastName: string;
  companyName: string;
  country: string;
  address: string;
  addressTwo: string;
  town: string;
  phone: string;
  email: string;
}

const Billing: React.FC<BillingProps> = ({ formData, handleChange }) => {
  // State to hold saved billing details
  const [savedDetails, setSavedDetails] = useState<SavedBillingEntry[]>([]);
  // State to hold the currently selected saved detail ID in the dropdown
  const [selectedSavedDetailId, setSelectedSavedDetailId] = useState<string>('');

  // Load saved details from local storage on component mount
  useEffect(() => {
    try {
      const storedDetails = localStorage.getItem('savedBillingDetails');
      if (storedDetails) {
        setSavedDetails(JSON.parse(storedDetails));
      }
    } catch (error) {
      console.error("Failed to parse saved billing details from local storage:", error);
      // Optionally clear corrupted data or notify user
      localStorage.removeItem('savedBillingDetails');
    }
  }, []);

  // Function to save the current form data to local storage
  const handleSaveCurrentDetails = () => {
    // Prompt the user for a descriptive name for this saved entry
    const entryName = prompt("Enter a name for these billing details (e.g., 'Home Address', 'Work Address'):");
    if (entryName && entryName.trim() !== '') {
      const newEntry: SavedBillingEntry = {
        ...formData,
        id: Date.now().toString(), // Simple unique ID based on timestamp
        name: entryName.trim(),
      };
      const updatedDetails = [...savedDetails, newEntry];
      setSavedDetails(updatedDetails);
      localStorage.setItem('savedBillingDetails', JSON.stringify(updatedDetails));
      alert('Billing details saved successfully!');
    } else if (entryName !== null) { // Only if they didn't click cancel
      alert('Please enter a valid name for the billing details.');
    }
  };

  // Handle selection from the dropdown
  const handleSelectSavedDetail = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedSavedDetailId(selectedId);

    if (selectedId === "") {
      // If "Select a saved address" is chosen, you might want to clear the form fields
      // or revert to initial state. For now, we'll just return.
      // To clear the form, you'd need to pass a "clearForm" function from the parent or
      // replicate the initial state here and trigger handleChange for all fields with empty values.
      return;
    }

    const selectedEntry = savedDetails.find(detail => detail.id === selectedId);
    if (selectedEntry) {
      // Trigger handleChange for each field to update the parent's formData
      // This ensures the main form state (managed by the parent) is updated
      Object.keys(selectedEntry).forEach(key => {
        // Exclude 'id' and 'name' as they are internal to SavedBillingEntry and not part of formData
        if (key !== 'id' && key !== 'name') {
          // Create a mock event to pass to the parent's handleChange function
          const mockEvent = {
            target: {
              name: key,
              value: selectedEntry[key as keyof Omit<SavedBillingEntry, 'id' | 'name'>],
            },
          } as unknown as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>; // Type assertion for React event
          handleChange(mockEvent);
        }
      });
    }
  };

  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Billing details
      </h2>

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        {/* Dropdown for selecting saved details, only visible if there are saved entries */}
        {savedDetails.length > 0 && (
          <div className="mb-5">
            <label htmlFor="savedDetails" className="block mb-2.5 text-gray-700">
              Select a saved address:
            </label>
            <select
              id="savedDetails"
              value={selectedSavedDetailId}
              onChange={handleSelectSavedDetail}
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            >
              <option value="">-- Select a saved address --</option>
              {savedDetails.map(detail => (
                <option key={detail.id} value={detail.id}>
                  {detail.name} - {detail.address}, {detail.town}, {detail.country}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="firstName" className="block mb-2.5">
              First Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Jhon"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="w-full">
            <label htmlFor="lastName" className="block mb-2.5">
              Last Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Deo"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="companyName" className="block mb-2.5">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            id="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="address" className="block mb-2.5">
            Street Address
            <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="House number and street name"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          <div className="mt-5">
            <input
              type="text"
              name="addressTwo"
              id="addressTwo"
              value={formData.addressTwo}
              onChange={handleChange}
              placeholder="Apartment, suite, unit, etc. (optional)"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="town" className="block mb-2.5">
            Town/ City <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="town"
            id="town"
            value={formData.town}
            onChange={handleChange}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="country" className="block mb-2.5">
            Country
          </label>
          <input
            type="text"
            name="country"
            id="country"
            value={formData.country}
            onChange={handleChange}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="phone" className="block mb-2.5">
            Phone <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="mb-5.5">
          <label htmlFor="email" className="block mb-2.5">
            Email Address <span className="text-red">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        {/* Button to save current details */}
        <button
          type="button"
          onClick={handleSaveCurrentDetails}
          className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Save Current Details
        </button>
      </div>
    </div>
  );
};

export default Billing;