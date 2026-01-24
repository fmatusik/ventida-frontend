
export default function Footer() {

    return (
              <footer className="border-t border-neutral-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">ventida</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Your trusted marketplace for buying and selling quality items.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm">Shop</h4>
              <div className="space-y-2 text-sm text-neutral-600">
                <a href="#" className="block hover:text-black">All Categories</a>
                <a href="#" className="block hover:text-black">Trending</a>
                <a href="#" className="block hover:text-black">New Arrivals</a>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm">Sell</h4>
              <div className="space-y-2 text-sm text-neutral-600">
                <a href="#" className="block hover:text-black">Start Selling</a>
                <a href="#" className="block hover:text-black">Seller Guide</a>
                <a href="#" className="block hover:text-black">Pricing</a>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm">Support</h4>
              <div className="space-y-2 text-sm text-neutral-600">
                <a href="#" className="block hover:text-black">Help Center</a>
                <a href="#" className="block hover:text-black">Safety</a>
                <a href="#" className="block hover:text-black">Contact</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-200 text-sm text-neutral-500 text-center">
            © 2026 Ventida. All rights reserved.
          </div>
        </div>
      </footer>
    )

}