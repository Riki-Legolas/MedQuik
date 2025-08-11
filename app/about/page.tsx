import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Award, Clock, Heart, Users, Leaf } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">About MedQuik</h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          Revolutionizing healthcare delivery through innovative drone technology
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-2 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 mb-6">
            At MedQuik, we believe that access to medication should be fast, reliable, and stress-free. Our mission is
            to leverage cutting-edge drone technology to deliver essential medications to those who need them, when they
            need them most.
          </p>
          <p className="text-lg text-gray-600">
            Founded in 2022, MedQuik was born from a simple idea: what if we could use the latest advances in drone
            technology to solve the age-old problem of medication delivery? Today, we're proud to be at the forefront of
            healthcare logistics, serving thousands of customers with our innovative approach.
          </p>
        </div>
        <div className="relative h-[300px] md:h-[400px]">
          <Image
            src="/images/MM.jpg?height=400&width=600"
            alt="MedQuik Mission"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Safety First",
              description:
                "We prioritize the safety of our customers, their medications, and the communities we serve in every aspect of our operations.",
              icon: <Shield className="h-10 w-10 text-blue-600" />,
            },
            {
              title: "Innovation",
              description:
                "We continuously push the boundaries of what's possible in medication delivery through technological advancement.",
              icon: <Award className="h-10 w-10 text-blue-600" />,
            },
            {
              title: "Reliability",
              description:
                "We understand that medication delivery is time-sensitive, and we're committed to being there when you need us most.",
              icon: <Clock className="h-10 w-10 text-blue-600" />,
            },
            {
              title: "Compassion",
              description:
                "We approach healthcare with empathy, understanding that behind every delivery is a person in need.",
              icon: <Heart className="h-10 w-10 text-blue-600" />,
            },
            {
              title: "Inclusivity",
              description:
                "We strive to make our services accessible to all, regardless of location or mobility constraints.",
              icon: <Users className="h-10 w-10 text-blue-600" />,
            },
            {
              title: "Sustainability",
              description:
                "Our electric drone fleet represents our commitment to environmentally responsible healthcare delivery.",
              icon: <Leaf className="h-10 w-10 text-blue-600" />,
            },
          ].map((value, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-500">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Technology</h2>
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="order-2 md:order-1">
            <h3 className="text-2xl font-bold mb-4">State-of-the-Art Drone Fleet</h3>
            <p className="text-lg text-gray-600 mb-4">
              Our custom-designed delivery drones are built specifically for medication transport, featuring:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Temperature-controlled compartments to maintain medication integrity</li>
              <li>Advanced navigation systems for precise delivery</li>
              <li>Redundant safety mechanisms to ensure reliable operation</li>
              <li>Weather-resistant design for operation in various conditions</li>
              <li>Quiet propulsion systems to minimize noise pollution</li>
              <li>Extended flight range to serve both urban and rural areas</li>
            </ul>
          </div>
          <div className="relative h-[300px] md:h-[400px] order-1 md:order-2">
            <Image
              src="/images/MDT.png?height=400&width=600"
              alt="MedQuik Drone Technology"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-8 text-center">Our Team</h2>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-3xl mx-auto">
          MedQuik brings together experts in healthcare, aviation, technology, and customer service to create an
          unparalleled medication delivery experience.
        </p>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {[
            { name: "S Praneeth", role: "Founder & CEO", image: "/images/praneeth.jpeg?height=300&width=300" },
            { name: "Prakash Patel", role: "CEO", image: "/images/prakash.jpeg?height=300&width=300" },
            { name: "Mariya Carol", role: "CEO", image: "/images/mariya.jpeg?height=300&width=300" },
            { name: "Mounitha N", role: "Head of Operations", image: "/images/mounitha.jpg?height=300&width=300" },
            { name: "Jayalakshmi R.", role: "Head of the Department of Engineering", image: "/images/jayalakshmi.jpg?height=300&width=300" },
            {
              name: "Renita Blossom Monteiro",
              role: "Head of Regulatory Affairs",
              image: "/images/renita.jpg?height=300&width=300",
            },
            { name: "Dr. Latha H. R", role: "Lead Instructor", image: "/images/latha.jpeg?height=300&width=300" },
            { name: "Lisa Thompson", role: "Pharmacy Partnerships", image: "/placeholder.svg?height=300&width=300" },
          ].map((member, index) => (
            <div key={index} className="text-center">
              <div className="relative h-[200px] w-[200px] mx-auto mb-4 overflow-hidden rounded-full">
                <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-gray-500">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
