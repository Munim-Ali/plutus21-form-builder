import { z } from "zod";

// Define validation schemas for each field type
export const fieldSchemas = {
  text: z.string().min(3, "Minimum length is 3 characters"),
  dropdown: z.string().nonempty("Please select an option"),
  radio: z.string().nonempty("Please select an option"),
  file: z.instanceof(File, { message: "Please upload a file" }),
  checkbox: z.array(z.string()).nonempty("Please select at least one option"),
  country: z.string().nonempty("Please select a country"),
  date: z.date(),
  phone: z.string().min(10, "Invalid phone number"),
};
