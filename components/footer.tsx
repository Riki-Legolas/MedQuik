import Link from "next/link"
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Package className="h-6 w-6 text-purple-600" />
              MedQuik
            </Link>
            <p className="text-gray-600 mb-4">
              Fast, reliable, and contactless delivery of essential medicines using cutting-edge drone technology.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-500 hover:text-purple-600">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-purple-600">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-purple-600">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-purple-600">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-purple-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-purple-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/medicines" className="text-gray-600 hover:text-purple-600">
                  Medicines
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-gray-600 hover:text-purple-600">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-purple-600">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-purple-600">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-purple-600">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-purple-600">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-purple-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-purple-600">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                <span className="text-gray-600">
                  12/B 19th main road
                  <br />
                  MG Road, Bangalore - 560021
                  <br />
                  Karnataka
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-gray-600">(080) 6363-092343</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-purple-600 mr-2" />
                <a href="mailto:info@medquik.com" className="text-gray-600 hover:text-purple-600">
                  info@medquik.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} MedQuik. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-purple-600">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-purple-600">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="text-sm text-gray-600 hover:text-purple-600">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
