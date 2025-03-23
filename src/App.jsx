import React, { useState } from "react";
import PhoneInput from "react-phone-number-input";
import DatePicker from "react-datepicker";
import { z } from "zod";
import "react-phone-number-input/style.css";
import "react-datepicker/dist/react-datepicker.css";
import { FaTrash, FaPlus } from "react-icons/fa";
import { fieldSchemas } from "./utils/zodSchema";

const App = () => {
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      label: `Section ${sections.length + 1}`,
      children: [],
      visible: true,
    };
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
  };

  const addField = (type) => {
    if (!selectedSectionId) {
      alert("Please select a section first!");
      return;
    }

    const newField = {
      id: Date.now(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      schema: fieldSchemas[type],
      options:
        type === "dropdown" || type === "checkbox" || type === "radio"
          ? []
          : undefined,
      visible: true,
      dependsOn: null,
      condition: null,
    };

    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === selectedSectionId
          ? { ...section, children: [...section.children, newField] }
          : section
      )
    );
  };

  const addOption = (fieldId, option) => {
    setSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        children: section.children.map((field) =>
          field.id === fieldId
            ? { ...field, options: [...field.options, option] }
            : field
        ),
      }))
    );
  };

  const deleteItem = (id) => {
    setSections((prevSections) =>
      prevSections.filter((section) => section.id !== id)
    );
    setFormData((prevData) => {
      const newData = { ...prevData };
      delete newData[id];
      return newData;
    });
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[id];
      return newErrors;
    });
  };

  const validateField = (id, value) => {
    const field = sections
      .flatMap((section) => section.children)
      .find((f) => f.id === id);
    if (!field) return;

    try {
      field.schema.parse(value);
      setErrors((prev) => ({ ...prev, [id]: "" }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [id]: error.errors[0].message }));
      }
    }
  };

  const handleInputChange = (id, value) => {
    setFormData({ ...formData, [id]: value });
    validateField(id, value);
    updateVisibility();
  };

  const updateVisibility = () => {
    setSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        visible:
          !section.dependsOn ||
          evaluateCondition(section.dependsOn, section.condition),
        children: section.children.map((field) => ({
          ...field,
          visible:
            !field.dependsOn ||
            evaluateCondition(field.dependsOn, field.condition),
        })),
      }))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    let isValid = true;

    sections.forEach((section) => {
      section.children.forEach((field) => {
        try {
          field.schema.parse(formData[field.id]);
          newErrors[field.id] = "";
        } catch (error) {
          if (error instanceof z.ZodError) {
            newErrors[field.id] = error.errors[0].message;
            isValid = false;
          }
        }
      });
    });

    setErrors(newErrors);

    if (isValid) {
      setSubmittedData(formData);
    } else {
      setSubmittedData(null);
    }
  };

  const renderField = (field) => {
    if (!field.visible) return null;

    switch (field.type) {
      case "text":
        return (
          <div>
            <input
              type="text"
              className={`    border border-[#c3cad8bf] p-2 rounded w-full ${
                errors[field.id]
                  ? "  border border-[#c3cad8bf]-[#c3cad8bf]-red-500"
                  : ""
              }`}
              placeholder="Enter text"
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            />
            {errors[field.id] && (
              <p className="text-red-500 text-sm">{errors[field.id]}</p>
            )}
          </div>
        );
      case "dropdown":
        return (
          <div>
            <select
              className={` border border-[#c3cad8bf] p-2 rounded w-full ${
                errors[field.id] ? " border border-[#c3cad8bf]-red-500" : ""
              }`}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            >
              <option value="">Select an option</option>
              {field.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="mt-2">
              <input
                type="text"
                className=" border border-[#c3cad8bf] p-2 rounded w-full"
                placeholder="Add new option"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    addOption(field.id, e.target.value.trim());
                    e.target.value = "";
                  }
                }}
              />
            </div>
            {errors[field.id] && (
              <p className="text-red-500 text-sm">{errors[field.id]}</p>
            )}
          </div>
        );
      case "radio":
        return (
          <div>
            {field.options.map((option, index) => (
              <label key={index} className="block">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />{" "}
                {option}
              </label>
            ))}
            <div className="mt-2">
              <input
                type="text"
                className=" border border-[#c3cad8bf] p-2 rounded w-full"
                placeholder="Add new option"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    addOption(field.id, e.target.value.trim());
                    e.target.value = "";
                  }
                }}
              />
            </div>
            {errors[field.id] && (
              <p className="text-red-500 text-sm">{errors[field.id]}</p>
            )}
          </div>
        );
      case "checkbox":
        return (
          <div>
            {field.options.map((option, index) => (
              <label key={index} className="block">
                <input
                  type="checkbox"
                  value={option}
                  onChange={(e) => {
                    const selected = formData[field.id] || [];
                    const updatedSelected = e.target.checked
                      ? [...selected, option]
                      : selected.filter((item) => item !== option);
                    handleInputChange(field.id, updatedSelected);
                  }}
                />{" "}
                {option}
              </label>
            ))}
            <div className="mt-2">
              <input
                type="text"
                className=" border border-[#c3cad8bf] p-2 rounded w-full"
                placeholder="Add new checkbox item"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    addOption(field.id, e.target.value.trim());
                    e.target.value = "";
                  }
                }}
              />
            </div>
            {errors[field.id] && (
              <p className="text-red-500 text-sm">{errors[field.id]}</p>
            )}
          </div>
        );
      case "file":
        return (
          <div>
            <input
              type="file"
              className={` border border-[#c3cad8bf] p-2 rounded w-full ${
                errors[field.id] ? " border border-[#c3cad8bf]-red-500" : ""
              }`}
              onChange={(e) => handleInputChange(field.id, e.target.files[0])}
            />
            {errors[field.id] && (
              <p className="text-red-500 text-sm">{errors[field.id]}</p>
            )}
          </div>
        );
      case "country":
        return (
          <div>
            <select
              className={` border border-[#c3cad8bf] p-2 rounded w-full ${
                errors[field.id] ? " border border-[#c3cad8bf]-red-500" : ""
              }`}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            >
              <option value="">Select a country</option>
              <option value="US">United States</option>
              <option value="IN">India</option>
              <option value="UK">United Kingdom</option>
            </select>
            {errors[field.id] && (
              <p className="text-red-500 text-sm">{errors[field.id]}</p>
            )}
          </div>
        );
      case "date":
        return (
          <div>
            <DatePicker
              className={` border border-[#c3cad8bf] p-2 rounded w-full ${
                errors[field.id] ? " border border-[#c3cad8bf]-red-500" : ""
              }`}
              selected={formData[field.id] || null}
              onChange={(date) => handleInputChange(field.id, date)}
            />
            {errors[field.id] && (
              <p className="text-red-500 text-sm">{errors[field.id]}</p>
            )}
          </div>
        );
      case "phone":
        return (
          <div>
            <PhoneInput
              international
              defaultCountry="PK"
              value={formData[field.id] || ""}
              onChange={(value) => handleInputChange(field.id, value)}
              className={` border border-[#c3cad8bf] p-2 rounded w-full ${
                errors[field.id] ? " border border-[#c3cad8bf]-red-500" : ""
              }`}
            />
            {errors[field.id] && (
              <p className="text-red-500 text-sm">{errors[field.id]}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Render a section with its fields
  const renderSection = (section) => {
    if (!section.visible) return null; // Hide section if not visible

    return (
      <div
        key={section.id}
        className=" border border-[#c3cad8bf] p-4 rounded-lg mb-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{section.label}</h2>
          <button
            type="button"
            onClick={() => deleteItem(section.id)}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
        </div>
        {section.children.map((field) => (
          <div key={field.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block font-medium">{field.label}</label>
              <button
                type="button"
                onClick={() => deleteItem(field.id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
            {renderField(field)}
          </div>
        ))}
      </div>
    );
  };

  const buttons = [
    { label: "Add Section", onClick: addSection, icon: <FaPlus /> },
    { label: "Add Text Field", onClick: () => addField("text") },
    { label: "Add Dropdown", onClick: () => addField("dropdown") },
    { label: "Add Radio Button", onClick: () => addField("radio") },
    { label: "Add File Upload", onClick: () => addField("file") },
    { label: "Add Checkbox", onClick: () => addField("checkbox") },
    { label: "Add Country", onClick: () => addField("country") },
    { label: "Add Date Picker", onClick: () => addField("date") },
    { label: "Add Phone Number", onClick: () => addField("phone") },
  ];
  return (
    <section className="w-full  flex flex-col items-center justify-start py-20 bg-[#f3f3fe]">
      <h1 className="font-semibold text-4xl">Plutus21 Assessment</h1>
      <section className="w-3/4 bg-white rounded-2xl mt-8 p-10 flex flex-col items-center justify-center shadow-[0_4px_4px_rgba(87,100,126,0.21)]">
        <h2 className="font-semibold text-3xl">Dynamic Form Builder</h2>

        <div className="w-full flex gap-x-2 items-center justify-center flex-wrap mt-8">
          {buttons.map((button, index) => (
            <>
              <button
                key={index}
                onClick={button.onClick}
                className="bg-[#3b2f80] text-sm text-white px-4 py-2 rounded mr-2 flex items-center justify-between mb-4"
              >
                {button.icon} {button.label}
              </button>
            </>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          {sections.map((section) => renderSection(section))}

          {sections.some((section) => section.children.length > 0) && (
            <div className="w-full flex items-center justify-center mt-8">
              <button
                type="submit"
                className="bg-[#3b2f80]  py-2  text-white rounded cursor-pointer text-sm mb-4 min-w-[180px] "
              >
                Submit
              </button>
            </div>
          )}
        </form>
      </section>
      {submittedData && (
        <section className="w-3/4 bg-white rounded-2xl mt-8 p-10 flex flex-col items-center justify-center shadow-[0_4px_4px_rgba(87,100,126,0.21)]">
          <h2 className="text-xl font-bold mb-4">Submitted Data</h2>
          <pre>{JSON.stringify(submittedData, null, 2)}</pre>
        </section>
      )}
    </section>
  );
};

export default App;
