"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Search, ShoppingCart, Filter, Plus, Minus, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SkeletonCard } from "@/components/skeleton-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Breadcrumb } from "@/components/breadcrumb"
import { useCart } from "@/contexts/cart-context"

// Mock data for medicines - this will be shared with the cart page
export const medicineCategories = [
  "All Categories",
  "Antibiotics",
  "Pain Relief",
  "Allergy",
  "Diabetes",
  "Heart Health",
  "Vitamins",
  "First Aid",
]

export const medicines = [
  {
    id: 1,
    name: "Amoxicillin",
    category: "Antibiotics",
    price: 1299,
    image: "/images/Amoxicillin.jpeg?height=200&width=200",
    description: "Broad-spectrum antibiotic used to treat various bacterial infections.",
    detailedDescription:
      "Amoxicillin is a penicillin antibiotic that fights bacteria. It is used to treat many different types of infection caused by bacteria, such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.",
    dosage: "250-500mg three times daily for adults",
    sideEffects: "Diarrhea, stomach upset, nausea, vomiting, rash",
    contraindications: "Allergy to penicillin antibiotics",
    prescription: true,
    stock: 45,
  },
  {
    id: 2,
    name: "Ibuprofen",
    category: "Pain Relief",
    price: 849,
    image: "/images/Ibuprofen.jpg?height=200&width=200",
    description: "Non-steroidal anti-inflammatory drug used for pain relief and reducing inflammation.",
    detailedDescription:
      "Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID). It works by reducing hormones that cause inflammation and pain in the body. It is commonly used to reduce fever and treat pain or inflammation caused by many conditions such as headache, toothache, back pain, arthritis, menstrual cramps, or minor injury.",
    dosage: "200-400mg every 4-6 hours as needed",
    sideEffects: "Stomach pain, heartburn, dizziness, mild headache",
    contraindications: "History of heart attack or stroke, stomach ulcers",
    prescription: false,
    stock: 120,
  },
  {
    id: 3,
    name: "Loratadine",
    category: "Allergy",
    price: 1599,
    image: "/images/Loratadine.webp?height=200&width=200",
    description: "Antihistamine used to relieve allergy symptoms such as sneezing and runny nose.",
    detailedDescription:
      "Loratadine is an antihistamine that reduces the effects of natural chemical histamine in the body. Histamine can produce symptoms of sneezing, itching, watery eyes, and runny nose. It is used to treat sneezing, runny nose, watery eyes, hives, skin rash, itching, and other cold or allergy symptoms.",
    dosage: "10mg once daily",
    sideEffects: "Headache, drowsiness, feeling tired, dry mouth",
    contraindications: "Liver or kidney disease",
    prescription: false,
    stock: 78,
  },
  {
    id: 4,
    name: "Metformin",
    category: "Diabetes",
    price: 1875,
    image: "/images/Metformin.jpg?height=200&width=200",
    description: "Oral medication used to treat type 2 diabetes by improving blood sugar control.",
    detailedDescription:
      "Metformin is an oral diabetes medicine that helps control blood sugar levels. It is used together with diet and exercise to improve blood sugar control in adults with type 2 diabetes. It works by decreasing glucose production in the liver and increasing insulin sensitivity to help your body use insulin better.",
    dosage: "500-1000mg twice daily with meals",
    sideEffects: "Nausea, vomiting, stomach upset, diarrhea, weakness",
    contraindications: "Kidney disease, metabolic acidosis",
    prescription: true,
    stock: 60,
  },
  {
    id: 5,
    name: "Lisinopril",
    category: "Heart Health",
    price: 2250,
    image: "/images/Lisinopril.webp?height=200&width=200",
    description: "ACE inhibitor used to treat high blood pressure and heart failure.",
    detailedDescription:
      "Lisinopril is an ACE inhibitor that is used to treat high blood pressure (hypertension) in adults and children who are at least 6 years old. It works by relaxing blood vessels so that blood can flow more easily. Lisinopril is also used to help treat heart failure and to improve survival after a heart attack.",
    dosage: "10-40mg once daily",
    sideEffects: "Dizziness, headache, dry cough, fatigue",
    contraindications: "History of angioedema, pregnancy",
    prescription: true,
    stock: 35,
  },
  {
    id: 6,
    name: "Vitamin D3",
    category: "Vitamins",
    price: 1425,
    image: "/images/VitD3.jpg?height=200&width=200",
    description: "Supplement to support bone health, immune function, and overall wellness.",
    detailedDescription:
      "Vitamin D3 (cholecalciferol) is a form of vitamin D that helps your body absorb calcium and phosphorus. It is used as a dietary supplement in people who do not get enough vitamin D in their diets to maintain adequate health. Vitamin D is important for the absorption of calcium, which helps maintain strong bones and teeth.",
    dosage: "1000-2000 IU daily",
    sideEffects: "Rare at recommended doses; excessive use may cause nausea, vomiting",
    contraindications: "Hypercalcemia, kidney disease",
    prescription: false,
    stock: 150,
  },
  {
    id: 7,
    name: "Bandage Kit",
    category: "First Aid",
    price: 999,
    image: "/images/MedicineKit.jpeg?height=200&width=200",
    description: "Assorted bandages and wound dressings for minor injuries.",
    detailedDescription:
      "This comprehensive bandage kit contains various sizes of sterile adhesive bandages, gauze pads, medical tape, and antiseptic wipes. It is designed for treating minor cuts, scrapes, and burns. The kit includes waterproof bandages and breathable materials suitable for sensitive skin.",
    dosage: "Apply as needed to clean wounds",
    sideEffects: "None when used as directed",
    contraindications: "None",
    prescription: false,
    stock: 85,
  },
  {
    id: 8,
    name: "Acetaminophen",
    category: "Pain Relief",
    price: 799,
    image: "/images/Acetaminophen.png?height=200&width=200",
    description: "Pain reliever and fever reducer for mild to moderate pain.",
    detailedDescription:
      "Acetaminophen is used to treat mild to moderate pain and to reduce fever. It is commonly used to treat headaches, muscle aches, backaches, toothaches, and cold/flu symptoms. Unlike NSAIDs, acetaminophen does not reduce inflammation but is generally gentler on the stomach.",
    dosage: "325-650mg every 4-6 hours as needed, not exceeding 3000mg per day",
    sideEffects: "Rare at recommended doses; liver damage with excessive use",
    contraindications: "Liver disease, alcohol use",
    prescription: false,
    stock: 110,
  },
]


