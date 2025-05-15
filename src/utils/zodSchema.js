import { z } from "zod"

const registerSchema = z
  .object({
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
      .max(100, { message: "Password can't be longer than 100 characters" })
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

const productSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)), { message: "Must be a number" }),
  discount_price: z.string().optional(),
  quantity: z.string().refine((val) => !isNaN(Number(val)), { message: "Must be a number" }),
  category: z.string().min(1, "Required")
  // type: z
  //   .string()
  //   .min(1, "Required")
  //   .refine((val) => ["Shirt", "Bag", "Shoes"].includes(val), {
  //     message: "Type must be either Shirt, Bag or Shoes"
  //   })
})

const orderSchema = z.object({
  designIds: z.array(z.string()).min(1, "Select a design"),
  shippingFee: z.number().min(0, "Fee must be non-negative"),
  paymentMethod: z.enum(["COD", "card"]),
  paymentStatus: z.enum(["pending"])
})

export { registerSchema, loginSchema, productSchema, orderSchema }
