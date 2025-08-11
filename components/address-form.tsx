"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

const addressFormSchema = z.object({
  name: z.string().min(2, {
    message: "Address name must be at least 2 characters.",
  }),
  street: z.string().min(5, {
    message: "Street address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  zipCode: z.string().min(5, {
    message: "Zip code must be at least 5 characters.",
  }),
  isDefault: z.boolean().default(false),
})

type AddressFormValues = z.infer<typeof addressFormSchema>

export function AddressManager() {
  const { user, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAuth()
  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    },
  })

  function handleEdit(address: any) {
    setEditingAddress(address)
    form.reset({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    })
    setIsDialogOpen(true)
  }

  function handleAdd() {
    setEditingAddress(null)
    form.reset({
      name: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    })
    setIsDialogOpen(true)
  }

  async function handleDelete(addressId: string) {
    try {
      await removeAddress(addressId)
      setAddresses(addresses.filter((addr) => addr.id !== addressId))
      toast.success("Address removed successfully")
    } catch (error) {
      toast.error("Failed to remove address")
      console.error(error)
    }
  }

  async function handleSetDefault(addressId: string) {
    try {
      await setDefaultAddress(addressId)
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === addressId,
        })),
      )
      toast.success("Default address updated")
    } catch (error) {
      toast.error("Failed to update default address")
      console.error(error)
    }
  }

  async function onSubmit(data: AddressFormValues) {
    try {
      if (editingAddress) {
        // Update existing address
        await updateAddress(editingAddress.id, data)
        setAddresses(addresses.map((addr) => (addr.id === editingAddress.id ? { ...addr, ...data } : addr)))
        toast.success("Address updated successfully")
      } else {
        // Add new address
        const newAddress = await addAddress(data)
        setAddresses([...addresses, newAddress])
        toast.success("Address added successfully")
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast.error("Failed to save address")
      console.error(error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Delivery Addresses</span>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Address
          </Button>
        </CardTitle>
        <CardDescription>Manage your delivery addresses.</CardDescription>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No addresses added yet. Add your first address to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium flex items-center">
                        {address.name}
                        {address.isDefault && (
                          <Badge variant="outline" className="ml-2">
                            Default
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{address.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefault(address.id)}
                          title="Set as default"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(address)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(address.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            <DialogDescription>
              {editingAddress ? "Update your delivery address details." : "Add a new delivery address to your account."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Home, Work, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="123 Main St, Apt 4B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as default address</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save Address</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
