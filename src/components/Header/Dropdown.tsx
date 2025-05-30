import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Dropdown = ({ menuItem, stickyMenu }) => {
  const [dropdownToggler, setDropdownToggler] = useState(false);
  const pathUrl = usePathname();

  // Define common styles as objects for reusability if possible
  const blueColor = "#007bff"; // Example blue color
  const darkTextColor = "#333"; // Example dark text color
  const lightGrayBg = "#f3f4f6"; // Example light gray background
  const customSmFontSize = "0.875rem"; // 14px

  // Styles for the dropdown container (li)
  const containerBaseStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease-out",
    cursor: "pointer",
    zIndex: 10,
    // The 'before' pseudo-element effect is tricky with inline styles.
    // It's not directly possible as an inline style.
    // For the underline effect, you'd typically need a border or a separate div.
    // I'll simulate it with a bottom border if it were a solid line,
    // but the 'expanding from left' effect is not directly achievable inline.
    // For this example, I'll omit the complex 'before' effect for simplicity with inline.
    // If it's a critical feature, you'd need a different approach (e.g., JS to manipulate a border width).
  };

  const containerHoverStyle = {
    // Cannot directly apply :hover styles inline.
    // This would require JS event listeners to change the style object on hover.
  };

  const containerActiveStyle = {
    // For the 'active' state line, we can apply a border.
    // This is a simplification of your 'before:!w-full'
    borderBottom: `3px solid ${blueColor}`,
    borderBottomLeftRadius: "3px",
    borderBottomRightRadius: "3px",
  };

  // Styles for the dropdown toggle (a)
  const toggleBaseStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px", // Similar to gap-1.5
    color: darkTextColor,
    fontSize: customSmFontSize,
    fontWeight: "500",
    textTransform: "capitalize" as React.CSSProperties["textTransform"],
    padding: stickyMenu ? "12px 0" : "16px 0", // xl:py-4 vs xl:py-6
    transition: "color 0.2s ease-in-out",
    textDecoration: "none",
  };

  const toggleHoverStyle = {
    color: blueColor, // Applied via JS state change or external CSS
  };

  const toggleActiveStyle = {
    color: blueColor,
  };

  // Styles for the dropdown arrow (svg)
  const arrowBaseStyle = {
    fill: "currentColor", // Inherits color from parent text
    transition: "transform 0.2s ease-in-out",
    transform: dropdownToggler ? "rotate(180deg)" : "rotate(0deg)",
  };

  // Styles for the dropdown submenu (ul)
  const submenuBaseStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: "0",
    minWidth: "200px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "6px",
    overflow: "hidden",
    listStyle: "none",
    padding: "0",
    margin: "0",
    // Inline styles for display are tricky with hover/visibility,
    // but we can control 'display' or 'visibility' based on 'dropdownToggler' state
    display: dropdownToggler ? "block" : "none", // Or 'flex' if it was a flex container
    // For animation (fade/slide), inline requires more complex JS manipulation of opacity/transform
    opacity: dropdownToggler ? 1 : 0,
    transform: dropdownToggler ? "translateY(0)" : "translateY(-10px)",
    transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
    pointerEvents: dropdownToggler ? "auto" : "none",
  };

  // Styles for submenu items (Link)
  const subitemBaseStyle = {
    display: "flex",
    fontSize: customSmFontSize,
    padding: "7px 18px", // py-[7px] px-4.5
    color: darkTextColor,
    textDecoration: "none",
    transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
  };

  const subitemHoverStyle = {
    color: blueColor,
    backgroundColor: lightGrayBg,
  };

  const subitemActiveStyle = {
    color: blueColor,
    backgroundColor: lightGrayBg,
  };

  // Function to apply hover styles via state change (not ideal for performance/complexity)
  // This is a common pattern for "inline hover" if you absolutely cannot use CSS.
  // const [isToggleHovered, setIsToggleHovered] = useState(false);
  // const [isSubitemHovered, setIsSubitemHovered] = useState({}); // For multiple subitems

  return (
    <li
      style={{
        ...containerBaseStyle,
        ...(pathUrl.includes(menuItem.name) ? containerActiveStyle : {}),
        // For the 'before' pseudo-element, we would need to dynamically add a div here
        // if the expanding line is critical and you're strictly inline.
        // E.g., <div style={{width: pathUrl.includes(menuItem.name) ? '100%' : (isContainerHovered ? '100%' : '0'), ...}}></div>
        // which makes it very complex.
      } as React.CSSProperties}
      // For actual hover effects on container, you'd use onMouseEnter/onMouseLeave
      // to update state, then conditionally apply styles from containerHoverStyle.
      // This increases component re-renders and complexity.
      onMouseEnter={() => setDropdownToggler(true)}
      onMouseLeave={() => setDropdownToggler(false)}
      onClick={() => setDropdownToggler(!dropdownToggler)} // For mobile/touch
    >
      <a
        href="#"
        style={{
          ...toggleBaseStyle,
          ...(pathUrl.includes(menuItem.name) ? toggleActiveStyle : {}),
          // You could also add onMouseEnter/onMouseLeave for the 'a' tag
          // to apply toggleHoverStyle, if it's separate from dropdown open.
        }}
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        {menuItem.name}
        <svg
          style={arrowBaseStyle}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.95363 5.67461C3.13334 5.46495 3.44899 5.44067 3.65866 5.62038L7.99993 9.34147L12.3412 5.62038C12.5509 5.44067 12.8665 5.46495 13.0462 5.67461C13.2259 5.88428 13.2017 6.19993 12.992 6.37964L8.32532 10.3796C8.13808 10.5401 7.86178 10.5401 7.67453 10.3796L3.00787 6.37964C2.7982 6.19993 2.77392 5.88428 2.95363 5.67461Z"
            fill="currentColor"
          />
        </svg>
      </a>

      {/* */}
      {/* The display: 'none' or 'block' is controlled directly by dropdownToggler */}
      {/* Opacity and transform for animation are also directly in the style object */}
      <ul style={submenuBaseStyle}>
        {menuItem.submenu.map((item, i) => {
          // Individual hover state for each subitem, makes it even more complex
          // const [isSubitemCurrentHovered, setIsSubitemCurrentHovered] = useState(false);
          // For simplicity with inline, I'll omit individual subitem hover states.
          // In a real scenario, you'd use CSS for :hover.

          return (
            <li key={i}>
              <Link
                href={item.path}
                style={{
                  ...subitemBaseStyle,
                  ...(pathUrl === item.path ? subitemActiveStyle : {}),
                  // OnMouseEnter/Leave for hover effect would go here if needed per item
                  // onMouseEnter={() => setIsSubitemCurrentHovered(true)}
                  // onMouseLeave={() => setIsSubitemCurrentHovered(false)}
                  // ...(isSubitemCurrentHovered ? subitemHoverStyle : {})
                }}
                onClick={() => setDropdownToggler(false)}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
};

export default Dropdown;