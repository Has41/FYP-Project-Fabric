const Footer = () => {
  return (
    <footer className="bg-black/90 text-white py-8 font-poppins mt-8">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-x-4">
        <div className="flex-1 min-w-[250px] mb-6 px-4">
          <h3 className="text-lg font-bold">Fabric.</h3>
          <p className="mt-2 mb-4 text-slate-300">Discover endless delights your one stop eCommerce destination.</p>
          <div className="flex space-x-3">{/* Add payment method icons here */}</div>
        </div>

        <div className="flex-1 min-w-[150px] mb-6">
          <h4 className="text-lg font-bold">Get to know</h4>
          <ul className="mt-2 space-y-1 text-slate-300">
            <li>About Us</li>
            <li>Product</li>
            <li>Press</li>
            <li>Blog</li>
            <li>Contact Us</li>
          </ul>
        </div>

        <div className="flex-1 min-w-[150px] mb-6">
          <h4 className="text-lg font-bold">Customer Service</h4>
          <ul className="mt-2 space-y-1 text-slate-300">
            <li>Help Center</li>
            <li>Shipping & Delivery</li>
            <li>Exchange & Return</li>
            <li>Payment Method</li>
          </ul>
        </div>

        <div className="flex-1 min-w-[250px] mb-6">
          <h4 className="text-lg font-bold">Contact Information</h4>
          <p className="mt-2 text-slate-300">Call: +00 (244) 4-50-774</p>
          <p className="text-slate-300">Email: info@sattiyas.com</p>
          <p className="text-slate-300">Mon - Fri: 11 am - 9 pm</p>
        </div>
      </div>

      <div className="text-center mt-8 text-slate-300 border-t border-gray-700 pt-4 flex items-center justify-evenly gap-x-8">
        <p>Copyright &copy; 2024, All rights reserved.</p>
        <div className="flex items-center justify-between gap-x-4">
          <p className="mb-2">Privacy Policy</p>
          <p className="mb-2">Terms of Use</p>
          <p className="mb-2">Legal</p>
        </div>
        <div>Icons here</div>
      </div>
    </footer>
  )
}

export default Footer
