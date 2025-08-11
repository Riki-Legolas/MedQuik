import Link from "next/link"
import { Breadcrumb } from "@/components/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { HelpCircle, MessageCircle, Phone, Mail, FileText, ArrowRight } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Breadcrumb items={[{ label: "Help & Support" }]} />

      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">Help & Support</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
          Find answers to common questions or get in touch with our support team
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-12">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <HelpCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            <CardTitle>FAQs</CardTitle>
            <CardDescription>Find answers to commonly asked questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="#faqs">
                View FAQs
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            <CardTitle>Live Chat</CardTitle>
            <CardDescription>Chat with our support team in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Start Chat
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>Get in touch with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="#contact">
                Contact Details
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mb-16" id="faqs">
        <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How does drone delivery work?</AccordionTrigger>
            <AccordionContent>
              Our drone delivery system uses autonomous drones to deliver medications directly to your location. Once
              your order is approved, a drone is dispatched from the nearest hub, navigates to your address using GPS,
              and lowers your package at the designated delivery spot. You can track the entire process in real-time
              through our app.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How long does delivery take?</AccordionTrigger>
            <AccordionContent>
              Delivery times typically range from 30-45 minutes depending on your distance from our nearest drone hub,
              weather conditions, and current demand. For emergency medications, we prioritize delivery and aim to reach
              you as quickly as possible.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>What if I need a prescription medication?</AccordionTrigger>
            <AccordionContent>
              For prescription medications, you'll need to upload a valid prescription during checkout. Our pharmacists
              will verify the prescription before your order is approved. You can upload prescriptions in JPG, PNG, or
              PDF format.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
            <AccordionContent>
              We accept credit/debit cards, UPI payments, mobile wallets, and cash on delivery. All online payments are
              processed through secure payment gateways to ensure your financial information remains protected.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>What if my medication requires refrigeration?</AccordionTrigger>
            <AccordionContent>
              Our drones are equipped with temperature-controlled compartments for medications that require specific
              storage conditions. These compartments maintain the appropriate temperature throughout the delivery
              process to ensure your medications remain effective.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Can I track my delivery?</AccordionTrigger>
            <AccordionContent>
              Yes, you can track your delivery in real-time through our app or website. Once your order is dispatched,
              you'll receive a tracking link that shows the drone's current location, estimated time of arrival, and
              delivery status updates.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>What if I'm not home during delivery?</AccordionTrigger>
            <AccordionContent>
              You can specify a safe drop location during checkout where the drone can leave your package if you're not
              available. Alternatively, you can reschedule the delivery through our app or website up to 1 hour before
              the scheduled delivery time.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>How do I return a medication?</AccordionTrigger>
            <AccordionContent>
              For unopened medications, you can request a return within 7 days of delivery. Navigate to your order
              history, select the order, and click "Request Return." Please note that prescription medications and
              refrigerated items cannot be returned once delivered for safety reasons.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mb-16" id="contact">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Reach out to us through any of these channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-medium">Phone Support</h3>
                <p className="text-gray-600 dark:text-gray-400">+91 800-123-4567</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Available 24/7 for emergency support</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">8:00 AM - 8:00 PM for general inquiries</p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-medium">Email Support</h3>
                <p className="text-gray-600 dark:text-gray-400">support@medquik.com</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">We typically respond within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start">
              <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-medium">Live Chat</h3>
                <p className="text-gray-600 dark:text-gray-400">Available on our website and mobile app</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">8:00 AM - 10:00 PM, 7 days a week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Helpful guides and documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-medium">User Guide</h3>
                <p className="text-gray-600 dark:text-gray-400">Complete guide to using MedQuik services</p>
                <Button variant="link" className="p-0 h-auto text-purple-600 dark:text-purple-400">
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="flex items-start">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-medium">Delivery Areas</h3>
                <p className="text-gray-600 dark:text-gray-400">Check if we deliver to your location</p>
                <Button variant="link" className="p-0 h-auto text-purple-600 dark:text-purple-400" asChild>
                  <Link href="/locations">View Coverage Map</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-medium">Privacy & Terms</h3>
                <p className="text-gray-600 dark:text-gray-400">Our policies and terms of service</p>
                <div className="flex gap-4">
                  <Button variant="link" className="p-0 h-auto text-purple-600 dark:text-purple-400" asChild>
                    <Link href="/privacy">Privacy Policy</Link>
                  </Button>
                  <Button variant="link" className="p-0 h-auto text-purple-600 dark:text-purple-400" asChild>
                    <Link href="/terms">Terms of Service</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          Our support team is always ready to assist you with any questions or concerns you may have about our services.
        </p>
        <Button size="lg" asChild>
          <Link href="/contact">
            Contact Support Team
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
