import React, { useEffect, useState } from "react";

interface Address {
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

interface BillingProps {
  formData: Address;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddressSelect: (address: Address) => void;
  saveAddress: boolean;
  setSaveAddress: (save: boolean) => void;
}

const Billing: React.FC<BillingProps> = ({
  formData,
  handleChange,
  handleAddressSelect,
  saveAddress,
  setSaveAddress,
}) => {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  useEffect(() => {
    // Placeholder for fetching saved addresses
    // Replace with actual API call when the endpoint is ready
    const fetchAddresses = async () => {
      // Simulate API call
      // const response = await fetch("/api/user/addresses");
      // const data = await response.json();
      // setSavedAddresses(data.addresses);
      console.log("Simulating address fetch");
      // Example addresses:
      // setSavedAddresses([
      //   { firstName: "John", lastName: "Doe", companyName: "", country: "USA", address: "123 Main St", addressTwo: "", town: "Anytown", phone: "555-1234", email: "john.doe@example.com" },
      //   { firstName: "Jane", lastName: "Smith", companyName: "Tech Inc.", country: "Canada", address: "456 Oak Ave", addressTwo: "Apt 2B", town: "Otherville", phone: "555-5678", email: "jane.smith@example.com" },
      // ]);
    };

    fetchAddresses();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addressId = e.target.value;
    setSelectedAddress(addressId);
    if (addressId === "new") {
      // Clear form if "Enter new address" is selected
      handleAddressSelect({
        firstName: "",
        lastName: "",
        companyName: "",
        country: "",
        address: "",
        addressTwo: "",
        town: "",
        phone: "",
        email: "",
      });
    } else {
      const selected = savedAddresses.find((addr, index) => index.toString() === addressId);
      if (selected) {
        handleAddressSelect(selected);
      }
    }
  };

  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Billing details
      </h2>

      {savedAddresses.length > 0 && (
        <div className="mb-5">
          <label htmlFor="savedAddressSelect" className="block mb-2.5">
            Select a saved address
          </label>
          <select
            id="savedAddressSelect"
            value={selectedAddress}
            onChange={handleSelectChange}
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          >
            <option value="new">Enter new address</option>
            {savedAddresses.map((addr, index) => (
              <option key={index} value={index.toString()}>
                {`${addr.firstName} ${addr.lastName} - ${addr.address}, ${addr.town}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
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

        <div className="mb-5.5">
          <label htmlFor="saveAddress" className="flex items-center gap-2">
            <input
              type="checkbox"
              name="saveAddress"
              id="saveAddress"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            Save this address for future use
          </label>
        </div>
      </div>
    </div>
  );
};

export default Billing;