export default function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [sortBy, setSortBy] = useState("name")
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { addToCart, removeFromCart, getQuantityInCart, getTotalItemsInCart } = useCart()

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle search suggestions
  useEffect(() => {
    if (searchTerm.length > 1) {
      const matchedMedicines = medicines
        .filter(
          (medicine) =>
            medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            medicine.category.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .map((medicine) => medicine.name)
        .slice(0, 5)

      setSuggestions(matchedMedicines)
      setShowSuggestions(matchedMedicines.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchTerm])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Filter medicines based on search term and category
  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || medicine.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Sort medicines
  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    } else if (sortBy === "price-low") {
      return a.price - b.price
    } else if (sortBy === "price-high") {
      return b.price - a.price
    }
    return 0
  })

  // Calculate total items in cart
  const totalItemsInCart = getTotalItemsInCart()

  // Format price in rupees
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  // View medicine details
  const viewMedicineDetails = (medicine: any) => {
    setSelectedMedicine(medicine)
    setIsDetailsDialogOpen(true)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Breadcrumb items={[{ label: "Medicines" }]} />

      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">Medicines</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
          Browse our extensive catalog of medications and health products
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div className="w-full md:w-64 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Filters</h2>
            <Filter className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Categories</h3>
            <div className="space-y-2">
              {medicineCategories.map((category) => (
                <div key={category} className="flex items-center">
                  <Button
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:flex-1">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1" ref={searchInputRef}>
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <Input
                placeholder="Search medicines..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search medicines"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                  <ul className="py-1">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-muted cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/cart">
              <Button variant="outline" className="relative">
                <ShoppingCart className="h-5 w-5 mr-2" aria-hidden="true" />
                Cart
                {totalItemsInCart > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">{totalItemsInCart}</Badge>
                )}
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8)
                .fill(0)
                .map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedMedicines.map((medicine) => (
                <Card key={medicine.id} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={medicine.image || "/placeholder.svg"}
                      alt={medicine.name}
                      fill
                      className="object-cover"
                    />
                    {medicine.prescription && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500">Prescription Required</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{medicine.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{medicine.category}</p>
                    <p className="text-sm line-clamp-2 mb-2">{medicine.description}</p>
                    <p className="font-bold text-lg">{formatPrice(medicine.price)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">In stock: {medicine.stock}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getQuantityInCart(medicine.id) > 0 ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeFromCart(medicine.id)}
                            aria-label={`Decrease quantity of ${medicine.name}`}
                          >
                            <Minus className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <span>{getQuantityInCart(medicine.id)}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => addToCart(medicine.id)}
                            aria-label={`Increase quantity of ${medicine.name}`}
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(medicine.id)}
                          disabled={medicine.prescription}
                          aria-label={medicine.prescription ? "Requires prescription" : `Add ${medicine.name} to cart`}
                        >
                          {medicine.prescription ? "Requires Rx" : "Add to Cart"}
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => viewMedicineDetails(medicine)}
                      aria-label={`View details of ${medicine.name}`}
                    >
                      <Info className="h-4 w-4 mr-2" aria-hidden="true" />
                      Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && sortedMedicines.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No medicines found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {totalItemsInCart > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <Link href="/cart">
            <Button size="lg" className="shadow-lg">
              <ShoppingCart className="h-5 w-5 mr-2" aria-hidden="true" />
              Checkout ({totalItemsInCart})
            </Button>
          </Link>
        </div>
      )}

      {/* Medicine Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedMedicine && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMedicine.name}</DialogTitle>
                <DialogDescription>{selectedMedicine.category}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                <div className="relative h-[200px] md:h-full col-span-1">
                  <Image
                    src={selectedMedicine.image || "/placeholder.svg"}
                    alt={selectedMedicine.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedMedicine.detailedDescription}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Dosage</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMedicine.dosage}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Price</h4>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {formatPrice(selectedMedicine.price)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Side Effects</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMedicine.sideEffects}</p>
                  </div>

                  <div>
                    <h4 className="font-medium">Contraindications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMedicine.contraindications}</p>
                  </div>

                  {selectedMedicine.prescription && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md">
                      <div className="flex items-start">
                        <Badge className="bg-yellow-500 mr-2 mt-0.5">Rx</Badge>
                        <p className="text-sm">
                          This medication requires a valid prescription from a licensed healthcare provider.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className={
                          selectedMedicine.stock > 10
                            ? "bg-green-50 dark:bg-green-900/30"
                            : "bg-red-50 dark:bg-red-900/30"
                        }
                      >
                        {selectedMedicine.stock > 10 ? "In Stock" : "Low Stock"}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {selectedMedicine.stock} units available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
                {getQuantityInCart(selectedMedicine.id) > 0 ? (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={() => removeFromCart(selectedMedicine.id)}>
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <span>{getQuantityInCart(selectedMedicine.id)}</span>
                    <Button variant="outline" size="icon" onClick={() => addToCart(selectedMedicine.id)}>
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => addToCart(selectedMedicine.id)} disabled={selectedMedicine.prescription}>
                    {selectedMedicine.prescription ? "Requires Prescription" : "Add to Cart"}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
