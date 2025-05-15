import { z } from "zod"

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: "Full name is required" })
      .max(100, { message: "Full name can't be longer than 100 characters" }),
    username: z
      .string()
      .min(1, { message: "Username is required" })
      .max(100, { message: "Username can't be longer than 100 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }).min(1, { message: "Email is required" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(100, { message: "Password can't be longer than 100 characters" }),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(100, { message: "Password can't be longer than 100 characters" }),
    phoneNumber: z.string().min(1, { message: "Phone number is required" }),
    address: z.string().min(1, { message: "Address is required" }),
    city: z.string().min(1, { message: "City is required" }),
    role: z.enum(["user", "designer"], {
      errorMap: () => ({ message: "Role is required" })
    })
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is not the same as confirm password",
        path: ["confirmPassword"]
      })
    }
  })

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(3, { message: "Password must be at least 6 characters long" })
})

const editSchema = z.object({
  fullname: z.string().min(1, { message: "Full name is required" }),
  username: z.string().min(1, { message: "Username is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  postalCode: z.string().optional(),
  role: z.enum(["user", "designer"]).optional()
})

const productSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)), { message: "Must be a number" }),
  discount_price: z.string().optional(),
  quantity: z.string().refine((val) => !isNaN(Number(val)), { message: "Must be a number" }),
  category: z.string().min(1, "Required")
})

const orderSchema = z.object({
  designIds: z.array(z.string()).min(1, "Select a design"),
  shippingFee: z.number().min(0, "Fee must be non-negative"),
  paymentMethod: z.enum(["COD", "online"]),
  paymentStatus: z.enum(["pending"]),
  shippingAddress: z.string().min(1, "Shipping address is required")
})

export { registerSchema, loginSchema, productSchema, orderSchema, editSchema }
