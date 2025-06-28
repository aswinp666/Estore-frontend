import React from "react";

interface SavedAddress {
  id: string;
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

interface SavedAddressesProps {
  savedAddresses: SavedAddress[];
  onSelectAddress: (address: SavedAddress) => void;
  onDeleteAddress: (id: string) => void;
}

const SavedAddresses: React.FC<SavedAddressesProps> = ({
  savedAddresses,
  onSelectAddress,
  onDeleteAddress,
}) => {
  return (
    <div className="mb-5">
      <label htmlFor="savedAddressSelect" className="block mb-2.5">
        Select a Saved Address
      </label>
      <div className="relative">
        <select
          id="savedAddressSelect"
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedAddress = savedAddresses.find(
              (addr) => addr.id === selectedId
            );
            if (selectedAddress) {
              onSelectAddress(selectedAddress);
            }
          }}
          className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 appearance-none pr-10" // pr-10 for custom arrow space
          defaultValue="" // Default empty option
        >
          <option value="" disabled>
            -- Select an address --
          </option>
          {savedAddresses.map((address) => (
            <option key={address.id} value={address.id}>
              {`${address.firstName} ${address.lastName}, ${address.address}, ${address.town}, ${address.country}`}
            </option>
          ))}
        </select>
        {/* Custom arrow for select input */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
          </svg>
        </div>
      </div>

      {savedAddresses.length > 0 && (
        <div className="mt-4 border-t border-gray-3 pt-4">
          <p className="font-medium text-dark mb-2">Manage Saved Addresses:</p>
          <ul className="space-y-2">
            {savedAddresses.map((address) => (
              <li key={address.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                <span className="text-sm text-gray-700">
                  {`${address.firstName} ${address.lastName}, ${address.address}, ${address.town}`}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteAddress(address.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium ml-4"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;