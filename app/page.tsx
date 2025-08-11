import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Shield, Award, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-700 to-indigo-500 py-20 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Medicine Delivery <br />
                <span className="text-purple-200">Reimagined</span>
              </h1>
              <p className="max-w-[600px] text-lg md:text-xl text-purple-100">
                Fast, reliable, and contactless delivery of essential medicines right to your doorstep using our
                cutting-edge drone technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                  <Link href="/login">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px]">
            <Image
                src="/images/MDD.png?height=500&width=500"
                alt="MedQuik Drone Delivery"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">How MedQuik Works</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              Our innovative drone delivery system ensures your medications arrive quickly and safely
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Place Your Order</h3>
              <p className="text-gray-500">
                Browse our medicine catalog and place your order through our secure platform
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Rapid Processing</h3>
              <p className="text-gray-500">
                Our pharmacists verify and prepare your order for immediate drone dispatch
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Secure Delivery</h3>
              <p className="text-gray-500">
                Track your delivery in real-time as our drone safely delivers to your location
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Why Choose MedQuik</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              Our service offers unparalleled advantages for your healthcare needs
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Rapid Delivery",
                description: "Get your medications in as little as 30 minutes with our direct drone delivery",
                icon: <Clock className="h-10 w-10 text-purple-600" />,
              },
              {
                title: "Contactless Service",
                description: "Minimize exposure with our completely contactless delivery system",
                icon: <Shield className="h-10 w-10 text-purple-600" />,
              },
              {
                title: "Real-time Tracking",
                description: "Monitor your delivery's progress with our advanced tracking system",
                icon: <MapPin className="h-10 w-10 text-purple-600" />,
              },
              {
                title: "Secure Packaging",
                description: "All medications are securely packaged to ensure safety and privacy",
                icon: <Shield className="h-10 w-10 text-purple-600" />,
              },
              {
                title: "24/7 Availability",
                description: "Emergency medication delivery available around the clock",
                icon: <Clock className="h-10 w-10 text-purple-600" />,
              },
              {
                title: "Certified Service",
                description: "Fully licensed and certified medication delivery service",
                icon: <Award className="h-10 w-10 text-purple-600" />,
              },
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-500">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">What Our Customers Say</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              Hear from people who have experienced the MedQuik difference
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote:
                  "MedQuik delivered my prescription in just 20 minutes during an emergency. Truly life-saving service!",
                author: "Sarah J.",
                location: "Mumbai",
              },
              {
                quote:
                  "As someone with mobility issues, MedQuik has made getting my regular medications so much easier and more convenient.",
                author: "Robert T.",
                location: "Delhi",
              },
              {
                quote:
                  "The tracking feature gave me peace of mind, and the contactless delivery was perfect during flu season.",
                author: "Maria L.",
                location: "Bangalore",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <p className="italic text-gray-600 mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-bold">{testimonial.author[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-purple-700 text-white py-16 px-4 md:px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
            Ready for a Better Way to Get Your Medications?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust MedQuik for their medication needs
          </p>
          <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
            <Link href="/login" className="inline-flex items-center">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
