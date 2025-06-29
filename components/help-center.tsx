"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Mail, FileText, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">How can we help you?</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to your questions and learn how to get the most out of TrueTextAI.
        </p>

        <div className="max-w-xl mx-auto mt-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8">Search</Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-primary" />
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Detailed guides and documentation to help you use TrueTextAI effectively.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" asChild>
              <Link href="/help/docs">View Documentation</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-2 text-primary" />
            <CardTitle>FAQs</CardTitle>
            <CardDescription>Find answers to the most commonly asked questions.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" asChild>
              <Link href="#faqs">View FAQs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Mail className="w-12 h-12 mx-auto mb-2 text-primary" />
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Can't find what you're looking for? Our support team is here to help.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" id="faqs">
          <h2 className="text-2xl font-bold mb-6">General FAQs</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="what-is">
              <AccordionTrigger>What is TrueTextAI?</AccordionTrigger>
              <AccordionContent>
                TrueTextAI is an AI-powered platform that helps you rewrite text to make it more human-like and check if
                content is AI-generated. Our tools are designed to help students, professionals, and content creators
                produce high-quality, original content.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-accurate">
              <AccordionTrigger>How accurate is the AI detection?</AccordionTrigger>
              <AccordionContent>
                Our AI detection tool is highly accurate, with a success rate of over 95% for most common AI models.
                However, no detection system is perfect, and results may vary depending on the specific AI model used
                and how the text was generated.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-privacy">
              <AccordionTrigger>How do you handle my data and privacy?</AccordionTrigger>
              <AccordionContent>
                We take data privacy seriously. Your content is processed securely and is not stored permanently unless
                you explicitly save it. We do not use your content to train our models. For more details, please refer
                to our Privacy Policy.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="supported-languages">
              <AccordionTrigger>What languages do you support?</AccordionTrigger>
              <AccordionContent>
                Currently, TrueTextAI primarily supports English. We're working on adding support for more languages in
                the future.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="account">
          <h2 className="text-2xl font-bold mb-6">Account FAQs</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="create-account">
              <AccordionTrigger>How do I create an account?</AccordionTrigger>
              <AccordionContent>
                You can create an account by clicking the "Sign Up" button in the top right corner of the page. You'll
                need to provide your name, email address, and create a password. Alternatively, you can use our email
                code login system for a passwordless experience.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="forgot-password">
              <AccordionTrigger>I forgot my password. How do I reset it?</AccordionTrigger>
              <AccordionContent>
                You can reset your password by clicking the "Forgot password?" link on the login page. You'll receive an
                email with instructions to reset your password. Alternatively, you can use our email code login system
                to log in without a password.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delete-account">
              <AccordionTrigger>How do I delete my account?</AccordionTrigger>
              <AccordionContent>
                You can delete your account from your account settings page. Please note that this action is
                irreversible and will permanently delete all your data.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="features">
          <h2 className="text-2xl font-bold mb-6">Features FAQs</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="paraphraser">
              <AccordionTrigger>How does the paraphraser work?</AccordionTrigger>
              <AccordionContent>
                Our paraphraser uses advanced AI models to rewrite your text while preserving the original meaning. You
                can adjust the paraphrasing strength to control how much the text is changed. The tool is perfect for
                avoiding plagiarism and improving the readability of your content.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ai-checker">
              <AccordionTrigger>How does the AI checker work?</AccordionTrigger>
              <AccordionContent>
                Our AI checker analyzes text patterns, word choices, and other linguistic features to determine if
                content was likely generated by an AI. It provides a confidence score and highlights specific sections
                that appear to be AI-generated.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="assignment-writer">
              <AccordionTrigger>What is the assignment writer?</AccordionTrigger>
              <AccordionContent>
                The assignment writer helps you create high-quality academic content based on your requirements. It can
                generate essays, reports, and other academic documents with proper structure, citations, and formatting.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="billing">
          <h2 className="text-2xl font-bold mb-6">Billing FAQs</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="subscription-plans">
              <AccordionTrigger>What subscription plans do you offer?</AccordionTrigger>
              <AccordionContent>
                We offer three subscription plans: Free, Pro, and Enterprise. The Free plan includes basic features with
                limited usage. The Pro plan offers advanced features and higher usage limits. The Enterprise plan
                provides unlimited usage and additional features for teams and organizations.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment-methods">
              <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="refunds">
              <AccordionTrigger>Do you offer refunds?</AccordionTrigger>
              <AccordionContent>
                Yes, we offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with our
                service, contact our support team within 14 days of your purchase for a full refund.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cancel-subscription">
              <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
              <AccordionContent>
                You can cancel your subscription at any time from your account settings page. Your subscription will
                remain active until the end of the current billing period.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
        <p className="text-muted-foreground mb-6">
          Our support team is available to assist you with any questions or issues.
        </p>
        <Button asChild>
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  )
}
