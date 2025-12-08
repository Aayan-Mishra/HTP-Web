import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { 
  Pill, 
  Search, 
  Users, 
  ClipboardList, 
  Shield, 
  Clock, 
  Award,
  Phone,
  MapPin,
  Mail,
  ChevronRight,
  Stethoscope,
  Heart,
  ShieldCheck
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Professional Medical Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-teal-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-teal-600 to-emerald-600 p-2.5 rounded-xl shadow-lg">
                <Pill className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-poppins font-bold text-gray-900">
                  Hometown <span className="text-teal-600">Pharmacy</span>
                </h1>
                <p className="text-xs text-gray-600">Your Trusted Healthcare Partner</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/search" className="text-gray-700 hover:text-teal-600 font-medium transition-colors">
                Medicines
              </Link>
              <Link href="/order" className="text-gray-700 hover:text-teal-600 font-medium transition-colors">
                Order Request
              </Link>
              <Link href="/membership" className="text-gray-700 hover:text-teal-600 font-medium transition-colors">
                Membership
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-teal-600 font-medium transition-colors">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <SignedOut>
                <Link href="/sign-in">
                  <Button variant="outline" className="border-teal-200 hover:bg-teal-50">
                    Login
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    Sign Up
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-teal-200 hover:bg-teal-50">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="hover:bg-teal-50">
                    My Profile
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Medical Professional Design */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 to-emerald-600/5" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold">
                  ✓ Trusted Since 1995
                </span>
              </div>
              
              <h2 className="text-5xl lg:text-6xl font-poppins font-bold text-gray-900 leading-tight">
                Your Health,
                <span className="text-teal-600"> Our Priority</span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Experience compassionate pharmaceutical care with our comprehensive range of services, 
                expert guidance, and commitment to your wellbeing.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/search">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/30 px-8 h-14 text-lg">
                    <Search className="mr-2 h-5 w-5" />
                    Search Medicines
                  </Button>
                </Link>
                <Link href="/order">
                  <Button size="lg" variant="outline" className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 h-14 px-8 text-lg">
                    Place Order
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-teal-600" />
                  <span className="text-sm text-gray-600">Quality pharmacists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-teal-600" />
                  <span className="text-sm text-gray-600">Quality Assured</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 grid grid-cols-2 gap-6">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-teal-100 shadow-xl hover:shadow-2xl transition-shadow">
                  <Stethoscope className="h-12 w-12 text-teal-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Expert Care</h3>
                  <p className="text-sm text-gray-600">Quality pharmacists ready to assist you</p>
                </Card>
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-teal-100 shadow-xl hover:shadow-2xl transition-shadow mt-8">
                  <Clock className="h-12 w-12 text-teal-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Quick Service</h3>
                  <p className="text-sm text-gray-600">Fast order processing and pickup</p>
                </Card>
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-teal-100 shadow-xl hover:shadow-2xl transition-shadow">
                  <Heart className="h-12 w-12 text-teal-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Care First</h3>
                  <p className="text-sm text-gray-600">Your health is our top priority</p>
                </Card>
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-teal-100 shadow-xl hover:shadow-2xl transition-shadow mt-8">
                  <Shield className="h-12 w-12 text-teal-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Secure</h3>
                  <p className="text-sm text-gray-600">Safe and confidential service</p>
                </Card>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-emerald-400/20 blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-poppins font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive pharmaceutical solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/search" className="group">
              <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-teal-200 h-full">
                <div className="bg-teal-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-600 transition-colors">
                  <Search className="h-8 w-8 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-poppins font-semibold mb-3">Medicine Search</h3>
                <p className="text-gray-600 mb-4">
                  Search our comprehensive database of medicines with real-time stock availability
                </p>
                <div className="text-teal-600 font-medium flex items-center">
                  Search Now <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            </Link>

            <Link href="/order" className="group">
              <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-teal-200 h-full">
                <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                  <ClipboardList className="h-8 w-8 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-poppins font-semibold mb-3">Order Request</h3>
                <p className="text-gray-600 mb-4">
                  Place your medicine orders online and we'll have them ready for pickup
                </p>
                <div className="text-teal-600 font-medium flex items-center">
                  Place Order <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            </Link>

            <Link href="/membership" className="group">
              <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-teal-200 h-full">
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <Users className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-poppins font-semibold mb-3">Membership</h3>
                <p className="text-gray-600 mb-4">
                  Join our membership program and enjoy exclusive discounts on purchases
                </p>
                <div className="text-teal-600 font-medium flex items-center">
                  Learn More <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            </Link>

            <Card className="p-8 bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 h-full">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Award className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-poppins font-semibold mb-3">Expert Consultation</h3>
              <p className="text-gray-600 mb-4">
                Get professional advice from our Quality pharmacists
              </p>
              <div className="text-teal-600 font-medium">Available In-Store</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-poppins font-bold mb-4">
              Why Choose Hometown Pharmacy?
            </h2>
            <p className="text-xl text-teal-50 max-w-2xl mx-auto">
              Trusted healthcare partner committed to your wellbeing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-lg w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-poppins font-semibold mb-3">Quality Assured</h3>
              <p className="text-teal-50 leading-relaxed">
                All medicines sourced from authorized distributors with proper certifications and quality checks
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-lg w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-poppins font-semibold mb-3">Quality Pharmacists</h3>
              <p className="text-teal-50 leading-relaxed">
                Our Quality pharmacists provide professional guidance and personalized healthcare advice
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-lg w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-poppins font-semibold mb-3">Member Benefits</h3>
              <p className="text-teal-50 leading-relaxed">
                Exclusive discounts and special offers for our valued members throughout the year
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-poppins font-bold text-gray-900 mb-4">
                Get In Touch
              </h2>
              <p className="text-xl text-gray-600">
                Visit us or reach out for any queries
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="bg-teal-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Phone</h3>
                <p className="text-gray-600">+91 98765 43210</p>
                <p className="text-sm text-gray-500 mt-1">Mon-Sat, 9AM-9PM</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="bg-teal-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <p className="text-gray-600">info@hometownpharmacy.com</p>
                <p className="text-sm text-gray-500 mt-1">24/7 Response</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="bg-teal-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Location</h3>
                <p className="text-gray-600">123 Main Street</p>
                <p className="text-sm text-gray-500 mt-1">Your City, State</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-teal-600 p-2 rounded-lg">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-poppins font-bold text-white">Hometown Pharmacy</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your trusted healthcare partner providing quality pharmaceutical services since 1995.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/search" className="hover:text-teal-400 transition-colors">Search Medicines</Link></li>
                <li><Link href="/order" className="hover:text-teal-400 transition-colors">Place Order</Link></li>
                <li><Link href="/membership" className="hover:text-teal-400 transition-colors">Membership</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-teal-400 transition-colors cursor-pointer">Prescription Services</li>
                <li className="hover:text-teal-400 transition-colors cursor-pointer">Health Consultation</li>
                <li className="hover:text-teal-400 transition-colors cursor-pointer">Home Delivery</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>+91 98765 43210</li>
                <li>info@hometownpharmacy.com</li>
                <li>Mon-Sat: 9AM - 9PM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Hometown Pharmacy. All rights reserved. | Licensed & Certified Pharmacy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
